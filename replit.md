# Women Safety Analytics Backend

## Overview

This is a Node.js backend application for a Women Safety Analytics system that provides real-time SOS alert functionality and crime zone monitoring. The application serves a web dashboard and handles emergency alert notifications with real-time communication capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js with Node.js
- **Real-time Communication**: Socket.IO for WebSocket connections
- **Server**: HTTP server with Socket.IO integration
- **File Structure**: Modular route-based organization

### Frontend Architecture
- **Static Files**: Served directly from Express
- **Dashboard**: HTML/CSS/JavaScript web interface
- **Real-time Updates**: Socket.IO client for live data
- **Map Integration**: Google Maps API for geographical visualization

## Key Components

### Core Server Components
1. **Express Application** (`server.js`)
   - Main application entry point
   - Middleware configuration (CORS, Morgan logging, JSON parsing)
   - Static file serving for dashboard
   - Socket.IO integration

2. **Route Handlers**
   - `routes/sos.js`: Handles emergency SOS alerts
   - `routes/crime-zones.js`: Manages crime data and zone information

3. **Utility Modules**
   - `utils/logger.js`: Custom logging system with colored output
   - `utils/haversine.js`: Geographic distance calculations
   - `utils/csvParser.js`: Crime data CSV file processing

4. **Data Management**
   - `data/users.js`: In-memory user location storage with mock data
   - `config/settings.js`: Centralized configuration management

### Dashboard Components
1. **Web Interface** (`public/index.html`)
   - Responsive dashboard layout
   - Real-time status indicators
   - Map visualization container

2. **Dashboard Logic** (`public/dashboard.js`)
   - Socket.IO client management
   - Map integration and marker handling
   - Real-time alert processing

3. **Styling** (`public/styles.css`)
   - Modern gradient design
   - Responsive layout
   - Status indicator styling

## Data Flow

### SOS Alert Flow
1. Client sends POST request to `/api/sos` with location data
2. Server validates coordinates and user information
3. System searches for nearby users within configurable radius
4. Alert is broadcast to all connected dashboard clients via Socket.IO
5. Dashboard updates map with new SOS marker and notifications

### Crime Data Flow
1. CSV file with crime data is parsed on startup
2. Data is stored in memory for fast access
3. Dashboard requests crime zones via `/api/crime-zones`
4. Server returns filtered crime data based on location/type parameters
5. Dashboard renders crime zones on map as overlays

### Real-time Communication
1. Dashboard connects to server via Socket.IO
2. Server maintains set of connected dashboard sockets
3. SOS alerts are immediately broadcast to all connected dashboards
4. Connection status is monitored and displayed

## External Dependencies

### Core Dependencies
- **express**: Web framework for API and static file serving
- **socket.io**: Real-time bidirectional communication
- **cors**: Cross-origin resource sharing configuration
- **morgan**: HTTP request logging middleware
- **csv-parser**: CSV file parsing for crime data

### External Services
- **Google Maps API**: Map visualization and geocoding
  - API key configured in settings
  - Used for dashboard map display

### Development Tools
- **http**: Node.js HTTP server module
- **path**: File path utilities
- **fs**: File system operations for CSV reading

## Deployment Strategy

### Environment Configuration
- **Port**: Configurable via PORT environment variable (default: 8000)
- **Host**: Bound to 0.0.0.0 for container compatibility
- **API Keys**: Google Maps API key via environment variables
- **CORS**: Configurable origins for production security

### Data Storage
- **Current**: In-memory storage for users and crime data
- **Future Ready**: Database URL configuration prepared for PostgreSQL integration
- **Mock Data**: Sample users and crime data for demonstration

### Scalability Considerations
- Socket connection management with cleanup
- User data cleanup intervals (6-hour cycles)
- Rate limiting configuration prepared
- Modular structure ready for database integration

### Security Features
- Input validation for coordinates and user data
- CORS configuration for cross-origin requests
- Environment-based configuration management
- Structured error handling and logging

The application is designed as a demonstration system with in-memory data storage, but includes the architectural foundation for scaling to a production environment with persistent database storage and enhanced security measures.