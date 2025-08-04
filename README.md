# HTTP Volume Control Web

A modern, fast web interface for controlling Windows audio devices and application volumes.

## Features

- 🎵 Control system audio device volumes
- 🎮 Control individual application volumes  
- 🔇 Mute/unmute devices
- 🎨 Clean, responsive UI with dark mode support
- ⚡ Lightning fast with Vite + React
- 🔄 Real-time updates with React Query
- 🎯 Type-safe API integration

## Tech Stack

- **Vite** - Lightning fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible, unstyled components

## Requirements

- Node.js 18+
- HTTP Volume Control API running (default: http://localhost:3001)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## Configuration

Edit `.env` file:

```bash
# API server URL
VITE_API_URL=http://localhost:3001

# Optional API key (if API requires authentication)
VITE_API_KEY=
```

## Development

```bash
# Start development server (with HMR)
npm run dev

# The app will be available at http://localhost:5173
```

## Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Deployment

The built app is a static site that can be deployed anywhere:

```bash
# Build
npm run build

# Deploy the 'dist' folder to:
# - Vercel, Netlify, GitHub Pages
# - Any static hosting service
# - Self-host with nginx, Apache, etc.
```

### Example nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Features in Detail

### Devices Tab
- List all audio output devices
- Adjust volume with smooth slider
- Mute/unmute with visual feedback
- Shows default device indicator

### Applications Tab  
- List all applications with audio sessions
- Individual volume control per app
- Application icons extracted from executables
- Handles multiple instances of same app

### Settings
- Choose between showing all apps or whitelist mode
- Select specific applications to show
- Settings persist on the API server

## Performance

- **Initial load**: <1s
- **HMR updates**: <50ms
- **Production bundle**: ~100KB gzipped
- **API response caching**: 30s default

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT