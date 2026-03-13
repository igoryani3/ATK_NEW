from __future__ import annotations

import json
import os
from collections import defaultdict
from datetime import datetime, date
from typing import Any

from flask import Blueprint, jsonify, request
from google.oauth2 import service_account
from googleapiclient.discovery import build

from database import db
from models import Trip
from routes.auth import require_role

sync_bp = Blueprint('sync', __name__)

SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Must match the Google Sheet structure used by import_trips_from_sheets.py
# (0-indexed columns)
COLUMN_INDICES: dict[str, int] = {
    'date': 0,
    'region': 1,
    'contract': 2,
    'customer': 3,
    'name': 4,
    'trip_type': 5,
    'passengers': 6,
    'time_of_day': 7,
    'dispatch_time': 8,
    'departure_time': 9,
    'route_start': 10,
    'route_end': 11,
    'movement_type': 12,
    'executor': 13,
    'vehicle': 14,
    'driver': 15,
    'driver_phone': 16,
    'price_no_vat': 17,
    'price_with_vat': 18,
    'weight': 19,
}


def _parse_iso_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except Exception:
        return None


def _fmt_time(dt: datetime | None) -> str:
    if not dt:
        return ''
    return dt.strftime('%H:%M')


def _fmt_float(v: float | None) -> str:
    if v is None:
        return ''
    # keep dot; Sheets with USER_ENTERED will understand locale or keep as number
    return str(float(v))


def _get_spreadsheet_id() -> str | None:
    return os.environ.get('GOOGLE_SHEETS_SPREADSHEET_ID')


def _get_credentials():
    json_str = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    json_file = os.environ.get('GOOGLE_SERVICE_ACCOUNT_FILE')

    if json_str:
        info = json.loads(json_str)
        return service_account.Credentials.from_service_account_info(info, scopes=SHEETS_SCOPES)

    if json_file:
        return service_account.Credentials.from_service_account_file(json_file, scopes=SHEETS_SCOPES)

    raise RuntimeError('Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_FILE')


def _build_row(trip: Trip) -> list[Any]:
    # Build 20 columns (A..T) in the same order as COLUMN_INDICES.
    row: list[Any] = ['' for _ in range(max(COLUMN_INDICES.values()) + 1)]

    # date column is ignored by import, but we can write it for readability
    row[COLUMN_INDICES['date']] = trip.trip_date.isoformat() if trip.trip_date else ''

    row[COLUMN_INDICES['region']] = trip.region.name if trip.region else ''
    row[COLUMN_INDICES['contract']] = trip.contract.name if trip.contract else ''
    row[COLUMN_INDICES['customer']] = (trip.customer.name if trip.customer else (trip.customer_name or ''))
    row[COLUMN_INDICES['name']] = trip.name or ''
    row[COLUMN_INDICES['trip_type']] = trip.trip_type.name if trip.trip_type else ''
    row[COLUMN_INDICES['passengers']] = trip.passengers_count if trip.passengers_count is not None else ''
    row[COLUMN_INDICES['time_of_day']] = trip.time_of_day or ''

    row[COLUMN_INDICES['dispatch_time']] = _fmt_time(trip.dispatch_time)
    row[COLUMN_INDICES['departure_time']] = _fmt_time(trip.departure_time)

    row[COLUMN_INDICES['route_start']] = trip.route_start or ''
    row[COLUMN_INDICES['route_end']] = trip.route_end or ''
    row[COLUMN_INDICES['movement_type']] = trip.movement_type or ''

    row[COLUMN_INDICES['executor']] = trip.executor.name if trip.executor else ''
    row[COLUMN_INDICES['vehicle']] = trip.vehicle.license_plate if trip.vehicle else ''
    row[COLUMN_INDICES['driver']] = trip.driver.full_name if trip.driver else (trip.driver_name or '')
    row[COLUMN_INDICES['driver_phone']] = trip.driver_phone or ''

    row[COLUMN_INDICES['price_no_vat']] = _fmt_float(trip.price_no_vat)
    row[COLUMN_INDICES['price_with_vat']] = _fmt_float(trip.price_with_vat)

    # weight ignored
    row[COLUMN_INDICES['weight']] = ''

    return row


def _row_key(trip: Trip) -> str:
    # Anti-dup key
    trip_date = trip.trip_date.isoformat() if trip.trip_date else ''
    t = _fmt_time(trip.departure_time) or _fmt_time(trip.dispatch_time)
    plate = trip.vehicle.license_plate if trip.vehicle else ''
    price = _fmt_float(trip.price_with_vat)
    return '|'.join([
        trip_date,
        t,
        (trip.route_start or '').strip(),
        (trip.route_end or '').strip(),
        plate.strip(),
        price,
    ])


def _existing_keys_for_sheet(service, spreadsheet_id: str, sheet_title: str) -> set[str]:
    # Read A2:T (20 cols). If sheet has fewer cols, API returns what exists.
    rng = f"'{sheet_title}'!A2:T"
    resp = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range=rng).execute()
    values = resp.get('values', [])
    keys: set[str] = set()

    # We rely on same column order. If some columns are missing, pad.
    for r in values:
        row = list(r) + [''] * (20 - len(r))
        date_v = str(row[COLUMN_INDICES['date']] or '').strip()
        time_v = str(row[COLUMN_INDICES['departure_time']] or '').strip() or str(row[COLUMN_INDICES['dispatch_time']] or '').strip()
        rs = str(row[COLUMN_INDICES['route_start']] or '').strip()
        re = str(row[COLUMN_INDICES['route_end']] or '').strip()
        vehicle = str(row[COLUMN_INDICES['vehicle']] or '').strip()
        price = str(row[COLUMN_INDICES['price_with_vat']] or '').strip()
        keys.add('|'.join([date_v, time_v, rs, re, vehicle, price]))

    return keys


@sync_bp.route('/sync/trips-to-sheets', methods=['POST'])
@require_role('admin', 'dispatcher')
def trips_to_sheets():
    body = request.get_json(silent=True) or {}
    start = _parse_iso_date(body.get('start'))
    end = _parse_iso_date(body.get('end'))

    if not start or not end:
        return jsonify({'error': 'start and end are required (YYYY-MM-DD)'}), 400

    if end < start:
        start, end = end, start

    spreadsheet_id = _get_spreadsheet_id()
    if not spreadsheet_id:
        return jsonify({'error': 'Missing GOOGLE_SHEETS_SPREADSHEET_ID'}), 500

    try:
        creds = _get_credentials()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    service = build('sheets', 'v4', credentials=creds, cache_discovery=False)

    # Fetch spreadsheet sheet titles
    meta = service.spreadsheets().get(spreadsheetId=spreadsheet_id, fields='sheets.properties.title').execute()
    titles = {s['properties']['title'] for s in meta.get('sheets', []) if s.get('properties', {}).get('title')}

    trips = (
        Trip.query
        .filter(Trip.trip_date >= start, Trip.trip_date <= end)
        .order_by(Trip.trip_date.asc(), Trip.dispatch_time.asc())
        .all()
    )

    by_day: dict[str, list[Trip]] = defaultdict(list)
    for t in trips:
        if not t.trip_date:
            continue
        by_day[str(t.trip_date.day)].append(t)

    # Fail-fast if any needed sheet missing
    missing = sorted([day for day in by_day.keys() if day not in titles])
    if missing:
        return jsonify({'error': 'Missing sheet(s) for day(s)', 'missingSheets': missing}), 400

    days_processed = 0
    trips_selected = len(trips)
    rows_appended = 0
    rows_skipped_duplicates = 0
    per_day: dict[str, dict[str, int]] = {}

    for day_title, day_trips in sorted(by_day.items(), key=lambda x: int(x[0])):
        existing = _existing_keys_for_sheet(service, spreadsheet_id, day_title)

        new_rows: list[list[Any]] = []
        for trip in day_trips:
            k = _row_key(trip)
            if k in existing:
                rows_skipped_duplicates += 1
                continue
            new_rows.append(_build_row(trip))
            existing.add(k)

        if not new_rows:
            per_day[day_title] = {'appended': 0, 'skipped_duplicates': 0}
            days_processed += 1
            continue

        rng = f"'{day_title}'!A:T"
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=rng,
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body={'values': new_rows},
        ).execute()

        rows_appended += len(new_rows)
        per_day[day_title] = {
            'appended': len(new_rows),
            'skipped_duplicates': 0,
        }
        days_processed += 1

    return jsonify({
        'start': start.isoformat(),
        'end': end.isoformat(),
        'days_processed': days_processed,
        'trips_selected': trips_selected,
        'rows_appended': rows_appended,
        'rows_skipped_duplicates': rows_skipped_duplicates,
        'per_day': per_day,
    }), 200
