#!/usr/bin/env python3
"""
Script to clear corrupted data from database
"""
from app import app
from database import db
from models import Customer, Executor, Driver

def clear_data():
    """Clear all customers, executors, and drivers"""
    with app.app_context():
        print("Clearing database...")

        # Delete in correct order (drivers first due to foreign keys)
        driver_count = Driver.query.count()
        Driver.query.delete()
        print(f"Deleted {driver_count} drivers")

        executor_count = Executor.query.count()
        Executor.query.delete()
        print(f"Deleted {executor_count} executors")

        customer_count = Customer.query.count()
        Customer.query.delete()
        print(f"Deleted {customer_count} customers")

        db.session.commit()
        print("\nDatabase cleared successfully!")

if __name__ == '__main__':
    clear_data()
