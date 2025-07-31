# Women Safety Analytics API Routes

## Complete API Endpoints List

### SOS Alert Routes
```
POST /api/sos
```
- **Purpose**: Handle emergency SOS alerts from React Native app
- **Body**: `{ username, latitude, longitude }`
- **Response**: Alert details + nearby users within 500m radius
- **Real-time**: Broadcasts to all connected dashboards

### Crime Data Routes
```
GET /api/crime-zones
```
- **Purpose**: Get crime data from CSV database (96 records)
- **Query Params**: `lat`, `lng`, `radius`, `type` (all optional)
- **Response**: Filtered crime data array

### System Health & Ping Routes
```
GET /health
```
- **Purpose**: Check server status and dashboard connections
- **Response**: System status, timestamp, active dashboard connections

```
GET /ping
```
- **Purpose**: Keep server alive and check responsiveness
- **Response**: Server status, uptime, timestamp, active connections

```
GET /api/ping
```
- **Purpose**: Alternative ping endpoint (pong response)
- **Response**: Simple pong confirmation with server info

### Dashboard Routes
```
GET /
```
- **Purpose**: Serve the main dashboard web interface
- **Response**: HTML dashboard with real-time map and alerts

### Static File Routes
```
GET /styles.css
GET /dashboard.js
```
- **Purpose**: Serve dashboard assets

### Real-time Socket.IO Events
```
WebSocket Events:
- join-dashboard: Connect to dashboard notifications
- sos-alert: Receive real-time SOS alerts
- dashboard-connected: Confirmation message
```

## Example Usage

### SOS Alert
```bash
curl -X POST http://localhost:5000/api/sos \
  -H "Content-Type: application/json" \
  -d '{"username":"user123","latitude":26.8467,"longitude":80.9462}'
```

### Crime Data (Filtered)
```bash
curl "http://localhost:5000/api/crime-zones?lat=26.8467&lng=80.9462&radius=500&type=theft"
```

### Server Ping
```bash
curl "http://localhost:5000/ping"
curl "http://localhost:5000/api/ping"
```

### Health Check
```bash
curl "http://localhost:5000/health"
```

## Data Coverage
- **Total Volunteers**: 38 users across 3 geographic regions
- **Total Crime Records**: 96 incidents
- **Geographic Areas**: Lucknow Rajajipuram, Punjab SLIET, User Location (26.8467, 80.9462)
- **Response Radius**: 500m for nearby user detection