#!/usr/bin/env python3
"""
Script to populate vehicles from DB2.xlsx
"""
import openpyxl
from app import app
from database import db
from models import Executor, Vehicle

def read_vehicles_excel(filepath):
    """Read vehicles Excel file"""
    data = []
    wb = openpyxl.load_workbook(filepath)
    ws = wb.active

    # Skip header row
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row and len(row) >= 4:
            data.append({
                'executor': str(row[0]).strip() if row[0] else None,
                'vehicle_model': str(row[1]).strip() if row[1] else None,
                'license_plate': str(row[2]).strip() if row[2] else None,
                'capacity': int(row[3]) if row[3] and isinstance(row[3], (int, float)) else None
            })
    return data

def populate_vehicles(excel_path):
    """Populate vehicles from Excel"""
    with app.app_context():
        print("Reading Excel data...")
        data = read_vehicles_excel(excel_path)
        print(f"Found {len(data)} vehicle rows")

        # Collect unique executors
        executors_set = set()
        for row in data:
            if row['executor'] and row['executor'] != 'None':
                executors_set.add(row['executor'])

        print(f"\nUnique executors: {len(executors_set)}")

        # Create executors that don't exist
        print("\nChecking executors...")
        executor_map = {}
        for executor_name in sorted(executors_set):
            existing = Executor.query.filter_by(name=executor_name).first()
            if not existing:
                executor = Executor(name=executor_name)
                db.session.add(executor)
                db.session.flush()
                executor_map[executor_name] = executor.id
                print(f"  Added executor: {executor_name}")
            else:
                executor_map[executor_name] = existing.id
                print(f"  Exists: {executor_name}")

        db.session.commit()

        # Insert vehicles
        print("\nInserting vehicles...")
        vehicle_count = 0
        skipped_count = 0

        for row in data:
            executor_name = row['executor']
            license_plate = row['license_plate']
            capacity = row['capacity']

            if (executor_name and executor_name != 'None' and
                license_plate and license_plate != 'None' and
                executor_name in executor_map):

                # Check if vehicle already exists
                existing = Vehicle.query.filter_by(license_plate=license_plate).first()

                if not existing:
                    vehicle = Vehicle(
                        executor_id=executor_map[executor_name],
                        license_plate=license_plate,
                        capacity=capacity
                    )
                    db.session.add(vehicle)
                    vehicle_count += 1
                    print(f"  Added: {license_plate} ({executor_name}) - {capacity} мест")
                else:
                    skipped_count += 1
                    print(f"  Skipped (exists): {license_plate}")

        db.session.commit()
        print(f"\nTotal vehicles added: {vehicle_count}")
        print(f"Total vehicles skipped: {skipped_count}")
        print(f"Total vehicles in database: {Vehicle.query.count()}")
        print("\nDatabase population completed!")

if __name__ == '__main__':
    excel_path = '../database temp/DB2.xlsx'
    populate_vehicles(excel_path)
