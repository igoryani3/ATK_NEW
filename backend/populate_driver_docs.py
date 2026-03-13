#!/usr/bin/env python3
"""
Populate driver document information from DB3.xlsx
"""

import pandas as pd
from datetime import datetime
from app import app
from models import Driver
from database import db


def parse_license_series_number(value):
    """Parse license series and number from combined string like '99 10 112020'"""
    if pd.isna(value) or not value:
        return None, None

    parts = str(value).strip().split()
    if len(parts) >= 3:
        series = f"{parts[0]} {parts[1]}"
        number = parts[2]
        return series, number
    return None, None


def parse_passport_series_number(value):
    """Parse passport series and number from combined string like '82 02 681614'"""
    if pd.isna(value) or not value:
        return None, None

    parts = str(value).strip().split()
    if len(parts) >= 3:
        series = f"{parts[0]} {parts[1]}"
        number = parts[2]
        return series, number
    return None, None


def parse_date(value):
    """Parse date from various formats and return Python date object"""
    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.date()

    try:
        dt = pd.to_datetime(value)
        return dt.date()
    except:
        return None


def parse_russian_name(full_name):
    """Parse Russian name from 'Lastname Firstname Patronymic' to 'Firstname Lastname'"""
    parts = full_name.strip().split()
    if len(parts) >= 2:
        lastname = parts[0]
        firstname = parts[1]
        return f"{firstname} {lastname}"
    return full_name


def main():
    # Read Excel file
    df = pd.read_excel('../database temp/DB3.xlsx')

    # Skip header row (index 0) and get actual data
    df = df.iloc[1:].reset_index(drop=True)

    print(f"Found {len(df)} drivers in Excel file")

    with app.app_context():
        updated_count = 0
        not_found_count = 0

        for idx, row in df.iterrows():
            # Skip empty rows
            if pd.isna(row['ФИО']):
                continue

            full_name_excel = str(row['ФИО']).strip()

            # Convert from "Lastname Firstname Patronymic" to "Firstname Lastname"
            search_name = parse_russian_name(full_name_excel)

            # Find driver by name
            driver = Driver.query.filter_by(full_name=search_name).first()

            if not driver:
                print(f"⚠️  Driver not found: {full_name_excel} (searched as: {search_name})")
                not_found_count += 1
                continue

            # Parse and update data
            print(f"✓ Updating: {search_name}")

            # Date of birth
            driver.date_of_birth = parse_date(row['Дата рождения'])

            # Driver's license
            license_series, license_number = parse_license_series_number(row['ВОДИТЕЛЬСКОЕ УДОСТОВЕРЕНИЕ'])
            driver.license_series = license_series
            driver.license_number = license_number
            driver.license_issue_date = parse_date(row['Unnamed: 4'])
            driver.license_expiry_date = parse_date(row['Unnamed: 5'])

            # Passport
            passport_series, passport_number = parse_passport_series_number(row['ПАСПОРТ'])
            driver.passport_series = passport_series
            driver.passport_number = passport_number
            driver.passport_issue_date = parse_date(row['Unnamed: 8'])
            driver.passport_issued_by = str(row['Unnamed: 9']).strip() if pd.notna(row['Unnamed: 9']) else None

            # SNILS
            driver.snils_number = str(row['СНИЛС']).strip() if pd.notna(row['СНИЛС']) else None

            # Tachograph
            driver.tachograph_number = str(row['КАРТА ВОДИТЕЛЯ (ТАХОГРАФ)']).strip() if pd.notna(row['КАРТА ВОДИТЕЛЯ (ТАХОГРАФ)']) else None
            driver.tachograph_issue_date = parse_date(row['Unnamed: 14'])
            driver.tachograph_expiry_date = parse_date(row['Unnamed: 15'])

            updated_count += 1

        # Commit all changes
        db.session.commit()

        print(f"\n✅ Updated {updated_count} drivers")
        print(f"⚠️  Not found: {not_found_count} drivers")


if __name__ == '__main__':
    main()
