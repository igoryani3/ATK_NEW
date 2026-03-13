from flask import Blueprint, request, jsonify
from models import Executor
from database import db
from routes.auth import require_role

executors_bp = Blueprint('executors', __name__)


@executors_bp.route('/api/executors', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_executors():
    """Get all executors"""
    executors = Executor.query.order_by(Executor.name).all()
    return jsonify([executor.to_dict() for executor in executors])


@executors_bp.route('/api/executors', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_executor():
    """Create a new executor"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    # Check for duplicates
    existing = Executor.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'error': 'Executor with this name already exists'}), 400
    
    executor = Executor(name=data['name'])
    db.session.add(executor)
    db.session.commit()
    
    return jsonify(executor.to_dict()), 201


@executors_bp.route('/api/executors/<int:executor_id>', methods=['PUT'])
@require_role('admin', 'dispatcher')
def update_executor(executor_id):
    """Update an executor"""
    executor = Executor.query.get_or_404(executor_id)
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    # Check for duplicates (excluding current executor)
    existing = Executor.query.filter(
        Executor.name == data['name'],
        Executor.id != executor_id
    ).first()
    if existing:
        return jsonify({'error': 'Executor with this name already exists'}), 400
    
    executor.name = data['name']
    db.session.commit()
    
    return jsonify(executor.to_dict())


@executors_bp.route('/api/executors/<int:executor_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_executor(executor_id):
    """Delete an executor"""
    executor = Executor.query.get_or_404(executor_id)
    db.session.delete(executor)
    db.session.commit()

    return jsonify({'message': 'Executor deleted successfully'})


@executors_bp.route('/api/executors/<int:executor_id>/drivers', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_executor_drivers(executor_id):
    """Get all drivers for a specific executor"""
    from models import Driver
    executor = Executor.query.get_or_404(executor_id)
    drivers = Driver.query.filter_by(executor_id=executor_id).all()
    return jsonify([driver.to_dict() for driver in drivers])


@executors_bp.route('/api/executors/<int:executor_id>/vehicles', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_executor_vehicles(executor_id):
    """Get all vehicles for a specific executor"""
    from models import Vehicle
    executor = Executor.query.get_or_404(executor_id)
    vehicles = Vehicle.query.filter_by(executor_id=executor_id).all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles])
