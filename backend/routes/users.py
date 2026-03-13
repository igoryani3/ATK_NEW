from flask import Blueprint, request, jsonify, session
from models import User
from database import db
from routes.auth import require_role

users_bp = Blueprint('users', __name__)


@users_bp.route('/api/users', methods=['GET'])
@require_role('admin')
def get_users():
    """Get all users (admin only)"""
    users = User.query.order_by(User.username).all()
    return jsonify([user.to_dict() for user in users]), 200


@users_bp.route('/api/users', methods=['POST'])
@require_role('admin')
def create_user():
    """Create a new user (admin only)"""
    data = request.get_json()

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', 'viewer')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if role not in ('admin', 'dispatcher', 'viewer'):
        return jsonify({'error': 'Invalid role. Allowed: admin, dispatcher, viewer'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'User with this username already exists'}), 400

    user = User(username=username, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@users_bp.route('/api/users/<int:user_id>', methods=['PUT'])
@require_role('admin')
def update_user(user_id):
    """Update user role or password (admin only)"""
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    new_role = data.get('role')
    new_password = data.get('password', '').strip()

    if new_role:
        if new_role not in ('admin', 'dispatcher', 'viewer'):
            return jsonify({'error': 'Invalid role. Allowed: admin, dispatcher, viewer'}), 400
        user.role = new_role

    if new_password:
        user.set_password(new_password)

    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@require_role('admin')
def delete_user(user_id):
    """Delete a user (admin only). Cannot delete yourself."""
    if session.get('user_id') == user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200
