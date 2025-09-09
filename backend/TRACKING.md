# QR Code Scan Tracking

## Overview
QuickQR now includes real QR code scan tracking. When someone scans a QR code with their phone, the system tracks the scan and redirects them to the intended URL.

## How It Works

### 1. QR Code Generation
Instead of encoding the direct URL, QR codes now contain a tracking URL:
```
Original URL: https://example.com
Tracking URL: http://localhost:5000/scan/[qr_code_id]
```

### 2. Scan Tracking
When someone scans the QR code:
1. Their device opens the tracking URL
2. The server records the scan with metadata
3. The user is redirected to the original URL

### 3. Tracked Information
For each scan, we record:
- **Timestamp**: When the scan occurred
- **User Agent**: Device/browser information
- **IP Address**: Location information (anonymized)
- **Referrer**: How they accessed the QR code

## Database Schema

### New Fields Added to QrCode Model:
```javascript
scanCount: Number,           // Total number of scans
lastScanned: Date,          // When last scanned
scanHistory: [{             // Last 100 scan records
  timestamp: Date,
  userAgent: String,
  ipAddress: String,
  referrer: String
}]
```

## API Endpoints

### Scan Tracking (Public)
```
GET /scan/:id
```
- **Purpose**: Track QR code scan and redirect
- **Authentication**: None required (public endpoint)
- **Response**: HTTP redirect to original URL

### Analytics Updates
All analytics endpoints now include:
- `totalScans`: Total scans across all QR codes
- `topScannedQrCodes`: Most scanned QR codes
- `scanCount`: Individual QR code scan counts

## Frontend Updates

### Dashboard
- New "Total Scans" statistic
- Scan counts displayed alongside view counts

### QR Library
- Scan count shown for each QR code
- Last scanned timestamp in details modal

### Analytics
- Separate "Most Viewed" and "Most Scanned" sections
- Scan statistics in usage insights

## Environment Configuration

Add to your `.env` file:
```
BASE_URL=http://localhost:5000
```

For production, update to your actual domain:
```
BASE_URL=https://your-domain.com
```

## Privacy & Performance

### Privacy
- IP addresses are stored but can be anonymized
- User agents help understand device usage
- Scan history is limited to last 100 scans per QR code

### Performance
- Tracking adds minimal overhead
- Scan history is automatically pruned
- Indexes ensure fast lookups

## Differences: Views vs Scans

### Views (accessCount)
- Counted when QR code is accessed in the app
- Includes: generation, API calls, viewing details
- Internal application usage

### Scans (scanCount)
- Counted when QR code is scanned with a phone/camera
- Real-world usage tracking
- External user engagement

## Migration Notes

Existing QR codes will:
- Continue to work normally
- Show 0 scans initially (since they use direct URLs)
- Need to be regenerated to enable tracking

New QR codes automatically include tracking.