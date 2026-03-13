from flask import Blueprint, request, jsonify
from database import db
from models import Region
from routes.auth import require_role

regions_bp = Blueprint('regions', __name__, url_prefix='/api/regions')


@regions_bp.route('', methods=['GET'])
@require_role('admin', 'dispatcher', 'viewer')
def get_regions():
    """Get all regions"""
    regions = Region.query.order_by(Region.name).all()
    return jsonify([region.to_dict() for region in regions])


@regions_bp.route('/<int:region_id>', methods=['GET'])
def get_region(region_id):
    """Get a specific region"""
    region = Region.query.get_or_404(region_id)
    return jsonify(region.to_dict())


@regions_bp.route('', methods=['POST'])
@require_role('admin', 'dispatcher')
def create_region():
    """Create a new region"""
    data = request.get_json()

    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400

    # Check if region already exists
    existing = Region.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({'error': 'Region already exists'}), 400

    region = Region(name=data['name'])
    db.session.add(region)
    db.session.commit()

    return jsonify(region.to_dict()), 201


@regions_bp.route('/<int:region_id>', methods=['PUT'])
def update_region(region_id):
    """Update a region"""
    region = Region.query.get_or_404(region_id)
    data = request.get_json()

    if 'name' in data:
        # Check if new name already exists
        existing = Region.query.filter(
            Region.name == data['name'],
            Region.id != region_id
        ).first()
        if existing:
            return jsonify({'error': 'Region name already exists'}), 400

        region.name = data['name']

    db.session.commit()
    return jsonify(region.to_dict())


@regions_bp.route('/<int:region_id>', methods=['DELETE'])
def delete_region(region_id):
    """Delete a region"""
    region = Region.query.get_or_404(region_id)

    # Check if region is used in trips
    if region.trips:
        return jsonify({'error': 'Cannot delete region that is used in trips'}), 400

    db.session.delete(region)
    db.session.commit()

    return '', 204
