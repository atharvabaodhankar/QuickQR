# QuickQR Frontend

React frontend for the QuickQR application - a QR code generator with API functionality.

## Environment Setup

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your backend URL:
   ```env
   # For local development
   VITE_BACKEND_URL=http://localhost:5000
   
   # For production
   VITE_BACKEND_URL=https://your-api-domain.com
   ```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_BACKEND_URL`: The URL of your QuickQR backend API

## Features

- User authentication (login/register)
- QR code generation with customization
- QR code library management
- API key management
- Analytics dashboard
- Comprehensive API documentation

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast
- Lucide React Icons