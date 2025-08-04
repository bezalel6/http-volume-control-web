# Network Access Configuration

## Accessing from Different Devices

The web client automatically detects the correct API server URL based on how you access it:

### Local Development
- When accessing via `http://localhost:5173` → API URL: `http://localhost:3001`
- When accessing via `http://127.0.0.1:5173` → API URL: `http://127.0.0.1:3001`

### Network Access
- When accessing via IP (e.g., `http://192.168.1.100:5173`) → API URL: `http://192.168.1.100:3001`
- When accessing via hostname (e.g., `http://mypc:5173`) → API URL: `http://mypc:3001`

### Custom API URL
You can override the automatic detection by setting the `VITE_API_URL` environment variable:

```bash
# .env file
VITE_API_URL=http://192.168.1.100:3001
```

## Hosting Setup

### For Local Network Access

1. **Start the API server to listen on all interfaces:**
   ```bash
   cd http-volume-control-api
   npm start
   ```
   The API server already listens on `0.0.0.0:3001` by default.

2. **Start the web client with host flag:**
   ```bash
   cd http-volume-control-web
   npm run dev -- --host
   ```
   This makes Vite listen on all network interfaces.

3. **Find your local IP address:**
   - Windows: `ipconfig` → Look for IPv4 Address
   - Mac/Linux: `ifconfig` or `ip addr`

4. **Access from other devices:**
   - Open browser on another device
   - Navigate to `http://YOUR_IP:5173`
   - The client will automatically connect to `http://YOUR_IP:3001`

### Security Notes

- The API is secured with pairing-based authentication
- Each device must complete the pairing process
- CORS is open to allow access from any origin
- Rate limiting prevents abuse

### Troubleshooting

1. **Can't access from other devices:**
   - Check Windows Firewall allows ports 3001 and 5173
   - Ensure both devices are on the same network
   - Try using IP address instead of hostname

2. **API connection fails:**
   - Check the console for the detected API URL
   - Ensure the API server is running
   - Verify no firewall is blocking port 3001

3. **Authentication issues:**
   - Complete the pairing process on each device
   - Check that sessions haven't expired
   - Use the sessions dialog to manage devices