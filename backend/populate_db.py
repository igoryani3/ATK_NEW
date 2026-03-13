#!/usr/bin/env python3
"""
Script to populate database from CSV file
"""
import csv
import sys
from app import app
from database import db
from models import Customer, Executor, Driver

def read_csv_data(filepath):
    """Read CSV file with CP1251 encoding"""
    data = []
    with open(filepath, 'r', encoding='cp1251') as f:
        reader = csv.reader(f, delimiter=';')
        header = next(reader)  # Skip header
        for row in reader:
            if len(row) >= 5:
                data.append({
                    'customer': row[0].strip() if row[0] else None,
                    'executor': row[1].strip() if row[1] else None,
                    'executor2': row[2].strip() if row[2] else None,
                    'driver': row[3].strip() if row[3] else None,
                    'phone': row[4].strip() if row[4] else None
                })
    return data

def populate_database(csv_path):
    """Populate database with data from CSV"""
    with app.app_context():
        print("Reading CSV data...")
        data = read_csv_data(csv_path)
        print(f"Found {len(data)} rows")

        # Collect unique customers and executors
        customers_set = set()
        executors_set = set()

        for row in data:
            if row['customer']:
                customers_set.add(row['customer'])
            if row['executor']:
                executors_set.add(row['executor'])
            if row['executor2']:
                executors_set.add(row['executor2'])

        print(f"\nUnique customers: {len(customers_set)}")
        print(f"Unique executors: {len(executors_set)}")

        # Insert customers
        print("\nInserting customers...")
        customer_map = {}
        for customer_name in sorted(customers_set):
            existing = Customer.query.filter_by(name=customer_name).first()
            if not existing:
                customer = Customer(name=customer_name)
                db.session.add(customer)
                db.session.flush()
                customer_map[customer_name] = customer.id
                print(f"  Added: {customer_name}")
            else:
                customer_map[customer_name] = existing.id
                print(f"  Exists: {customer_name}")

        db.session.commit()

        # Insert executors
        print("\nInserting executors...")
        executor_map = {}
        for executor_name in sorted(executors_set):
            existing = Executor.query.filter_by(name=executor_name).first()
            if not existing:
                executor = Executor(name=executor_name)
                db.session.add(executor)
                db.session.flush()
                executor_map[executor_name] = executor.id
                print(f"  Added: {executor_name}")
            else:
                executor_map[executor_name] = existing.id
                print(f"  Exists: {executor_name}")

        db.session.commit()

        # Insert drivers
        print("\nInserting drivers...")
        driver_count = 0
        for row in data:
            driver_name = row['driver']
            phone = row['phone']
            executor_name = row['executor2'] or row['executor']

            if driver_name and executor_name and executor_name in executor_map:
                # Check if driver already exists
                existing = Driver.query.filter_by(
                    full_name=driver_name,
                    executor_id=executor_map[executor_name]
                ).first()

                if not existing:
                    driver = Driver(
                        executor_id=executor_map[executor_name],
                        full_name=driver_name,
                        phone=phone or ''
                    )
                    db.session.add(driver)
                    driver_count += 1
                    print(f"  Added: {driver_name} ({executor_name})")

        db.session.commit()
        print(f"\nTotal drivers added: {driver_count}")
        print("\nDatabase population completed!")

if __name__ == '__main__':
    csv_path = '../database temp/DB.csv'
    populate_database(csv_path)
