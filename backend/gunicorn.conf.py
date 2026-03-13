bind = "0.0.0.0:5555"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging (containers: stdout/stderr)
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "atk-transit"

# Server mechanics
daemon = False
pidfile = None
