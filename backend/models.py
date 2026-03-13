from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
import json


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='dispatcher')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }


# Reference Tables (Справочники)

class Region(db.Model):
    __tablename__ = 'regions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class TripType(db.Model):
    __tablename__ = 'trip_types'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class Contract(db.Model):
    __tablename__ = 'contracts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class Executor(db.Model):
    __tablename__ = 'executors'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


# Resource Tables (Ресурсы)

class Driver(db.Model):
    __tablename__ = 'drivers'

    id = db.Column(db.Integer, primary_key=True)
    executor_id = db.Column(db.Integer, db.ForeignKey('executors.id'), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(50), nullable=False)

    # Date of Birth
    date_of_birth = db.Column(db.Date)

    # Driver's License
    license_number = db.Column(db.String(50))
    license_series = db.Column(db.String(50))
    license_issue_date = db.Column(db.Date)
    license_expiry_date = db.Column(db.Date)
    license_file_path = db.Column(db.String(500))

    # Passport
    passport_series = db.Column(db.String(50))
    passport_number = db.Column(db.String(50))
    passport_issue_date = db.Column(db.Date)
    passport_issued_by = db.Column(db.String(500))
    passport_file_path = db.Column(db.String(500))

    # SNILS
    snils_number = db.Column(db.String(50))

    # Tachograph
    tachograph_number = db.Column(db.String(50))
    tachograph_issue_date = db.Column(db.Date)
    tachograph_expiry_date = db.Column(db.Date)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    executor = db.relationship('Executor', backref='drivers')

    def to_dict(self):
        return {
            'id': self.id,
            'executor_id': self.executor_id,
            'executor_name': self.executor.name if self.executor else None,
            'full_name': self.full_name,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'license_series': self.license_series,
            'license_number': self.license_number,
            'license_issue_date': self.license_issue_date.isoformat() if self.license_issue_date else None,
            'license_expiry_date': self.license_expiry_date.isoformat() if self.license_expiry_date else None,
            'license_file_path': self.license_file_path,
            'passport_series': self.passport_series,
            'passport_number': self.passport_number,
            'passport_issue_date': self.passport_issue_date.isoformat() if self.passport_issue_date else None,
            'passport_issued_by': self.passport_issued_by,
            'passport_file_path': self.passport_file_path,
            'snils_number': self.snils_number,
            'tachograph_number': self.tachograph_number,
            'tachograph_issue_date': self.tachograph_issue_date.isoformat() if self.tachograph_issue_date else None,
            'tachograph_expiry_date': self.tachograph_expiry_date.isoformat() if self.tachograph_expiry_date else None
        }


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    executor_id = db.Column(db.Integer, db.ForeignKey('executors.id'), nullable=False)
    license_plate = db.Column(db.String(20), unique=True, nullable=False)
    capacity = db.Column(db.Integer)  # Vehicle capacity (number of passengers)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    executor = db.relationship('Executor', backref='vehicles')

    def to_dict(self):
        return {
            'id': self.id,
            'executor_id': self.executor_id,
            'executor_name': self.executor.name if self.executor else None,
            'license_plate': self.license_plate,
            'capacity': self.capacity
        }


# Main Table (Главная таблица)

class Trip(db.Model):
    __tablename__ = 'trips'

    id = db.Column(db.Integer, primary_key=True)
    trip_date = db.Column(db.Date)
    name = db.Column(db.String(200))  # Trip name for identification

    # Foreign Keys
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    customer_name = db.Column(db.String(200))  # Manual customer name (alternative to customer_id)
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'))
    trip_type_id = db.Column(db.Integer, db.ForeignKey('trip_types.id'))
    executor_id = db.Column(db.Integer, db.ForeignKey('executors.id'))
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'))
    driver_name = db.Column(db.String(200))  # Manual driver name (alternative to driver_id)
    driver_phone = db.Column(db.String(50))  # Driver phone (can be manual or from driver)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'))

    # Trip Details
    movement_type = db.Column(db.String(50))
    passengers_count = db.Column(db.Integer)
    time_of_day = db.Column(db.String(20))

    # Timing
    dispatch_time = db.Column(db.DateTime)
    departure_time = db.Column(db.DateTime)

    # Route
    route_start = db.Column(db.String(200))
    route_end = db.Column(db.String(200))

    # Pricing
    price_no_vat = db.Column(db.Float)
    price_with_vat = db.Column(db.Float)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contract = db.relationship('Contract', backref='trips')
    customer = db.relationship('Customer', backref='trips')
    region = db.relationship('Region', backref='trips')
    trip_type = db.relationship('TripType', backref='trips')
    executor = db.relationship('Executor', backref='trips')
    driver = db.relationship('Driver', backref='trips')
    vehicle = db.relationship('Vehicle', backref='trips')

    def to_dict(self):
        return {
            'id': self.id,
            'trip_date': self.trip_date.isoformat() if self.trip_date else None,
            'name': self.name,

            # Foreign Keys with names
            'contract_id': self.contract_id,
            'contract_name': self.contract.name if self.contract else None,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else self.customer_name,
            'region_id': self.region_id,
            'region_name': self.region.name if self.region else None,
            'trip_type_id': self.trip_type_id,
            'trip_type_name': self.trip_type.name if self.trip_type else None,
            'executor_id': self.executor_id,
            'executor_name': self.executor.name if self.executor else None,
            'driver_id': self.driver_id,
            'driver_name': self.driver.full_name if self.driver else self.driver_name,
            'driver_phone': self.driver_phone if self.driver_phone else (self.driver.phone if self.driver else None),
            'vehicle_id': self.vehicle_id,
            'vehicle_plate': self.vehicle.license_plate if self.vehicle else None,

            # Trip Details
            'movement_type': self.movement_type,
            'passengers_count': self.passengers_count,
            'time_of_day': self.time_of_day,

            # Timing
            'dispatch_time': self.dispatch_time.isoformat() if self.dispatch_time else None,
            'departure_time': self.departure_time.isoformat() if self.departure_time else None,

            # Route
            'route_start': self.route_start,
            'route_end': self.route_end,

            # Pricing
            'price_no_vat': self.price_no_vat,
            'price_with_vat': self.price_with_vat,

            # Timestamps
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


# Route Templates (Шаблоны маршрутов)

class RouteTemplate(db.Model):
    __tablename__ = 'route_templates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # Template name for easy identification

    # Foreign Keys (same as Trip but without date-specific fields)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'))
    trip_type_id = db.Column(db.Integer, db.ForeignKey('trip_types.id'))
    executor_id = db.Column(db.Integer, db.ForeignKey('executors.id'))
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'))
    driver_phone = db.Column(db.String(50))
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'))

    # Trip Details
    movement_type = db.Column(db.String(50))
    passengers_count = db.Column(db.Integer)
    time_of_day = db.Column(db.String(20))

    # Timing
    dispatch_time = db.Column(db.String(10))  # HH:MM format
    departure_time = db.Column(db.String(10))  # HH:MM format

    # Route
    route_start = db.Column(db.String(200))
    route_end = db.Column(db.String(200))

    # Pricing
    price_no_vat = db.Column(db.Float)
    price_with_vat = db.Column(db.Float)

    # Schedule
    days_of_week = db.Column(db.String(50))
    end_date = db.Column(db.Date)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contract = db.relationship('Contract')
    customer = db.relationship('Customer')
    region = db.relationship('Region')
    trip_type = db.relationship('TripType')
    executor = db.relationship('Executor')
    driver = db.relationship('Driver')
    vehicle = db.relationship('Vehicle')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,

            # Foreign Keys with names
            'contract_id': self.contract_id,
            'contract_name': self.contract.name if self.contract else None,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else None,
            'region_id': self.region_id,
            'region_name': self.region.name if self.region else None,
            'trip_type_id': self.trip_type_id,
            'trip_type_name': self.trip_type.name if self.trip_type else None,
            'executor_id': self.executor_id,
            'executor_name': self.executor.name if self.executor else None,
            'driver_id': self.driver_id,
            'driver_name': self.driver.full_name if self.driver else None,
            'driver_phone': self.driver_phone,
            'vehicle_id': self.vehicle_id,
            'vehicle_plate': self.vehicle.license_plate if self.vehicle else None,

            # Trip Details
            'movement_type': self.movement_type,
            'passengers_count': self.passengers_count,
            'time_of_day': self.time_of_day,

            # Timing
            'dispatch_time': self.dispatch_time,
            'departure_time': self.departure_time,

            # Route
            'route_start': self.route_start,
            'route_end': self.route_end,

            # Pricing
            'price_no_vat': self.price_no_vat,
            'price_with_vat': self.price_with_vat,

            # Schedule
            'days_of_week': self.days_of_week,
            'end_date': self.end_date.isoformat() if self.end_date else None,

            # Timestamps
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
