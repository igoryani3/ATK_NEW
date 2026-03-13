from flask import Blueprint, request, jsonify
from database import db
from models import TripType
from routes.auth import require_role

trip_types_bp = Blueprint('trip_types', __name__, url_prefix='/api/trip-types')


@trip_types_bp.route('', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_trip_types():
    """Get all trip types"""
    trip_types = TripType.query.order_by(TripType.name).all()
    return jsonify([trip_type.to_dict() for trip_type in trip_types])


@trip_types_bp.route('/<int:trip_type_id>', methods=['GET'])
def get_trip_type(trip_type_id):
    """Get a specific trip type"""
    trip_type = TripType.query.get_or_404(trip_type_id)
    return jsonify(trip_type.to_dict())


@trip_types_bp.route('', methods=['POST'])
def create_trip_type():
    """Create a new trip type"""
    data = request.get_json()

    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400

    # Check if trip type already exists
    existing = TripType.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'error': 'Trip type already exists'}), 400

    trip_type = TripType(name=data['name'])
    db.session.add(trip_type)
    db.session.commit()

    return jsonify(trip_type.to_dict()), 201


@trip_types_bp.route('/<int:trip_type_id>', methods=['PUT'])
def update_trip_type(trip_type_id):
    """Update a trip type"""
    trip_type = TripType.query.get_or_404(trip_type_id)
    data = request.get_json()

    if 'name' in data:
        # Check if new name already exists
        existing = TripType.query.filter(
            TripType.name == data['name'],
            TripType.id != trip_type_id
        ).first()
        if existing:
            return jsonify({'error': 'Trip type name already exists'}), 400

        trip_type.name = data['name']

    db.session.commit()
    return jsonify(trip_type.to_dict())


@trip_types_bp.route('/<int:trip_type_id>', methods=['DELETE'])
def delete_trip_type(trip_type_id):
    """Delete a trip type"""
    trip_type = TripType.query.get_or_404(trip_type_id)

    # Check if trip type is used in trips
    if trip_type.trips:
        return jsonify({'error': 'Cannot delete trip type that is used in trips'}), 400

    db.session.delete(trip_type)
    db.session.commit()

    return '', 204
