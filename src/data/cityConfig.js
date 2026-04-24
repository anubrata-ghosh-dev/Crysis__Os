/**
 * CRYSIS OS City Configuration
 * This is a modular, city-agnostic configuration system.
 * Change these values to deploy in any city.
 */

export const cityConfig = {
  // City Identity
  name: "Durgapur-Asansol Region",
  region: "West Bengal, India",
  
  // Geographic Center (for default map view)
  coordinates: {
    lat: 23.52,
    lng: 87.31
  },

  // Map Configuration
  map: {
    zoom: 12,
    minZoom: 10,
    maxZoom: 16,
    tileProvider: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    tileAttribution: '&copy; OpenStreetMap contributors'
  },

  // Emergency Numbers (National Standards)
  emergencyNumbers: {
    police: "100",
    ambulance: "102",
    fire: "101",
    disaster: "108"
  },

  // Response Parameters
  responseMetrics: {
    policeResponseRadius: 5, // km
    ambulanceResponseRadius: 3, // km
    fireResponseRadius: 4, // km
    defaultIncidentRadius: 2 // km for initial visualization
  },

  // Risk Zones (can be customized)
  riskZones: {
    industrial: { level: "high", color: "#ef4444" },
    residential: { level: "medium", color: "#f97316" },
    commercial: { level: "medium", color: "#eab308" },
    water: { level: "high", color: "#06b6d4" }
  }
};

export default cityConfig;
