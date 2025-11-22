# SSL Issue on Corporate Network

## Problem
The Valyu API is failing due to SSL certificate verification issues on your corporate network:
```
SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED]
certificate verify failed: self-signed certificate in certificate chain'))
```

## Solution Options

### Option 1: Use Mock Mode (for testing without Valyu)
I can create a mock mode that returns sample data so you can test the API implementation without calling Valyu.

### Option 2: Corporate Network SSL Workaround
The code already has SSL verification disabled, but your corporate proxy might need additional configuration:

1. **Set proxy environment variables** (if your network uses a proxy):
   ```bash
   export HTTP_PROXY=http://your-proxy:port
   export HTTPS_PROXY=http://your-proxy:port
   export NO_PROXY=localhost,127.0.0.1
   ```

2. **Install corporate certificates**:
   ```bash
   # If you have a corporate CA certificate
   export REQUESTS_CA_BUNDLE=/path/to/corporate-ca-bundle.crt
   export SSL_CERT_FILE=/path/to/corporate-ca-bundle.crt
   ```

3. **Try outside corporate network**: Test from a personal network/hotspot to verify the implementation works.

### Option 3: Contact IT
Your IT department may need to whitelist `api.valyu.ai` or provide specific SSL configuration.

## Current Status
- ✓ API server is running correctly
- ✓ Request/response schemas are updated for lat/long + radius
- ✓ SSL verification is disabled in code
- ✗ Valyu API calls are being blocked by corporate SSL inspection

## What Works
- Health check: `curl http://localhost:8000/api/v1/health`
- Service categories: `curl http://localhost:8000/api/v1/services/categories`
- Request validation (the API correctly validates inputs)

## What Doesn't Work (Due to SSL)
- Actual Valyu search calls

Would you like me to create a mock mode for testing, or do you want to try configuring the corporate proxy/certificates?
