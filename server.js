const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const logger = require('./utils/logger');
const sosRoutes = require('./routes/sos');
const crimeZonesRoutes = require('./routes/crime-zones');
const { loadCrimeData } = require('./utils/csvParser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store socket connections for real-time updates
const dashboardSockets = new Set();

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`New socket connection: ${socket.id}`);
  
  // Add to dashboard sockets for broadcasting SOS alerts
  dashboardSockets.add(socket);
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    dashboardSockets.delete(socket);
  });
  
  socket.on('join-dashboard', () => {
    logger.info(`Dashboard joined: ${socket.id}`);
    socket.emit('dashboard-connected', { message: 'Connected to Women Safety Analytics Dashboard' });
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  req.dashboardSockets = dashboardSockets;
  next();
});

// Routes
app.use('/api', sosRoutes);
app.use('/api', crimeZonesRoutes);

// Serve dashboard at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    dashboardConnections: dashboardSockets.size
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler - use catch-all route instead of '*'
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize crime data on startup
async function initializeServer() {
  try {
    await loadCrimeData();
    logger.info('Crime data loaded successfully');
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Women Safety Analytics Backend running on port ${PORT}`);
      logger.info(`Dashboard available at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

initializeServer();

module.exports = app;
