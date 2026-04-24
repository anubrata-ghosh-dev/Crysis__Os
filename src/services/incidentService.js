/**
 * CRYSIS OS Incident Service
 * Manages incident creation, retrieval, and state management
 */

/**
 * Incident Type Definitions
 */
export const INCIDENT_TYPES = {
  FIRE: "fire",
  FLOOD: "flood",
  MEDICAL: "medical",
  ACCIDENT: "accident",
  CRIME: "crime",
  OTHER: "other"
};

/**
 * Incident Status
 */
export const INCIDENT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CANCELLED: "cancelled"
};

/**
 * Severity Levels
 */
export const SEVERITY_LEVELS = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low"
};

/**
 * Default Incident Structure
 */
export const createIncidentTemplate = (overrides = {}) => {
  return {
    id: null,
    type: INCIDENT_TYPES.OTHER,
    status: INCIDENT_STATUS.OPEN,
    severity: SEVERITY_LEVELS.MEDIUM,
    lat: null,
    lng: null,
    address: "",
    description: "",
    reportedBy: "",
    phoneNumber: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responders: [],
    notes: [],
    tags: [],
    ...overrides
  };
};

const normalizeIncidentDate = (value) => {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Incident Utilities
 */
export const incidentUtils = {
  /**
   * Format incident for display
   */
  formatIncident: (incident) => {
    const createdAt = normalizeIncidentDate(incident.createdAt);
    const updatedAt = normalizeIncidentDate(incident.updatedAt);

    return {
      ...incident,
      typeLabel: getIncidentTypeLabel(incident.type),
      statusLabel: getIncidentStatusLabel(incident.status),
      severityLabel: getSeverityLabel(incident.severity),
      createdDate: createdAt ? createdAt.toLocaleString() : "Unknown date",
      updatedDate: updatedAt ? updatedAt.toLocaleString() : "Unknown date"
    };
  },

  /**
   * Get incident color based on severity
   */
  getSeverityColor: (severity) => {
    const colors = {
      critical: "#ef4444",  // red
      high: "#f97316",      // orange
      medium: "#eab308",    // yellow
      low: "#22c55e"        // green
    };
    return colors[severity] || colors.medium;
  },

  /**
   * Get incident icon based on type
   */
  getIncidentIcon: (type) => {
    const icons = {
      fire: "Flame",
      flood: "Waves",
      medical: "AlertCircle",
      accident: "Zap",
      crime: "Shield",
      other: "HelpCircle"
    };
    return icons[type] || icons.other;
  },

  /**
   * Check if incident is active
   */
  isActive: (incident) => {
    return [INCIDENT_STATUS.OPEN, INCIDENT_STATUS.IN_PROGRESS].includes(
      incident.status
    );
  },

  /**
   * Filter incidents by criteria
   */
  filterIncidents: (incidents, filters) => {
    return incidents.filter(incident => {
      if (filters.type && incident.type !== filters.type) return false;
      if (filters.status && incident.status !== filters.status) return false;
      if (filters.severity && incident.severity !== filters.severity) return false;
      if (filters.active && !incidentUtils.isActive(incident)) return false;
      return true;
    });
  },

  /**
   * Sort incidents
   */
  sortIncidents: (incidents, sortBy = "recent") => {
    const sorted = [...incidents];
    switch (sortBy) {
      case "recent":
        return sorted.sort((a, b) => {
          const dateA = normalizeIncidentDate(a.createdAt);
          const dateB = normalizeIncidentDate(b.createdAt);
          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        });
      case "critical":
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return sorted.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = normalizeIncidentDate(a.createdAt);
          const dateB = normalizeIncidentDate(b.createdAt);
          return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
        });
      default:
        return sorted;
    }
  }
};

/**
 * Label getters
 */
function getIncidentTypeLabel(type) {
  const labels = {
    fire: "🔥 Fire",
    flood: "🌊 Flood",
    medical: "🏥 Medical Emergency",
    accident: "🚗 Accident",
    crime: "🚨 Crime",
    other: "❓ Other"
  };
  return labels[type] || type;
}

function getIncidentStatusLabel(status) {
  const labels = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    cancelled: "Cancelled"
  };
  return labels[status] || status;
}

function getSeverityLabel(severity) {
  const labels = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low"
  };
  return labels[severity] || severity;
}

/**
 * Mock incident generator (for demo purposes)
 */
export const generateMockIncidents = (count = 10) => {
  const types = Object.values(INCIDENT_TYPES);
  const severities = Object.values(SEVERITY_LEVELS);
  const statuses = Object.values(INCIDENT_STATUS);

  const incidents = [];
  for (let i = 0; i < count; i++) {
    incidents.push(
      createIncidentTemplate({
        id: `incident_${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lat: 23.45 + Math.random() * 0.3,
        lng: 87.2 + Math.random() * 0.5,
        address: `Location ${i + 1}`,
        description: `Sample incident description ${i + 1}`,
        reportedBy: `User ${i + 1}`,
        phoneNumber: "98765432" + String(i).padStart(2, "0")
      })
    );
  }
  return incidents;
};

export default {
  INCIDENT_TYPES,
  INCIDENT_STATUS,
  SEVERITY_LEVELS,
  createIncidentTemplate,
  incidentUtils,
  generateMockIncidents
};
