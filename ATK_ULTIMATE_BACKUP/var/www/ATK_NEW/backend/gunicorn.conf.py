bind = "0.0.0.0:5555"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = "/var/www/ATK_NEW/backend/logs/access.log"
errorlog = "/var/www/ATK_NEW/backend/logs/error.log"
loglevel = "info"

# Process naming
proc_name = "atk-transit"

# Server mechanics
daemon = False
pidfile = "/var/www/ATK_NEW/backend/gunicorn.pid"
