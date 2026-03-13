from flask import Blueprint, request, jsonify
from database import db
from models import RouteTemplate, Trip
from routes.auth import require_role
from datetime import datetime, timedelta

route_templates_bp = Blueprint('route_templates', __name__, url_prefix='/api/route-templates')

# Day of week mapping
DAY_MAPPING = {
    'Пн': 0,  # Monday
    'Вт': 1,  # Tuesday
    'Ср': 2,  # Wednesday
    'Чт': 3,  # Thursday
    'Пт': 4,  # Friday
    'Сб': 5,  # Saturday
    'Вс': 6   # Sunday
}


def _parse_time(time_str, date):
    """Parse time string (HH:MM) and combine with date to create datetime"""
    if not time_str:
        return None
    try:
        hours, minutes = map(int, time_str.split(':'))
        return datetime.combine(date, datetime.min.time().replace(hour=hours, minute=minutes))
    except:
        return None


def generate_trips_from_template(template):
    """Generate Trip records from a RouteTemplate based on days_of_week and end_date"""
    if not template.days_of_week or not template.end_date:
        return 0  # No schedule defined

    # Parse selected days
    selected_days = [day.strip() for day in template.days_of_week.split(',') if day.strip()]
    if not selected_days:
        return 0

    # Convert to weekday numbers
    weekday_numbers = [DAY_MAPPING[day] for day in selected_days if day in DAY_MAPPING]
    if not weekday_numbers:
        return 0

    # Start from today
    start_date = datetime.now().date()
    end_date = template.end_date

    if end_date < start_date:
        return 0  # End date is in the past

    trips_created = 0
    current_date = start_date

    # Iterate through dates until end_date
    while current_date <= end_date:
        # Check if current day matches any selected weekday
        if current_date.weekday() in weekday_numbers:
            # Build query for existing trip check
            query = Trip.query.filter(Trip.trip_date == current_date)

            # Add filters only for non-NULL fields to handle NULL comparisons properly
            if template.contract_id is not None:
                query = query.filter(Trip.contract_id == template.contract_id)
            else:
                query = query.filter(Trip.contract_id.is_(None))

            if template.customer_id is not None:
                query = query.filter(Trip.customer_id == template.customer_id)
            else:
                query = query.filter(Trip.customer_id.is_(None))

            if template.route_start is not None:
                query = query.filter(Trip.route_start == template.route_start)
            else:
                query = query.filter(Trip.route_start.is_(None))

            if template.route_end is not None:
                query = query.filter(Trip.route_end == template.route_end)
            else:
                query = query.filter(Trip.route_end.is_(None))

            existing_trip = query.first()

            if not existing_trip:
                # Create new trip
                trip = Trip(
                    trip_date=current_date,
                    name=template.name,
                    contract_id=template.contract_id,
                    customer_id=template.customer_id,
                    region_id=template.region_id,
                    trip_type_id=template.trip_type_id,
                    executor_id=template.executor_id,
                    driver_id=template.driver_id,
                    vehicle_id=template.vehicle_id,
                    movement_type=template.movement_type,
                    passengers_count=template.passengers_count,
                    time_of_day=template.time_of_day,
                    dispatch_time=_parse_time(template.dispatch_time, current_date) if template.dispatch_time else None,
                    departure_time=_parse_time(template.departure_time, current_date) if template.departure_time else None,
                    route_start=template.route_start,
                    route_end=template.route_end,
                    price_no_vat=template.price_no_vat,
                    price_with_vat=template.price_with_vat
                )
                db.session.add(trip)
                trips_created += 1

        current_date += timedelta(days=1)

    return trips_created


@route_templates_bp.route('', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_all_route_templates():
    """Get all route templates"""
    try:
        templates = RouteTemplate.query.order_by(RouteTemplate.name).all()
        return jsonify([template.to_dict() for template in templates]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@route_templates_bp.route('/<int:template_id>', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_route_template(template_id):
    """Get a specific route template by ID"""
    try:
        template = RouteTemplate.query.get_or_404(template_id)
        return jsonify(template.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@route_templates_bp.route('', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_route_template():
    """Create a new route template"""
    try:
        data = request.get_json()

        # Parse end_date if provided
        end_date = None
        if data.get('end_date'):
            try:
                end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400

        template = RouteTemplate(
            name=data.get('name'),
            contract_id=data.get('contract_id'),
            customer_id=data.get('customer_id'),
            region_id=data.get('region_id'),
            trip_type_id=data.get('trip_type_id'),
            executor_id=data.get('executor_id'),
            driver_id=data.get('driver_id'),
            driver_phone=data.get('driver_phone'),
            vehicle_id=data.get('vehicle_id'),
            movement_type=data.get('movement_type'),
            passengers_count=data.get('passengers_count'),
            time_of_day=data.get('time_of_day'),
            dispatch_time=data.get('dispatch_time'),
            departure_time=data.get('departure_time'),
            route_start=data.get('route_start'),
            route_end=data.get('route_end'),
            price_no_vat=data.get('price_no_vat'),
            price_with_vat=data.get('price_with_vat'),
            days_of_week=data.get('days_of_week'),
            end_date=end_date
        )

        db.session.add(template)
        db.session.commit()

        return jsonify(template.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@route_templates_bp.route('/<int:template_id>', methods=['PUT'])
@require_role('admin', 'dispatcher')
def update_route_template(template_id):
    """Update an existing route template"""
    try:
        template = RouteTemplate.query.get_or_404(template_id)
        data = request.get_json()

        # Update fields
        if 'name' in data:
            template.name = data['name']
        if 'contract_id' in data:
            template.contract_id = data['contract_id']
        if 'customer_id' in data:
            template.customer_id = data['customer_id']
        if 'region_id' in data:
            template.region_id = data['region_id']
        if 'trip_type_id' in data:
            template.trip_type_id = data['trip_type_id']
        if 'executor_id' in data:
            template.executor_id = data['executor_id']
        if 'driver_id' in data:
            template.driver_id = data['driver_id']
        if 'driver_phone' in data:
            template.driver_phone = data['driver_phone']
        if 'vehicle_id' in data:
            template.vehicle_id = data['vehicle_id']
        if 'movement_type' in data:
            template.movement_type = data['movement_type']
        if 'passengers_count' in data:
            template.passengers_count = data['passengers_count']
        if 'time_of_day' in data:
            template.time_of_day = data['time_of_day']
        if 'dispatch_time' in data:
            template.dispatch_time = data['dispatch_time']
        if 'departure_time' in data:
            template.departure_time = data['departure_time']
        if 'route_start' in data:
            template.route_start = data['route_start']
        if 'route_end' in data:
            template.route_end = data['route_end']
        if 'price_no_vat' in data:
            template.price_no_vat = data['price_no_vat']
        if 'price_with_vat' in data:
            template.price_with_vat = data['price_with_vat']
        if 'days_of_week' in data:
            template.days_of_week = data['days_of_week']
        if 'end_date' in data:
            if data['end_date']:
                try:
                    template.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
            else:
                template.end_date = None

        db.session.commit()

        return jsonify(template.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@route_templates_bp.route('/<int:template_id>', methods=['DELETE'])
@require_role('admin', 'dispatcher')
def delete_route_template(template_id):
    """Delete a route template"""
    try:
        template = RouteTemplate.query.get_or_404(template_id)
        db.session.delete(template)
        db.session.commit()
        return jsonify({'message': 'Route template deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@route_templates_bp.route('/<int:template_id>/generate-trips', methods=['POST'])
@require_role('admin', 'dispatcher')
def generate_trips(template_id):
    """Manually trigger trip generation for a template"""
    try:
        template = RouteTemplate.query.get_or_404(template_id)
        trips_created = generate_trips_from_template(template)
        db.session.commit()
        return jsonify({
            'message': f'Successfully generated {trips_created} trips',
            'trips_created': trips_created
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
