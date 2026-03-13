from flask import Blueprint, request, jsonify
from models import Trip
from database import db
from datetime import datetime
from routes.auth import require_role

trips_bp = Blueprint('trips', __name__)

def _parse_time_to_datetime(time_str, date):
    """Parse time string (HH:MM) and combine with date to create datetime"""
    if not time_str or not date:
        return None
    try:
        hours, minutes = map(int, time_str.split(':'))
        return datetime.combine(date, datetime.min.time().replace(hour=hours, minute=minutes))
    except:
        return None

@trips_bp.route('', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_trips():
    """Get all trips with optional filtering"""
    trips = Trip.query.order_by(Trip.created_at.desc()).all()
    return jsonify([trip.to_dict() for trip in trips]), 200

@trips_bp.route('/<int:trip_id>', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_trip(trip_id):
    """Get single trip by ID"""
    trip = Trip.query.get_or_404(trip_id)
    return jsonify(trip.to_dict()), 200

@trips_bp.route('', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_trip():
    """Create a new trip"""
    data = request.get_json()

    # Parse trip date
    trip_date = None
    if data.get('trip_date'):
        try:
            trip_date = datetime.strptime(data.get('trip_date'), '%Y-%m-%d').date()
        except:
            pass

    # Parse time fields (HH:MM format)
    dispatch_time = _parse_time_to_datetime(data.get('dispatch_time'), trip_date)
    departure_time = _parse_time_to_datetime(data.get('departure_time'), trip_date)

    trip = Trip(
        name=data.get('name'),
        trip_date=trip_date,
        contract_id=data.get('contract_id'),
        customer_id=data.get('customer_id'),
        customer_name=data.get('customer_name'),
        region_id=data.get('region_id'),
        trip_type_id=data.get('trip_type_id'),
        executor_id=data.get('executor_id'),
        driver_id=data.get('driver_id'),
        driver_name=data.get('driver_name'),
        driver_phone=data.get('driver_phone'),
        vehicle_id=data.get('vehicle_id'),
        movement_type=data.get('movement_type'),
        passengers_count=data.get('passengers_count'),
        time_of_day=data.get('time_of_day'),
        dispatch_time=dispatch_time,
        departure_time=departure_time,
        route_start=data.get('route_start'),
        route_end=data.get('route_end'),
        price_no_vat=data.get('price_no_vat'),
        price_with_vat=data.get('price_with_vat')
    )

    db.session.add(trip)
    db.session.commit()

    return jsonify(trip.to_dict()), 201

@trips_bp.route('/<int:trip_id>', methods=['PUT'])
@require_role('admin', 'dispatcher')
def update_trip(trip_id):
    """Update existing trip"""
    trip = Trip.query.get_or_404(trip_id)
    data = request.get_json()

    # Update trip date
    if 'trip_date' in data and data['trip_date']:
        try:
            trip.trip_date = datetime.strptime(data['trip_date'], '%Y-%m-%d').date()
        except:
            pass

    # Update time fields (HH:MM format)
    if 'dispatch_time' in data:
        trip.dispatch_time = _parse_time_to_datetime(data['dispatch_time'], trip.trip_date)

    if 'departure_time' in data:
        trip.departure_time = _parse_time_to_datetime(data['departure_time'], trip.trip_date)

    # Update basic fields
    if 'name' in data:
        trip.name = data['name']

    # Update FK fields
    if 'contract_id' in data:
        trip.contract_id = data['contract_id']
    if 'customer_id' in data:
        trip.customer_id = data['customer_id']
    if 'customer_name' in data:
        trip.customer_name = data['customer_name']
    if 'region_id' in data:
        trip.region_id = data['region_id']
    if 'trip_type_id' in data:
        trip.trip_type_id = data['trip_type_id']
    if 'executor_id' in data:
        trip.executor_id = data['executor_id']
    if 'driver_id' in data:
        trip.driver_id = data['driver_id']
    if 'driver_name' in data:
        trip.driver_name = data['driver_name']
    if 'driver_phone' in data:
        trip.driver_phone = data['driver_phone']
    if 'vehicle_id' in data:
        trip.vehicle_id = data['vehicle_id']

    # Update other fields
    if 'movement_type' in data:
        trip.movement_type = data['movement_type']
    if 'passengers_count' in data:
        trip.passengers_count = data['passengers_count']
    if 'time_of_day' in data:
        trip.time_of_day = data['time_of_day']
    if 'route_start' in data:
        trip.route_start = data['route_start']
    if 'route_end' in data:
        trip.route_end = data['route_end']
    if 'price_no_vat' in data:
        trip.price_no_vat = data['price_no_vat']
    if 'price_with_vat' in data:
        trip.price_with_vat = data['price_with_vat']

    db.session.commit()

    return jsonify(trip.to_dict()), 200

@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_trip(trip_id):
    """Delete a trip"""
    trip = Trip.query.get_or_404(trip_id)
    db.session.delete(trip)
    db.session.commit()

    return jsonify({'message': 'Trip deleted successfully'}), 200

@trips_bp.route('/month-summary/<string:month>', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_month_summary(month):
    """Get trip count per day for a given month (format: YYYY-MM)"""
    try:
        year, month_num = month.split('-')
        year = int(year)
        month_num = int(month_num)

        # Query trips for the given month
        trips = Trip.query.filter(
            db.extract('year', Trip.trip_date) == year,
            db.extract('month', Trip.trip_date) == month_num
        ).all()

        # Count trips per day
        summary = {}
        for trip in trips:
            if trip.trip_date:
                date_str = trip.trip_date.strftime('%Y-%m-%d')
                summary[date_str] = summary.get(date_str, 0) + 1

        return jsonify(summary), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@trips_bp.route('/by-date/<string:date>', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_trips_by_date(date):
    """Get all trips for a specific date (format: YYYY-MM-DD)"""
    try:
        trip_date = datetime.strptime(date, '%Y-%m-%d').date()
        trips = Trip.query.filter_by(trip_date=trip_date).order_by(Trip.dispatch_time).all()
        return jsonify([trip.to_dict() for trip in trips]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
