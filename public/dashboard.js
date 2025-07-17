/**
 * Women Safety Analytics Dashboard JavaScript
 * Handles real-time updates, map management, and user interactions
 */

class WomenSafetyDashboard {
    constructor() {
        this.socket = null;
        this.map = null;
        this.markers = {
            sos: [],
            crimes: [],
            users: []
        };
        this.alerts = [];
        this.crimeData = [];
        this.showCrimeZones = false;
        this.alertsToday = 0;
        
        this.initializeSocket();
        this.initializeEventListeners();
        this.loadCrimeData();
        this.updateDashboardStats();
        
        // Initialize map after DOM and scripts are loaded
        setTimeout(() => {
            this.initializeMap();
        }, 100);
    }

    /**
     * Initialize Socket.IO connection
     */
    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to Women Safety Analytics Backend');
            this.updateConnectionStatus(true);
            this.socket.emit('join-dashboard');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from backend');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('dashboard-connected', (data) => {
            console.log('Dashboard connection confirmed:', data.message);
            this.showNotification('Connected to Women Safety Analytics Dashboard', 'success');
        });
        
        this.socket.on('sos-alert', (data) => {
            console.log('SOS Alert received:', data);
            this.handleSOSAlert(data);
        });
        
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.showNotification('Connection error occurred', 'error');
        });
    }

    /**
     * Initialize event listeners for UI elements
     */
    initializeEventListeners() {
        // Toggle crime zones button
        document.getElementById('toggle-crime-zones').addEventListener('click', () => {
            this.toggleCrimeZones();
        });
        
        // Center map button
        document.getElementById('center-map').addEventListener('click', () => {
            this.centerMap();
        });
        
        // Clear alerts button
        document.getElementById('clear-alerts').addEventListener('click', () => {
            this.clearAllAlerts();
        });
        
        // Modal close functionality
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Acknowledge alert button
        document.getElementById('acknowledge-alert').addEventListener('click', () => {
            this.acknowledgeAlert();
        });
        
        // Close modal when clicking outside
        document.getElementById('alert-modal').addEventListener('click', (e) => {
            if (e.target.id === 'alert-modal') {
                this.closeModal();
            }
        });
    }

    /**
     * Initialize OpenStreetMap with Leaflet.js
     */
    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map('map').setView([40.7589, -73.9851], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        console.log('OpenStreetMap initialized with Leaflet.js');
        
        // Load crime zones if data is available
        if (this.crimeData.length > 0) {
            this.addCrimeMarkers();
        }
    }

    /**
     * Handle incoming SOS alerts
     */
    handleSOSAlert(data) {
        const { alert, nearbyUsers } = data;
        
        // Add to alerts list
        this.alerts.unshift({
            ...alert,
            nearbyUsers: nearbyUsers || [],
            acknowledged: false
        });
        
        // Update alerts counter
        this.alertsToday++;
        this.updateDashboardStats();
        
        // Add SOS marker to map
        this.addSOSMarker(alert, nearbyUsers);
        
        // Add nearby user markers
        if (nearbyUsers && nearbyUsers.length > 0) {
            this.addNearbyUserMarkers(nearbyUsers);
        }
        
        // Update alerts list UI
        this.updateAlertsDisplay();
        
        // Show modal for new alert
        this.showAlertModal(alert, nearbyUsers);
        
        // Play alert sound (if browser allows)
        this.playAlertSound();
        
        // Center map on alert location
        if (this.map) {
            this.map.setView([alert.latitude, alert.longitude], 15);
        }
        
        this.updateLastUpdateTime();
    }

    /**
     * Add SOS marker to map
     */
    addSOSMarker(alert, nearbyUsers) {
        if (!this.map) return;
        
        // Create custom SOS icon
        const sosIcon = L.divIcon({
            className: 'sos-marker',
            html: '<div style="background: #e74c3c; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">SOS</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const marker = L.marker([alert.latitude, alert.longitude], {
            icon: sosIcon
        }).addTo(this.map);
        
        // Create popup content
        const popupContent = `
            <div class="map-info-window">
                <div class="info-window-title">🚨 SOS Alert</div>
                <div class="info-window-details">
                    <strong>User:</strong> ${alert.username}<br>
                    <strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}<br>
                    <strong>Location:</strong> ${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}<br>
                    <strong>Nearby Users:</strong> ${nearbyUsers ? nearbyUsers.length : 0}
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        this.markers.sos.push({ marker, alert });
    }

    /**
     * Add nearby user markers to map
     */
    addNearbyUserMarkers(nearbyUsers) {
        if (!this.map || !nearbyUsers) return;
        
        nearbyUsers.forEach(user => {
            // Create custom user icon
            const userIcon = L.divIcon({
                className: 'user-marker',
                html: '<div style="background: #27ae60; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">👤</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker([user.latitude, user.longitude], {
                icon: userIcon
            }).addTo(this.map);
            
            const popupContent = `
                <div class="map-info-window">
                    <div class="info-window-title">👤 Nearby User</div>
                    <div class="info-window-details">
                        <strong>User:</strong> ${user.username}<br>
                        <strong>Distance:</strong> ${Math.round(user.distance)}m away<br>
                        <strong>Location:</strong> ${user.latitude.toFixed(6)}, ${user.longitude.toFixed(6)}
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            this.markers.users.push({ marker, user });
        });
    }

    /**
     * Load crime data from API
     */
    async loadCrimeData() {
        try {
            const response = await fetch('/api/crime-zones');
            const data = await response.json();
            
            if (data.success && data.data) {
                this.crimeData = data.data;
                console.log(`Loaded ${this.crimeData.length} crime data points`);
                
                // Update crime statistics
                this.updateCrimeStats();
                
                // Add crime markers if map is ready and crime zones are enabled
                if (this.map && this.showCrimeZones) {
                    this.addCrimeMarkers();
                }
            }
        } catch (error) {
            console.error('Error loading crime data:', error);
            this.showNotification('Failed to load crime data', 'error');
        }
    }

    /**
     * Add crime markers to map
     */
    addCrimeMarkers() {
        if (!this.map || !this.crimeData) return;
        
        // Clear existing crime markers
        this.clearCrimeMarkers();
        
        this.crimeData.forEach(crime => {
            const color = this.getCrimeColor(crime.type);
            
            // Create custom crime icon
            const crimeIcon = L.divIcon({
                className: 'crime-marker',
                html: `<div style="background: ${color}; border-radius: 50%; width: 20px; height: 20px; border: 1px solid white; opacity: 0.8; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            const marker = L.marker([crime.latitude, crime.longitude], {
                icon: crimeIcon
            }).addTo(this.map);
            
            const popupContent = `
                <div class="map-info-window">
                    <div class="info-window-title">🚫 Crime Zone</div>
                    <div class="info-window-details">
                        <strong>Type:</strong> ${crime.type}<br>
                        <strong>Location:</strong> ${crime.latitude.toFixed(6)}, ${crime.longitude.toFixed(6)}
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            this.markers.crimes.push({ marker, crime });
        });
    }

    /**
     * Get color for crime type
     */
    getCrimeColor(crimeType) {
        const colors = {
            'Theft': '#f39c12',
            'Assault': '#e74c3c',
            'Robbery': '#c0392b',
            'Vandalism': '#9b59b6',
            'Drug Related': '#8e44ad',
            'Burglary': '#d35400',
            'Harassment': '#e67e22'
        };
        return colors[crimeType] || '#7f8c8d';
    }

    /**
     * Toggle crime zones visibility
     */
    toggleCrimeZones() {
        this.showCrimeZones = !this.showCrimeZones;
        
        if (this.showCrimeZones) {
            this.addCrimeMarkers();
            document.getElementById('toggle-crime-zones').innerHTML = '<i class="fas fa-eye-slash"></i> Hide Crime Zones';
        } else {
            this.clearCrimeMarkers();
            document.getElementById('toggle-crime-zones').innerHTML = '<i class="fas fa-eye"></i> Show Crime Zones';
        }
    }

    /**
     * Clear crime markers from map
     */
    clearCrimeMarkers() {
        this.markers.crimes.forEach(({ marker }) => {
            this.map.removeLayer(marker);
        });
        this.markers.crimes = [];
    }

    /**
     * Center map on default location
     */
    centerMap() {
        if (this.map) {
            this.map.setView([40.7589, -73.9851], 13);
        }
    }

    /**
     * Update alerts display
     */
    updateAlertsDisplay() {
        const alertsList = document.getElementById('alerts-list');
        
        if (this.alerts.length === 0) {
            alertsList.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-info-circle"></i>
                    <p>No SOS alerts received yet</p>
                </div>
            `;
            return;
        }
        
        alertsList.innerHTML = this.alerts.map(alert => `
            <div class="alert-item ${alert.acknowledged ? '' : 'new'}">
                <div class="alert-header">
                    <div class="alert-user">🚨 ${alert.username}</div>
                    <div class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</div>
                </div>
                <div class="alert-location">
                    📍 ${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}
                </div>
                ${alert.nearbyUsers && alert.nearbyUsers.length > 0 ? 
                    `<div class="alert-nearby">👥 ${alert.nearbyUsers.length} nearby users</div>` : 
                    '<div class="alert-nearby">👤 No nearby users</div>'
                }
            </div>
        `).join('');
        
        // Update active alerts count
        const activeAlerts = this.alerts.filter(alert => !alert.acknowledged).length;
        document.getElementById('active-alerts').textContent = activeAlerts;
    }

    /**
     * Clear all alerts
     */
    clearAllAlerts() {
        if (confirm('Are you sure you want to clear all alerts?')) {
            this.alerts = [];
            this.updateAlertsDisplay();
            
            // Clear SOS markers
            this.markers.sos.forEach(({ marker }) => {
                this.map.removeLayer(marker);
            });
            this.markers.sos = [];
            
            // Clear user markers
            this.markers.users.forEach(({ marker }) => {
                this.map.removeLayer(marker);
            });
            this.markers.users = [];
            
            this.showNotification('All alerts cleared', 'success');
        }
    }

    /**
     * Show alert modal
     */
    showAlertModal(alert, nearbyUsers) {
        const modal = document.getElementById('alert-modal');
        const alertDetails = document.getElementById('modal-alert-details');
        
        alertDetails.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>User:</strong> ${alert.username}<br>
                <strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}<br>
                <strong>Location:</strong> ${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}
            </div>
            ${nearbyUsers && nearbyUsers.length > 0 ? `
                <div>
                    <strong>Nearby Users (${nearbyUsers.length}):</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${nearbyUsers.map(user => `
                            <li>${user.username} - ${Math.round(user.distance)}m away</li>
                        `).join('')}
                    </ul>
                </div>
            ` : '<div><strong>No nearby users detected</strong></div>'}
        `;
        
        modal.style.display = 'block';
        this.currentModalAlert = alert;
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('alert-modal').style.display = 'none';
        this.currentModalAlert = null;
    }

    /**
     * Acknowledge current alert
     */
    acknowledgeAlert() {
        if (this.currentModalAlert) {
            const alertIndex = this.alerts.findIndex(a => a.id === this.currentModalAlert.id);
            if (alertIndex !== -1) {
                this.alerts[alertIndex].acknowledged = true;
                this.updateAlertsDisplay();
            }
        }
        this.closeModal();
        this.showNotification('Alert acknowledged', 'success');
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        if (connected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'status-value connected';
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.className = 'status-value disconnected';
        }
    }

    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        document.getElementById('alerts-today').textContent = this.alertsToday;
        document.getElementById('dashboard-connections').textContent = '1'; // This would come from server in real implementation
    }

    /**
     * Update crime statistics display
     */
    updateCrimeStats() {
        const crimeStats = document.getElementById('crime-stats');
        
        if (this.crimeData.length === 0) {
            crimeStats.innerHTML = '<div class="loading">No crime data available</div>';
            return;
        }
        
        // Count crimes by type
        const crimesByType = {};
        this.crimeData.forEach(crime => {
            const type = crime.type || 'Unknown';
            crimesByType[type] = (crimesByType[type] || 0) + 1;
        });
        
        crimeStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Crimes:</span>
                <span class="stat-value">${this.crimeData.length}</span>
            </div>
            ${Object.entries(crimesByType).map(([type, count]) => `
                <div class="crime-type-item">
                    <span class="stat-label">${type}:</span>
                    <span class="crime-type-count">${count}</span>
                </div>
            `).join('')}
        `;
    }

    /**
     * Play alert sound
     */
    playAlertSound() {
        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Audio notification not available:', error);
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Simple notification - in a real app you might use a toast library
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // You could implement a toast notification system here
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Remove Google Maps callback - no longer needed

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Women Safety Analytics Dashboard...');
    window.dashboard = new WomenSafetyDashboard();
});
