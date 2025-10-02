#!/bin/bash
set -e


# Run alembic migrations
alembic -c alembic.ini upgrade head

# Start the application
exec uvicorn config.main:app --host 0.0.0.0 --port 8004
