/**
 * CRYSIS OS AI Decision System
 * Rule-based intelligence for emergency response recommendations
 * 
 * Input: Incident type, location, severity
 * Output: AI recommendations for dispatch and response
 */

import emergencyData from "../data/emergencyData.js";

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get nearby services sorted by distance
 */
const getNearbyServices = (lat, lng, serviceArray, limit = 5) => {
  return serviceArray
    .map(service => ({
      ...service,
      distance: calculateDistance(lat, lng, service.lat, service.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

/**
 * Estimate response time (in minutes)
 * Assumes average response speed of 30 km/h
 */
const estimateResponseTime = (distanceKm) => {
  const avgSpeed = 30; // km/h
  return Math.ceil((distanceKm / avgSpeed) * 60); // minutes
};

/**
 * Main AI Decision Engine
 */
export const aiService = {
  /**
   * Generate AI recommendations for an incident
   * @param {Object} incident - { type, lat, lng, severity, description }
   * @returns {Object} - { priority, actions, nearestUnits, alerts }
   */
  analyzeIncident: (incident) => {
    const { type, lat, lng, severity = "medium", description = "" } = incident;

    const response = {
      priority: "medium",
      actions: [],
      nearestUnits: [],
      alerts: [],
      message: ""
    };

    // Set priority based on type and severity
    const priorityMap = {
      fire: "critical",
      flood: "high",
      accident: "high",
      crime: "high",
      medical: "high",
      other: "medium"
    };

    response.priority = priorityMap[type] || "medium";

    // Rule-based decision logic
    switch (type) {
      case "fire":
        return handleFireIncident(incident, response);
      case "flood":
        return handleFloodIncident(incident, response);
      case "medical":
        return handleMedicalIncident(incident, response);
      case "accident":
        return handleAccidentIncident(incident, response);
      case "crime":
        return handleCrimeIncident(incident, response);
      default:
        return handleGenericIncident(incident, response);
    }
  },

  /**
   * Get nearest units for immediate dispatch
   */
  getNearestUnits: (lat, lng, type) => {
    switch (type) {
      case "fire":
        return getNearbyServices(lat, lng, emergencyData.fireStations, 2);
      case "medical":
        return getNearbyServices(lat, lng, emergencyData.hospitals, 2);
      default:
        return getNearbyServices(lat, lng, emergencyData.policeStations, 2);
    }
  },

  /**
   * Check if incident is in a high-risk zone
   */
  checkHighRiskZone: (lat, lng) => {
    return emergencyData.highRiskZones.filter(zone => {
      const distance = calculateDistance(lat, lng, zone.lat, zone.lng);
      return distance <= zone.radius;
    });
  }
};

/**
 * ===== INCIDENT-SPECIFIC HANDLERS =====
 */

function handleFireIncident(incident, response) {
  const { lat, lng, description } = incident;

  response.priority = "critical";
  response.message = "FIRE INCIDENT - CRITICAL PRIORITY";

  // Get nearest fire stations
  const nearFire = getNearbyServices(lat, lng, emergencyData.fireStations, 3);
  response.nearestUnits = nearFire.map(f => ({
    id: f.id,
    name: f.name,
    distance: f.distance.toFixed(2),
    responseTime: estimateResponseTime(f.distance),
    vehicles: f.vehicles
  }));

  // Fire-specific actions
  response.actions = [
    "Dispatch fire brigade immediately",
    "Evacuate surrounding residents",
    "Alert nearby hospitals for burn victims",
    "Coordinate with police for traffic control"
  ];

  // Add nearby hospitals to support
  const nearHospitals = getNearbyServices(lat, lng, emergencyData.hospitals, 2);
  response.alerts.push({
    type: "hospitals",
    units: nearHospitals.map(h => ({
      name: h.name,
      distance: h.distance.toFixed(2),
      beds: h.beds
    }))
  });

  // Check high-risk zones
  const riskZones = aiService.checkHighRiskZone(lat, lng);
  if (riskZones.length > 0) {
    response.alerts.push({
      type: "risk_zone",
      message: "Incident in HIGH-RISK zone",
      zones: riskZones.map(z => z.name)
    });
  }

  return response;
}

function handleFloodIncident(incident, response) {
  const { lat, lng } = incident;

  response.priority = "high";
  response.message = "FLOOD INCIDENT - HIGH PRIORITY";

  // Get nearest shelters
  const nearShelters = getNearbyServices(lat, lng, emergencyData.shelters, 3);
  response.nearestUnits = nearShelters.map(s => ({
    id: s.id,
    name: s.name,
    distance: s.distance.toFixed(2),
    capacity: s.capacity,
    type: s.type
  }));

  // Flood-specific actions
  response.actions = [
    "Activate evacuation protocols",
    "Direct residents to nearest shelter",
    "Set up relief camps",
    "Alert all hospitals for medical emergencies",
    "Coordinate with municipal water management"
  ];

  // Alert all emergency services
  const nearPolice = getNearbyServices(lat, lng, emergencyData.policeStations, 2);
  const nearAmbulance = getNearbyServices(lat, lng, emergencyData.hospitals, 2);

  response.alerts.push({
    type: "evacuation",
    estimate: "2-4 hours",
    zones: ["Low-lying areas", "Near water bodies"]
  });

  response.alerts.push({
    type: "support_units",
    police: nearPolice.length,
    ambulances: nearAmbulance.length
  });

  return response;
}

function handleMedicalIncident(incident, response) {
  const { lat, lng, description } = incident;

  response.priority = "high";
  response.message = "MEDICAL INCIDENT - DISPATCHING AMBULANCE";

  // Get nearest hospitals
  const nearHospitals = getNearbyServices(lat, lng, emergencyData.hospitals, 3);
  response.nearestUnits = nearHospitals.map(h => ({
    id: h.id,
    name: h.name,
    distance: h.distance.toFixed(2),
    responseTime: estimateResponseTime(h.distance),
    ICU: h.ICU,
    beds: h.beds
  }));

  // Medical-specific actions
  response.actions = [
    "Send nearest ambulance immediately",
    `Route to ${nearHospitals[0]?.name || "nearest hospital"}`,
    "Alert hospital for incoming patient",
    "Provide first-aid guidance if available"
  ];

  // Severity assessment
  const criticalKeywords = ["unconscious", "bleeding", "chest pain", "stroke", "trauma"];
  const isCritical = criticalKeywords.some(keyword =>
    description?.toLowerCase().includes(keyword)
  );

  if (isCritical) {
    response.priority = "critical";
    response.alerts.push({
      type: "severity",
      level: "CRITICAL",
      message: "Potential life-threatening condition detected"
    });
  }

  return response;
}

function handleAccidentIncident(incident, response) {
  const { lat, lng } = incident;

  response.priority = "high";
  response.message = "ACCIDENT INCIDENT - EMERGENCY RESPONSE";

  // Get nearest police and ambulances
  const nearPolice = getNearbyServices(lat, lng, emergencyData.policeStations, 2);
  const nearAmbulance = getNearbyServices(lat, lng, emergencyData.hospitals, 2);

  response.nearestUnits = [
    ...nearPolice.map(p => ({ ...p, type: "police", distance: p.distance.toFixed(2) })),
    ...nearAmbulance.map(h => ({ ...h, type: "ambulance", distance: h.distance.toFixed(2) }))
  ].slice(0, 4);

  // Accident-specific actions
  response.actions = [
    "Dispatch police to control traffic",
    "Send ambulance for victim assessment",
    "Clear accident scene of hazards",
    "Document incident for insurance"
  ];

  response.alerts.push({
    type: "traffic",
    message: "Traffic control required",
    zones: ["Accident scene vicinity"]
  });

  return response;
}

function handleCrimeIncident(incident, response) {
  const { lat, lng, description = "" } = incident;

  response.priority = nearestPoliceShouldBeAlerted(description) ? "critical" : "high";
  response.message = "CRIME INCIDENT - POLICE DISPATCH";

  // Get nearest police stations
  const nearPolice = getNearbyServices(lat, lng, emergencyData.policeStations, 3);
  response.nearestUnits = nearPolice.map(p => ({
    id: p.id,
    name: p.name,
    distance: p.distance.toFixed(2),
    responseTime: estimateResponseTime(p.distance),
    personnel: p.capacity
  }));

  // Crime-specific actions
  response.actions = [
    "Dispatch nearest police unit",
    "Preserve incident scene",
    "Gather witness information",
    "Alert local patrols"
  ];

  // Violent crime alert
  const violentCrimes = ["attack", "robbery", "assault", "stabbing", "shooting"];
  if (violentCrimes.some(crime => description?.toLowerCase().includes(crime))) {
    response.priority = "critical";
    response.alerts.push({
      type: "safety",
      message: "VIOLENT CRIME - HIGH RISK",
      recommendation: "Advise citizens to stay indoors"
    });
  }

  return response;
}

function handleGenericIncident(incident, response) {
  const { lat, lng } = incident;

  response.priority = "medium";
  response.message = "GENERIC INCIDENT - AWAITING CLASSIFICATION";

  // Get all nearby services
  const nearPolice = getNearbyServices(lat, lng, emergencyData.policeStations, 1);
  response.nearestUnits = nearPolice;

  response.actions = [
    "Clarify incident type",
    "Assess severity level",
    "Determine appropriate response"
  ];

  return response;
}

/**
 * Helper function to determine if a crime needs immediate police response
 */
function nearestPoliceShouldBeAlerted(description) {
  const criticalWords = ["urgent", "immediate", "emergency", "danger"];
  return criticalWords.some(word => description?.toLowerCase().includes(word));
}

export default aiService;
