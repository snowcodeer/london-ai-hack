#!/bin/bash

# Home Service Finder API - Server Startup Script
# This script starts the server with corporate SSL certificates configured

export SSL_CERT_FILE=/Users/Rohithn/combined_corporate_certs.pem
export REQUESTS_CA_BUNDLE=/Users/Rohithn/combined_corporate_certs.pem

echo "Starting Home Service Finder API..."
echo "SSL Certificate: $SSL_CERT_FILE"
echo ""

.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
