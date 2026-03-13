from flask import Blueprint, request, jsonify
import pandas as pd
from datetime import datetime, timedelta
import os

calc_bp = Blueprint('calc', __name__)

CSV_PATH = os.path.join(os.path.dirname(__file__), 'Развозки (расписание) - Расписание.csv')

def load_routes_data():
    """Load and parse CSV data"""
    df = pd.read_csv(CSV_PATH, skiprows=2)
    df.columns = [
        'region', 'contract', 'customer', 'route_name', 'type', 'capacity',
        'time_of_day', 'pickup_time', 'departure_time', 'start_point', 'end_point',
        'route_type', 'executor', 'vehicle_number', 'driver', 'driver_phone',
        'price_excl_vat', 'price_incl_vat', 'weight', 'status', 'weekdays',
        'pdf_link', 'intermediate_stops', 'navigation_route', 'notes'
    ]

    # Clean price columns
    df['price_excl_vat'] = df['price_excl_vat'].astype(str).str.replace(',', '.').str.replace(' ', '')
    df['price_incl_vat'] = df['price_incl_vat'].astype(str).str.replace(',', '.').str.replace(' ', '')

    df['price_excl_vat'] = pd.to_numeric(df['price_excl_vat'], errors='coerce').fillna(0)
    df['price_incl_vat'] = pd.to_numeric(df['price_incl_vat'], errors='coerce').fillna(0)

    return df

def parse_weekdays(weekday_str):
    """Convert weekday string to list of day numbers (0=Monday, 6=Sunday)"""
    if pd.isna(weekday_str) or weekday_str == '':
        return []

    day_map = {
        'ПН': 0, 'ВТ': 1, 'СР': 2, 'ЧТ': 3, 'ПТ': 4, 'СБ': 5, 'ВС': 6
    }

    days = []
    for day_abbr, day_num in day_map.items():
        if day_abbr in str(weekday_str):
            days.append(day_num)

    return days

def count_working_days(start_date, end_date, weekdays):
    """Count working days in date range based on weekdays"""
    if not weekdays:
        return 0

    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')

    count = 0
    current = start
    while current <= end:
        if current.weekday() in weekdays:
            count += 1
        current += timedelta(days=1)

    return count

@calc_bp.route('/calculate', methods=['POST'])
def calculate():
    """Calculate route costs based on filters and date range"""
    try:
        data = request.json
        filters = data.get('filters', {})
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        include_vat = data.get('include_vat', False)

        if not start_date or not end_date:
            return jsonify({'error': 'Start and end dates are required'}), 400

        df = load_routes_data()

        # Apply filters
        if filters.get('region'):
            df = df[df['region'] == filters['region']]

        if filters.get('contract'):
            df = df[df['contract'] == filters['contract']]

        if filters.get('customer'):
            df = df[df['customer'] == filters['customer']]

        if filters.get('executor'):
            df = df[df['executor'] == filters['executor']]

        if filters.get('time_of_day'):
            df = df[df['time_of_day'] == filters['time_of_day']]

        if filters.get('route_type'):
            df = df[df['route_type'] == filters['route_type']]

        # Only active routes
        df = df[df['status'] == 'Активен']

        # Calculate costs
        results = []
        total_cost = 0
        total_trips = 0

        price_column = 'price_incl_vat' if include_vat else 'price_excl_vat'

        for _, row in df.iterrows():
            weekdays = parse_weekdays(row['weekdays'])
            working_days = count_working_days(start_date, end_date, weekdays)

            if working_days > 0:
                route_cost = row[price_column] * working_days
                total_cost += route_cost
                total_trips += working_days

                results.append({
                    'route_name': row['route_name'],
                    'customer': row['customer'],
                    'executor': row['executor'],
                    'region': row['region'],
                    'time_of_day': row['time_of_day'],
                    'price_per_trip': float(row[price_column]),
                    'working_days': working_days,
                    'total_cost': float(route_cost),
                    'weekdays': row['weekdays']
                })

        return jsonify({
            'routes': results,
            'summary': {
                'total_cost': float(total_cost),
                'total_trips': total_trips,
                'total_routes': len(results),
                'include_vat': include_vat
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@calc_bp.route('/filters', methods=['GET'])
def get_filters():
    """Get available filter options"""
    try:
        df = load_routes_data()

        return jsonify({
            'regions': sorted(df['region'].dropna().unique().tolist()),
            'contracts': sorted(df['contract'].dropna().unique().tolist()),
            'customers': sorted(df['customer'].dropna().unique().tolist()),
            'executors': sorted(df['executor'].dropna().unique().tolist()),
            'time_of_day': sorted(df['time_of_day'].dropna().unique().tolist()),
            'route_types': sorted(df['route_type'].dropna().unique().tolist())
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
