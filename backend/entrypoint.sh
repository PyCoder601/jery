#!/bin/bash
set -e

exec uvicorn config.main:app --host 0.0.0.0 --port 8004
