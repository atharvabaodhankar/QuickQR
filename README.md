# QuickQR - QR Code Generator with API

A full-stack QR code generation platform with comprehensive API functionality, user management, and analytics.

## Features

### Core Functionality
- **QR Code Generation**: Create QR codes with customization options
- **Scan Tracking**: Automatic tracking of QR code scans with analytics
- **User Management**: Registration, authentication, and profile management
- **API Key Management**: Generate and manage API keys for programmatic access
- **Analytics Dashboard**: Comprehensive usage statistics and insights

### API Capabilities
- **Dual Authentication**: API Key and JWT-based authentication
- **Rate Limiting**: Configurable limits for different authentication methods
- **Customization**: Full control over QR code appearance and properties
- **Caching**: Intelligent caching to improve performance
- **Real-time Analytics**: Track scans, usage patterns, and performance metrics

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quickqr
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

### Environment Configuration

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickqr
JWT_SECRET=your_jwt_secret_here
BASE_URL=http://localhost:5000
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_BACKEND_URL=http://localhost:5000
```

## API Documentation

📚 **[Complete API Documentation](./API_DOCUMENTATION.md)**

### Quick API Overview

#### Authentication Methods
- **API Key**: Include `x-api-key` header for programmatic access
- **JWT Token**: Include `Authorization: Bearer <token>` header for web app access

#### Key Endpoints
- `GET /api/qrcode` - Generate simple QR code (API Key)
- `POST /api/qrcode/generate` - Generate customized QR code (API Key)
- `POST /api/qrcode/generate-jwt` - Generate QR code (JWT)
- `GET /api/apikey` - Manage API keys
- `GET /api/analytics/qrcodes` - Get usage analytics

#### Rate Limits
- **API Key**: 100/hour, 1,000/day, 10,000/month
- **JWT**: 60/minute, 1,000/hour

### Quick API Example
```javascript
// Generate a QR code using API key
const response = await fetch('http://localhost:5000/api/qrcode?url=https://example.com', {
  headers: {
    'x-api-key': 'your_api_key_here'
  }
});

const data = await response.json();
console.log('QR Code:', data.qrCode.qrData); // Base64 image data
```

## Project Structure

```
quickqr/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Authentication & rate limiting
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── utils/           # Helper functions
│   └── package.json
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   └── utils/           # Frontend utilities
│   └── package.json
├── API_DOCUMENTATION.md     # Comprehensive API docs
└── README.md               # This file
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + API Keys
- **QR Generation**: qrcode library
- **Rate Limiting**: Custom middleware

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast

## Key Features Explained

### API Key Management
- Generate multiple API keys per user
- Individual usage tracking and analytics
- Revoke/delete functionality
- Real-time rate limit monitoring

### QR Code Customization
- Size adjustment (width/height)
- Color customization (foreground/background)
- Error correction levels (L, M, Q, H)
- Margin control
- Format options

### Scan Tracking
- Automatic redirect through tracking URLs
- User agent and IP logging
- Referrer tracking
- Historical scan data
- Real-time analytics

### Caching System
- Intelligent QR code caching
- Duplicate detection
- Performance optimization
- Reduced generation overhead

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### API Testing
Use the included test script to verify API functionality:
```bash
node test-api-usage.js
```

## Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB connection
3. Set up reverse proxy (nginx recommended)
4. Enable HTTPS
5. Configure CORS for your frontend domain

### Frontend Deployment
1. Update `VITE_BACKEND_URL` to your API domain
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting service
4. Configure routing for SPA

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📖 [API Documentation](./API_DOCUMENTATION.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

## Roadmap

- [ ] Webhook support for scan events
- [ ] Bulk QR code generation
- [ ] Custom domains for tracking URLs
- [ ] Advanced analytics and reporting
- [ ] QR code templates and presets
- [ ] Team collaboration features
- [ ] API versioning
- [ ] GraphQL API option