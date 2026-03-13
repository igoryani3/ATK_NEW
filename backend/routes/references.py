from flask import Blueprint, request, jsonify
from models import Driver, Vehicle, Customer, Contract, Executor
from database import db
from routes.auth import require_role
from datetime import datetime

references_bp = Blueprint('references', __name__)

# ============= DRIVERS =============
@references_bp.route('/drivers', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_drivers():
    executor_id = request.args.get('executor_id')
    if executor_id:
        drivers = Driver.query.filter_by(executor_id=executor_id).all()
    else:
        drivers = Driver.query.all()
    return jsonify([driver.to_dict() for driver in drivers]), 200

@references_bp.route('/drivers/<int:driver_id>', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    return jsonify(driver.to_dict()), 200

@references_bp.route('/drivers', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_driver():
    data = request.get_json()

    if not data.get('executor_id'):
        return jsonify({'error': 'executor_id is required'}), 400

    # Parse date fields
    date_of_birth = datetime.fromisoformat(data['date_of_birth']).date() if data.get('date_of_birth') else None
    license_issue_date = datetime.fromisoformat(data['license_issue_date']).date() if data.get('license_issue_date') else None
    license_expiry_date = datetime.fromisoformat(data['license_expiry_date']).date() if data.get('license_expiry_date') else None
    passport_issue_date = datetime.fromisoformat(data['passport_issue_date']).date() if data.get('passport_issue_date') else None
    tachograph_issue_date = datetime.fromisoformat(data['tachograph_issue_date']).date() if data.get('tachograph_issue_date') else None
    tachograph_expiry_date = datetime.fromisoformat(data['tachograph_expiry_date']).date() if data.get('tachograph_expiry_date') else None

    driver = Driver(
        executor_id=data.get('executor_id'),
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        date_of_birth=date_of_birth,
        license_series=data.get('license_series'),
        license_number=data.get('license_number'),
        license_issue_date=license_issue_date,
        license_expiry_date=license_expiry_date,
        license_file_path=data.get('license_file_path'),
        passport_series=data.get('passport_series'),
        passport_number=data.get('passport_number'),
        passport_issue_date=passport_issue_date,
        passport_issued_by=data.get('passport_issued_by'),
        passport_file_path=data.get('passport_file_path'),
        snils_number=data.get('snils_number'),
        tachograph_number=data.get('tachograph_number'),
        tachograph_issue_date=tachograph_issue_date,
        tachograph_expiry_date=tachograph_expiry_date
    )
    db.session.add(driver)
    db.session.commit()
    return jsonify(driver.to_dict()), 201

@references_bp.route('/drivers/<int:driver_id>', methods=['PUT'])
@require_role('admin', 'dispatcher')
def update_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    data = request.get_json()

    if 'executor_id' in data:
        driver.executor_id = data['executor_id']
    if 'full_name' in data:
        driver.full_name = data['full_name']
    if 'phone' in data:
        driver.phone = data['phone']
    if 'date_of_birth' in data:
        driver.date_of_birth = datetime.fromisoformat(data['date_of_birth']).date() if data['date_of_birth'] and data['date_of_birth'].strip() else None
    if 'license_series' in data:
        driver.license_series = data['license_series'] if data['license_series'] else None
    if 'license_number' in data:
        driver.license_number = data['license_number'] if data['license_number'] else None
    if 'license_issue_date' in data:
        driver.license_issue_date = datetime.fromisoformat(data['license_issue_date']).date() if data['license_issue_date'] and data['license_issue_date'].strip() else None
    if 'license_expiry_date' in data:
        driver.license_expiry_date = datetime.fromisoformat(data['license_expiry_date']).date() if data['license_expiry_date'] and data['license_expiry_date'].strip() else None
    if 'license_file_path' in data:
        driver.license_file_path = data['license_file_path']
    if 'passport_series' in data:
        driver.passport_series = data['passport_series'] if data['passport_series'] else None
    if 'passport_number' in data:
        driver.passport_number = data['passport_number'] if data['passport_number'] else None
    if 'passport_issue_date' in data:
        driver.passport_issue_date = datetime.fromisoformat(data['passport_issue_date']).date() if data['passport_issue_date'] and data['passport_issue_date'].strip() else None
    if 'passport_issued_by' in data:
        driver.passport_issued_by = data['passport_issued_by'] if data['passport_issued_by'] else None
    if 'passport_file_path' in data:
        driver.passport_file_path = data['passport_file_path']
    if 'snils_number' in data:
        driver.snils_number = data['snils_number'] if data['snils_number'] else None
    if 'tachograph_number' in data:
        driver.tachograph_number = data['tachograph_number'] if data['tachograph_number'] else None
    if 'tachograph_issue_date' in data:
        driver.tachograph_issue_date = datetime.fromisoformat(data['tachograph_issue_date']).date() if data['tachograph_issue_date'] and data['tachograph_issue_date'].strip() else None
    if 'tachograph_expiry_date' in data:
        driver.tachograph_expiry_date = datetime.fromisoformat(data['tachograph_expiry_date']).date() if data['tachograph_expiry_date'] and data['tachograph_expiry_date'].strip() else None

    db.session.commit()
    return jsonify(driver.to_dict()), 200

@references_bp.route('/drivers/<int:driver_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    db.session.delete(driver)
    db.session.commit()
    return jsonify({'message': 'Driver deleted'}), 200

# ============= VEHICLES =============
@references_bp.route('/vehicles', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_vehicles():
    executor_id = request.args.get('executor_id')
    if executor_id:
        vehicles = Vehicle.query.filter_by(executor_id=executor_id).all()
    else:
        vehicles = Vehicle.query.all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles]), 200

@references_bp.route('/vehicles', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_vehicle():
    data = request.get_json()

    if not data.get('executor_id'):
        return jsonify({'error': 'executor_id is required'}), 400

    vehicle = Vehicle(
        executor_id=data.get('executor_id'),
        license_plate=data.get('license_plate'),
        capacity=data.get('capacity')
    )
    db.session.add(vehicle)
    db.session.commit()
    return jsonify(vehicle.to_dict()), 201

@references_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
@require_role('admin', 'dispatcher')
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()

    if 'executor_id' in data:
        vehicle.executor_id = data['executor_id']
    if 'license_plate' in data:
        vehicle.license_plate = data['license_plate']
    if 'capacity' in data:
        vehicle.capacity = data['capacity']

    db.session.commit()
    return jsonify(vehicle.to_dict()), 200

@references_bp.route('/vehicles/<int:vehicle_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted'}), 200

# ============= CUSTOMERS =============
@references_bp.route('/customers', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_customers():
    customers = Customer.query.all()
    return jsonify([customer.to_dict() for customer in customers]), 200

@references_bp.route('/customers', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_customer():
    data = request.get_json()
    customer = Customer(name=data.get('name'))
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.to_dict()), 201

@references_bp.route('/customers/<int:customer_id>', methods=['PUT'])
@require_role('admin', 'dispatcher')
def update_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    data = request.get_json()

    if 'name' in data:
        customer.name = data['name']

    db.session.commit()
    return jsonify(customer.to_dict()), 200

@references_bp.route('/customers/<int:customer_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    db.session.delete(customer)
    db.session.commit()
    return jsonify({'message': 'Customer deleted'}), 200

# ============= CONTRACTS =============
@references_bp.route('/contracts', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_contracts():
    contracts = Contract.query.all()
    return jsonify([contract.to_dict() for contract in contracts]), 200

@references_bp.route('/contracts/<int:contract_id>', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    return jsonify(contract.to_dict()), 200

@references_bp.route('/contracts', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_contract():
    data = request.get_json()
    contract = Contract(name=data.get('name'))
    db.session.add(contract)
    db.session.commit()
    return jsonify(contract.to_dict()), 201

@references_bp.route('/contracts/<int:contract_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    db.session.delete(contract)
    db.session.commit()
    return jsonify({'message': 'Contract deleted'}), 200
