from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from database import db
import os
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configure logging
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/atk_transit.log', maxBytes=10240000, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('ATK Transit startup')

    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    with app.app_context():
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        if 'vehicles' in inspector.get_table_names():
            cols = [c['name'] for c in inspector.get_columns('vehicles')]
            print(f"DEBUG: Vehicles columns: {cols}")
            
    CORS(app, supports_credentials=True, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.trips import trips_bp
    from routes.references import references_bp
    from routes.regions import regions_bp
    from routes.trip_types import trip_types_bp
    from routes.executors import executors_bp
    from routes.users import users_bp
    from routes.route_templates import route_templates_bp
    from routes.reports import reports_bp
    from routes.sync import sync_bp
    from calc import calc_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trips_bp, url_prefix='/api/trips')
    app.register_blueprint(references_bp, url_prefix='/api')
    app.register_blueprint(regions_bp)
    app.register_blueprint(trip_types_bp)
    app.register_blueprint(executors_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(route_templates_bp)
    app.register_blueprint(reports_bp, url_prefix='/api')
    app.register_blueprint(sync_bp, url_prefix='/api')
    app.register_blueprint(calc_bp, url_prefix='/api/calc')

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'atk-transit'}), 200

    # Create database tables
    with app.app_context():
        from models import User
        from sqlalchemy.exc import IntegrityError

        db.create_all()

        # Create default users if not exist.
        # Gunicorn can start multiple workers concurrently; handle unique races safely.
        def _ensure_user(username: str, role: str, password: str):
            if User.query.filter_by(username=username).first():
                return
            u = User(username=username, role=role)
            u.set_password(password)
            db.session.add(u)
            try:
                db.session.commit()
                print(f"Default {username} user created")
            except IntegrityError:
                db.session.rollback()

        _ensure_user('admin', 'admin', 'admin123')
        _ensure_user('dispatcher', 'dispatcher', 'dispatcher123')
        _ensure_user('viewer', 'viewer', 'viewer123')
    
    return app

# Create app instance for gunicorn
app = create_app()

if __name__ == '__main__':
    # Debug mode enabled but reloader disabled to prevent cache issues
    app.run(debug=True, host='0.0.0.0', port=5555, use_reloader=False)
