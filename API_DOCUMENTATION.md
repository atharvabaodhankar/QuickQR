# QuickQR API Documentation

## Overview

QuickQR provides a comprehensive REST API for QR code generation with two authentication methods:

- **API Key Authentication**: For programmatic access and integrations
- **JWT Authentication**: For web application users

## Base URL

```
Production: https://your-api-domain.com
Development: http://localhost:5000
```

## Authentication Methods

### 1. API Key Authentication

Include your API key in the request header:

```
x-api-key: your_api_key_here
```

### 2. JWT Authentication

Include JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## Rate Limits

### API Key Rate Limits

- **Hourly**: 100 requests per hour
- **Daily**: 1,000 requests per day
- **Monthly**: 10,000 requests per month

### JWT Rate Limits

- **Per minute**: 60 requests per minute
- **Per hour**: 1,000 requests per hour

## API Key Management

### Generate API Key

Create a new API key for your account.

**Endpoint:** `POST /api/apikey/generate`  
**Authentication:** JWT Required

**Request Body:**

```json
{
  "name": "My API Key"
}
```

**Response:**

```json
{
  "message": "API Key generated",
  "apiKey": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "My API Key",
    "key": "qr_live_1234567890abcdef",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### List API Keys

Get all API keys for your account with usage statistics.

**Endpoint:** `GET /api/apikey`  
**Authentication:** JWT Required

**Response:**

```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "My API Key",
    "key": "qr_live_1234567890abcdef",
    "isActive": true,
    "lastUsed": "2024-01-15T14:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z",
    "usage": {
      "hourly": { "used": 15, "limit": 100 },
      "daily": { "used": 245, "limit": 1000 },
      "monthly": { "used": 2150, "limit": 10000 }
    }
  }
]
```

### Revoke API Key

Deactivate an API key (can be reactivated later).

**Endpoint:** `POST /api/apikey/revoke/:id`  
**Authentication:** JWT Required

**Response:**

```json
{
  "message": "API Key revoked"
}
```

### Delete API Key

Permanently delete an API key.

**Endpoint:** `DELETE /api/apikey/:id`  
**Authentication:** JWT Required

**Response:**

```json
{
  "message": "API Key deleted successfully",
  "deletedApiKey": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "My API Key"
  }
}
```

## QR Code Generation

### Simple QR Code Generation (API Key)

Generate a basic QR code with tracking capabilities.

**Endpoint:** `GET /api/qrcode`  
**Authentication:** API Key Required

**Query Parameters:**

- `url` (required): The URL to encode in the QR code
- `name` (optional): Custom name for the QR code

**Example Request:**

```
GET /api/qrcode?url=https://example.com&name=My Website
```

**Response:**

```json
{
  "message": "QR Code generated and saved",
  "qrCode": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "My Website",
    "url": "https://example.com",
    "qrData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "accessCount": 1,
    "scanCount": 0,
    "lastScanned": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "cached": false
  },
  "usage": {
    "hourly": { "used": 16, "limit": 100 },
    "daily": { "used": 246, "limit": 1000 },
    "monthly": { "used": 2151, "limit": 10000 }
  }
}
```

### Advanced QR Code Generation (API Key)

Generate a customized QR code with styling options.

**Endpoint:** `POST /api/qrcode/generate`  
**Authentication:** API Key Required

**Request Body:**

```json
{
  "url": "https://example.com",
  "name": "Custom QR Code",
  "customization": {
    "size": 300,
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "errorCorrectionLevel": "M",
    "margin": 4
  }
}
```

**Customization Options:**

- `size`: QR code size in pixels (default: 200)
- `foregroundColor`: Hex color for QR code pattern (default: "#000000")
- `backgroundColor`: Hex color for background (default: "#FFFFFF")
- `errorCorrectionLevel`: Error correction level - "L", "M", "Q", "H" (default: "M")
- `margin`: Margin around QR code in modules (default: 4)

**Response:**

```json
{
  "message": "QR Code generated and saved",
  "qrCode": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Custom QR Code",
    "url": "https://example.com",
    "qrData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "customization": {
      "size": 300,
      "foregroundColor": "#000000",
      "backgroundColor": "#FFFFFF",
      "errorCorrectionLevel": "M",
      "margin": 4
    },
    "accessCount": 1,
    "scanCount": 0,
    "lastScanned": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "cached": false
  },
  "usage": {
    "hourly": { "used": 17, "limit": 100 },
    "daily": { "used": 247, "limit": 1000 },
    "monthly": { "used": 2152, "limit": 10000 }
  }
}
```

### QR Code Generation (JWT)

Generate QR codes using JWT authentication for web applications.

**Endpoint:** `POST /api/qrcode/generate-jwt`  
**Authentication:** JWT Required

**Request Body:**

```json
{
  "url": "https://example.com",
  "name": "My QR Code",
  "customization": {
    "size": 250,
    "foregroundColor": "#1a365d",
    "backgroundColor": "#f7fafc"
  }
}
```

**Response:**

```json
{
  "message": "QR Code generated and saved",
  "qrCode": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "My QR Code",
    "url": "https://example.com",
    "qrData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "customization": {
      "size": 250,
      "foregroundColor": "#1a365d",
      "backgroundColor": "#f7fafc",
      "errorCorrectionLevel": "M",
      "margin": 4
    },
    "accessCount": 1,
    "scanCount": 0,
    "lastScanned": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "cached": false
  },
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "user"
  },
  "usage": {
    "hourly": { "used": 18, "limit": 1000 },
    "daily": { "used": 248, "limit": 5000 },
    "monthly": { "used": 2153, "limit": 50000 }
  }
}
```

### QR Code Preview (JWT)

Generate a QR code preview without saving to database.

**Endpoint:** `POST /api/qrcode/preview`  
**Authentication:** JWT Required

**Request Body:**

```json
{
  "url": "https://example.com",
  "customization": {
    "size": 200,
    "foregroundColor": "#2d3748",
    "backgroundColor": "#edf2f7"
  }
}
```

**Response:**

```json
{
  "message": "QR Code preview generated",
  "qrCode": {
    "url": "https://example.com",
    "qrData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "customization": {
      "size": 200,
      "foregroundColor": "#2d3748",
      "backgroundColor": "#edf2f7",
      "errorCorrectionLevel": "M",
      "margin": 4
    },
    "isPreview": true
  }
}
```

## QR Code Management (JWT Only)

### List QR Codes

Get paginated list of your QR codes.

**Endpoint:** `GET /api/qrcodes`  
**Authentication:** JWT Required

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (default: "createdAt")
- `sortOrder`: "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "qrCodes": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "My Website",
      "data": "https://example.com",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "generatedVia": "jwt",
      "accessCount": 5,
      "scanCount": 12,
      "lastAccessed": "2024-01-15T14:30:00.000Z",
      "lastScanned": "2024-01-15T16:45:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T16:45:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get QR Code Details

Get detailed information about a specific QR code.

**Endpoint:** `GET /api/qrcodes/:id`  
**Authentication:** JWT Required

**Response:**

```json
{
  "qrCode": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "My Website",
    "url": "https://example.com",
    "qrData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "generatedVia": "jwt",
    "accessCount": 6,
    "scanCount": 12,
    "lastAccessed": "2024-01-15T15:30:00.000Z",
    "lastScanned": "2024-01-15T16:45:00.000Z",
    "scanHistory": [
      {
        "timestamp": "2024-01-15T16:45:00.000Z",
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.100",
        "referrer": "https://google.com"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T16:45:00.000Z"
  }
}
```

### Delete QR Code

Permanently delete a QR code.

**Endpoint:** `DELETE /api/qrcodes/:id`  
**Authentication:** JWT Required

**Response:**

```json
{
  "message": "QR Code deleted successfully",
  "deletedQrCode": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "My Website",
    "url": "https://example.com"
  }
}
```

## Analytics (JWT Only)

### QR Code Analytics

Get comprehensive analytics for your QR codes.

**Endpoint:** `GET /api/analytics/qrcodes`  
**Authentication:** JWT Required

**Query Parameters:**

- `days`: Number of days for recent analytics (default: 30)

**Response:**

```json
{
  "analytics": {
    "totalQrCodes": 25,
    "recentQrCodes": 8,
    "totalAccesses": 156,
    "totalScans": 89,
    "generationMethods": [
      { "_id": "jwt", "count": 18 },
      { "_id": "apikey", "count": 7 }
    ],
    "topQrCodes": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Popular Website",
        "data": "https://popular.com",
        "accessCount": 45,
        "scanCount": 23,
        "createdAt": "2024-01-10T10:30:00.000Z"
      }
    ],
    "topScannedQrCodes": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "Most Scanned",
        "data": "https://scanned.com",
        "accessCount": 12,
        "scanCount": 34,
        "lastScanned": "2024-01-15T16:45:00.000Z",
        "createdAt": "2024-01-12T10:30:00.000Z"
      }
    ],
    "period": "Last 30 days"
  }
}
```

## QR Code Tracking

### Scan Tracking

QR codes generated through the API include automatic scan tracking. When someone scans the QR code, they are redirected through a tracking URL that records:

- Timestamp
- User Agent
- IP Address
- Referrer

**Tracking URL Format:**

```
https://your-api-domain.com/scan/{qr_code_id}
```

The tracking endpoint automatically redirects to the original URL while recording analytics data.

## Error Responses

### Common Error Codes

**400 Bad Request**

```json
{
  "error": "URL is required"
}
```

**401 Unauthorized**

```json
{
  "error": "API key required"
}
```

**403 Forbidden**

```json
{
  "error": "Invalid or revoked API key"
}
```

**404 Not Found**

```json
{
  "error": "QR Code not found"
}
```

**429 Too Many Requests**

```json
{
  "error": "Hourly rate limit exceeded",
  "limit": 100,
  "used": 100,
  "resetTime": "2024-01-15T11:30:00.000Z"
}
```

**500 Internal Server Error**

```json
{
  "error": "Internal server error message"
}
```

## Code Examples

### JavaScript/Node.js (API Key)

```javascript
const axios = require("axios");

const apiKey = "your_api_key_here";
const baseURL = "https://your-api-domain.com/api";

// Generate simple QR code
async function generateQRCode(url, name) {
  try {
    const response = await axios.get(`${baseURL}/qrcode`, {
      params: { url, name },
      headers: {
        "x-api-key": apiKey,
      },
    });

    console.log("QR Code generated:", response.data.qrCode);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

// Generate customized QR code
async function generateCustomQRCode(url, name, customization) {
  try {
    const response = await axios.post(
      `${baseURL}/qrcode/generate`,
      {
        url,
        name,
        customization,
      },
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Custom QR Code generated:", response.data.qrCode);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

// Usage
generateQRCode("https://example.com", "My Website");

generateCustomQRCode("https://example.com", "Custom QR", {
  size: 300,
  foregroundColor: "#1a365d",
  backgroundColor: "#f7fafc",
  errorCorrectionLevel: "H",
});
```

### Python

```python
import requests

api_key = 'your_api_key_here'
base_url = 'https://your-api-domain.com/api'

def generate_qr_code(url, name=None):
    headers = {'x-api-key': api_key}
    params = {'url': url}
    if name:
        params['name'] = name

    response = requests.get(f'{base_url}/qrcode',
                          headers=headers,
                          params=params)

    if response.status_code == 201:
        return response.json()
    else:
        print(f'Error: {response.json()}')
        return None

def generate_custom_qr_code(url, name, customization):
    headers = {
        'x-api-key': api_key,
        'Content-Type': 'application/json'
    }

    data = {
        'url': url,
        'name': name,
        'customization': customization
    }

    response = requests.post(f'{base_url}/qrcode/generate',
                           headers=headers,
                           json=data)

    if response.status_code == 201:
        return response.json()
    else:
        print(f'Error: {response.json()}')
        return None

# Usage
result = generate_qr_code('https://example.com', 'My Website')
if result:
    print(f"QR Code ID: {result['qrCode']['id']}")

custom_result = generate_custom_qr_code('https://example.com', 'Custom QR', {
    'size': 300,
    'foregroundColor': '#1a365d',
    'backgroundColor': '#f7fafc',
    'errorCorrectionLevel': 'H'
})
```

### cURL

```bash
# Generate simple QR code
curl -X GET "https://your-api-domain.com/api/qrcode?url=https://example.com&name=My Website" \
  -H "x-api-key: your_api_key_here"

# Generate custom QR code
curl -X POST "https://your-api-domain.com/api/qrcode/generate" \
  -H "x-api-key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "name": "Custom QR Code",
    "customization": {
      "size": 300,
      "foregroundColor": "#1a365d",
      "backgroundColor": "#f7fafc",
      "errorCorrectionLevel": "H"
    }
  }'

# Get API key usage
curl -X GET "https://your-api-domain.com/api/apikey" \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Best Practices

1. **Store API Keys Securely**: Never expose API keys in client-side code
2. **Handle Rate Limits**: Implement exponential backoff for rate limit responses
3. **Cache QR Codes**: The API automatically caches identical QR codes for efficiency
4. **Monitor Usage**: Regularly check your API key usage to avoid hitting limits
5. **Use Appropriate Error Correction**: Higher levels (H) provide better scanning reliability but larger QR codes
6. **Optimize QR Code Size**: Balance between scannability and file size based on your use case

## Support

For API support and questions, please contact our development team or refer to the main application documentation.
