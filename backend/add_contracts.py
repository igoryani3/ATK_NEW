#!/usr/bin/env python3
"""
Script to add contracts to database
"""
from app import app
from database import db
from models import Contract

def add_contracts():
    """Add contracts to database"""
    contracts_to_add = [
        'ИП Ерошенко',
        'ИП Осотов Иван',
        'ИП Осотов Николай',
        'ИП Осотова',
        'ООО "Басфор"'
    ]

    with app.app_context():
        print("Adding contracts...")
        added_count = 0

        for contract_name in contracts_to_add:
            existing = Contract.query.filter_by(name=contract_name).first()
            if not existing:
                contract = Contract(name=contract_name)
                db.session.add(contract)
                added_count += 1
                print(f"  Added: {contract_name}")
            else:
                print(f"  Already exists: {contract_name}")

        db.session.commit()
        print(f"\nTotal contracts added: {added_count}")
        print(f"Total contracts in database: {Contract.query.count()}")

if __name__ == '__main__':
    add_contracts()
