/**
 * CRYSIS OS Admin Dashboard
 * Control room for emergency coordinators and administrators
 */

import { useState, useEffect } from "react";
import { Eye, Filter, AlertCircle } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { MapView } from "../components/map/MapView";
import { IncidentCard } from "../components/incident/IncidentCard";
import { IncidentDetails } from "../components/incident/IncidentDetails";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Form";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { INCIDENT_STATUS, INCIDENT_TYPES } from "../services/incidentService";
import { incidentUtils } from "../services/incidentService";
import { incidentService } from "../services/firebase";
import emergencyData from "../data/emergencyData";
import cityConfig from "../data/cityConfig";
import aiService from "../services/aiService";
import { calculateDistance, estimateResponseTime, formatDistance } from "../utils/geoUtils";

export const AdminDashboard = ({
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onSwitchRole = () => {},
  onLogout = () => {}
}) => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [nearbyServices, setNearbyServices] = useState(null);
  const [aiReco, setAiReco] = useState(null);

  // Handle incident selection with AI recommendations
  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    
    // Generate AI recommendations
    const reco = aiService.analyzeIncident(incident);
    setAiReco(reco);
    
    // Get nearby services
    const nearest = aiService.getNearestUnits(
      incident.lat,
      incident.lng,
      incident.type
    );
    setNearbyServices(nearest);
    
    setShowDetails(true);
  };

  // Filter state
  const [filters, setFilters] = useState({
    type: "",
    status: INCIDENT_STATUS.OPEN,
    severity: ""
  });

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0
  });

  // Load incidents on mount - USE REAL FIREBASE
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        // ✅ USE REAL FIREBASE - Get all incidents from Firestore
        const dbIncidents = await incidentService.getIncidents();
        const normalizedIncidents = dbIncidents.filter((incident) => {
          const lat = Number(incident.lat);
          const lng = Number(incident.lng);
          return Number.isFinite(lat) && Number.isFinite(lng);
        }).map((incident) => ({
          ...incident,
          lat: Number(incident.lat),
          lng: Number(incident.lng),
          type: incident.type || INCIDENT_TYPES.OTHER,
          status: incident.status || INCIDENT_STATUS.OPEN
        }));

        console.log("Loaded incidents from Firebase (Admin):", normalizedIncidents);
        setIncidents(normalizedIncidents);
      } catch (error) {
        console.error("Error loading incidents from Firebase:", error);
        // Avoid fake static markers in admin map when backend fetch fails.
        setIncidents([]);
      }
    };
    
    // Load incidents immediately
    loadIncidents();
    
    // Refresh every 5 seconds to get latest data
    const interval = setInterval(loadIncidents, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Update filtered incidents and stats when incidents or filters change
  useEffect(() => {
    let filtered = incidents;

    if (filters.type) {
      filtered = filtered.filter(i => i.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    if (filters.severity) {
      filtered = filtered.filter(i => i.severity === filters.severity);
    }

    setFilteredIncidents(incidentUtils.sortIncidents(filtered, "critical"));

    // Update stats
    setStats({
      total: incidents.length,
      open: incidents.filter(i => i.status === INCIDENT_STATUS.OPEN).length,
      inProgress: incidents.filter(i => i.status === INCIDENT_STATUS.IN_PROGRESS).length,
      resolved: incidents.filter(i => i.status === INCIDENT_STATUS.RESOLVED).length,
      critical: incidents.filter(i => i.severity === "critical").length
    });
  }, [incidents, filters]);

  const mapIncidents = incidents.filter((incident) =>
    incidentUtils.isActive(incident)
  );

  // Update nearby services and AI recommendations when incident is selected
  useEffect(() => {
    if (selectedIncident) {
      const nearest = aiService.getNearestUnits(
        selectedIncident.lat,
        selectedIncident.lng,
        selectedIncident.type
      );
      setNearbyServices(nearest);
      const reco = aiService.analyzeIncident(selectedIncident);
      setAiReco(reco);
    }
  }, [selectedIncident]);

  // Handle incident status update - SAVE TO FIREBASE
  const handleStatusUpdate = async (incidentId, newStatus) => {
    try {
      // Validate incident ID
      if (!incidentId || incidentId.trim() === "") {
        throw new Error("No valid incident ID found");
      }
      
      console.log(`🔔 Status update requested: ${incidentId} -> ${newStatus}`);
      
      // Update in Firebase
      await incidentService.updateIncident(incidentId, { status: newStatus });
      
      // Update local state
      setIncidents(prev =>
        prev.map(inc =>
          inc.id === incidentId
            ? { ...inc, status: newStatus, updatedAt: new Date().toISOString() }
            : inc
        )
      );
      
      // Close the detail panel immediately
      setShowDetails(false);
      setSelectedIncident(null);
      
      // Show success message
      alert(`✅ Incident marked as ${newStatus}!`);
    } catch (error) {
      console.error("❌ Details:", {
        incidentId,
        newStatus,
        error: error.message,
        selectedIncidentId: selectedIncident?.id
      });
      alert(`❌ ${error.message}. Please refresh the page and try again.`);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({ type: "", status: INCIDENT_STATUS.OPEN, severity: "" });
  };

  const panelClassName = isDarkMode
    ? "bg-gray-900 border border-gray-700"
    : "bg-white border border-gray-200";

  return (
    <div className={`flex min-h-screen ${isDarkMode ? "bg-gray-950" : "bg-gray-100"} transition-colors`}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar
          title="Control Room - Emergency Coordinator"
          activeIncidents={stats.open + stats.inProgress}
          location={cityConfig.name}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          currentRole="admin"
          onSwitchRole={onSwitchRole}
          onLogout={onLogout}
        />

        {/* Content Area */}
        <div className={`flex-1 overflow-auto p-3 sm:p-6 ${isDarkMode ? "bg-gray-950" : "bg-gray-100"} transition-colors`}>
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <StatCard label="Total" value={stats.total} color="blue" isDarkMode={isDarkMode} />
              <StatCard label="Open" value={stats.open} color="red" isDarkMode={isDarkMode} />
              <StatCard label="In Progress" value={stats.inProgress} color="yellow" isDarkMode={isDarkMode} />
              <StatCard label="Resolved" value={stats.resolved} color="green" isDarkMode={isDarkMode} />
              <StatCard label="Critical" value={stats.critical} color="red" isDarkMode={isDarkMode} />
            </div>

            {/* Main Layout: Map + Incidents */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Map Section (Left: 2 columns) */}
              <div className="lg:col-span-2">
                <div className={`rounded-xl p-3 sm:p-4 transition-colors ${panelClassName}`}>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg" style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}>📍 Real-Time Incident Map</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72 sm:h-96">
                    <MapView
                      center={{ lat: cityConfig.coordinates.lat, lng: cityConfig.coordinates.lng }}
                      zoom={cityConfig.map.minZoom}
                      incidents={mapIncidents}
                      onMarkerClick={(incident) => handleIncidentSelect(incident)}
                    />
                  </CardContent>
                </div>
              </div>

              {/* Incidents List (Right: 1 column) */}
              <div className="space-y-3 sm:space-y-4">
                {/* Filters */}
                <div className={`rounded-xl p-3 sm:p-4 transition-colors ${panelClassName}`}>
                  <CardHeader>
                    <CardTitle
                      className="text-base sm:text-lg flex items-center gap-2"
                      style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}
                    >
                      <Filter size={18} />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 transition-colors" style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}>
                    <Select
                      value={filters.type}
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      isDarkMode={isDarkMode}
                      options={[
                        { value: "", label: "All Types" },
                        { value: INCIDENT_TYPES.FIRE, label: "🔥 Fire" },
                        { value: INCIDENT_TYPES.FLOOD, label: "🌊 Flood" },
                        { value: INCIDENT_TYPES.MEDICAL, label: "🏥 Medical" },
                        { value: INCIDENT_TYPES.ACCIDENT, label: "🚗 Accident" },
                        { value: INCIDENT_TYPES.CRIME, label: "🚨 Crime" }
                      ]}
                    />
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      isDarkMode={isDarkMode}
                      options={[
                        { value: "", label: "All Status" },
                        { value: INCIDENT_STATUS.OPEN, label: "Open" },
                        { value: INCIDENT_STATUS.IN_PROGRESS, label: "In Progress" },
                        { value: INCIDENT_STATUS.RESOLVED, label: "Resolved" }
                      ]}
                    />
                    <Select
                      value={filters.severity}
                      onChange={(e) => handleFilterChange("severity", e.target.value)}
                      isDarkMode={isDarkMode}
                      options={[
                        { value: "", label: "All Severity" },
                        { value: "critical", label: "🔴 Critical" },
                        { value: "high", label: "🟠 High" },
                        { value: "medium", label: "🟡 Medium" },
                        { value: "low", label: "🟢 Low" }
                      ]}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </div>

                {/* Incidents List */}
                <div className={`rounded-xl p-3 sm:p-4 transition-colors ${panelClassName}`}>
                  <CardHeader>
                    <CardTitle
                      className="text-base sm:text-lg"
                      style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}
                    >
                      Incidents ({filteredIncidents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto transition-colors" style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}>
                    {filteredIncidents.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4 transition-colors">No incidents</p>
                    ) : (
                      filteredIncidents.map(incident => (
                        <div
                          key={incident.id}
                          onClick={() => handleIncidentSelect(incident)}
                          className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border-l-4"
                          style={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                            borderColor: incidentUtils.getSeverityColor(incident.severity)
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm transition-colors" style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}>
                                {incident.type.toUpperCase()}
                              </p>
                              <p className="text-xs line-clamp-1 transition-colors" style={{ color: isDarkMode ? "#cbd5e1" : "#4b5563" }}>
                                {incident.address}
                              </p>
                            </div>
                            <Eye size={14} className={isDarkMode ? "text-gray-500 mt-1" : "text-gray-400 mt-1"} />
                          </div>
                          <div className="mt-2 flex gap-1">
                            <Badge variant={incident.severity} className="text-xs">
                              {incident.severity}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details Modal */}
      {showDetails && selectedIncident && (
        <IncidentDetailsAdmin
          incident={selectedIncident}
          aiRecommendations={aiReco}
          nearestUnits={nearbyServices || []}
          onClose={() => setShowDetails(false)}
          onStatusUpdate={(newStatus) => {
            handleStatusUpdate(selectedIncident.id, newStatus);
            setShowDetails(false);
          }}
        />
      )}
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ label, value, color, isDarkMode = false }) => {
  const colors = {
    blue: isDarkMode
      ? "bg-blue-900 text-blue-100 border-blue-700"
      : "bg-blue-100 text-blue-900 border-blue-300",
    red: isDarkMode
      ? "bg-red-900 text-red-100 border-red-700"
      : "bg-red-100 text-red-900 border-red-300",
    yellow: isDarkMode
      ? "bg-yellow-900 text-yellow-100 border-yellow-700"
      : "bg-yellow-100 text-yellow-900 border-yellow-300",
    green: isDarkMode
      ? "bg-green-900 text-green-100 border-green-700"
      : "bg-green-100 text-green-900 border-green-300"
  };

  return (
    <div className={`rounded-lg p-4 border-2 transition-colors ${colors[color]}`}>
      <CardContent className="text-center py-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm mt-1">{label}</p>
      </CardContent>
    </div>
  );
};

/**
 * Admin Incident Details Sidebar
 * Shows incident details in a right-side panel with AI recommendations and evacuation routes
 */
const IncidentDetailsAdmin = ({ incident, aiRecommendations, nearestUnits, onClose, onStatusUpdate }) => {
  if (!incident) return null;

  const formatted = incidentUtils.formatIncident(incident);
  const severityColor = incidentUtils.getSeverityColor(incident.severity);
  
  // Determine if evacuation routes should be shown
  const needsEvacuation = ["fire", "flood", "crime"].includes(incident.type);
  
  // Calculate nearby shelters for evacuation
  const evacuationShelters = needsEvacuation 
    ? emergencyData.shelters
        .map(shelter => ({
          ...shelter,
          distance: calculateDistance(incident.lat, incident.lng, shelter.lat, shelter.lng)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
    : [];

  return (
    // Right sidebar overlay
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      
      {/* Right Sidebar Panel */}
      <div className="absolute right-0 top-0 h-screen w-96 bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2" style={{ borderColor: severityColor }}>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: severityColor }}
              >
                {incident.type.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{formatted.typeLabel}</h2>
                <p className="text-xs text-gray-600">{formatted.createdDate}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl p-2"
            >
              ✕
            </button>
          </div>
          
          {/* Status Badges */}
          <div className="px-4 pb-3 flex gap-2">
            <Badge variant={incident.severity}>{incident.severity.toUpperCase()}</Badge>
            <Badge variant={incident.status === "resolved" ? "success" : "info"}>
              {formatted.statusLabel}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm">Description</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {incident.description}
            </p>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm">📍 Location</h4>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-semibold">Address:</span> {incident.address || "Not provided"}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Coordinates:</span>
              </p>
              <p className="font-mono text-blue-600">
                {incident.lat?.toFixed(6)}, {incident.lng?.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Reporter */}
          <div>
            <h4 className="font-bold text-gray-900 mb-2 text-sm">👤 Reporter</h4>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <p className="text-gray-700">{incident.reportedBy || "Anonymous"}</p>
              {incident.phoneNumber && (
                <p className="text-blue-600 mt-1">{incident.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">⚡ AI Decision Support</h4>
              <div className="space-y-2">
                {/* Priority */}
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-xs font-bold text-red-700">PRIORITY LEVEL</p>
                  <p className="text-lg font-bold text-red-600 mt-1">{aiRecommendations.priority?.toUpperCase()}</p>
                </div>
                
                {/* Recommended Actions */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs font-bold text-blue-700 mb-2">RECOMMENDED ACTIONS</p>
                  <ul className="space-y-1">
                    {aiRecommendations.actions?.slice(0, 4).map((action, idx) => (
                      <li key={idx} className="text-xs text-blue-800 flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">✓</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Alerts */}
                {aiRecommendations.alerts && aiRecommendations.alerts.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <p className="text-xs font-bold text-orange-700 mb-2">⚠️ ALERTS</p>
                    <ul className="space-y-1">
                      {aiRecommendations.alerts.map((alert, idx) => (
                        <li key={idx} className="text-xs text-orange-800">
                          • {alert.type === "risk_zone" ? "High-risk zone detected" : alert.type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nearest Emergency Units */}
          {nearestUnits && nearestUnits.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">🚔 Nearest Units</h4>
              <div className="space-y-2">
                {nearestUnits.slice(0, 3).map((unit, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
                    <p className="font-semibold text-gray-900">{unit.name}</p>
                    {unit.distance && (
                      <p className="text-xs text-gray-600 mt-1">
                        📏 {calculateDistance(incident.lat, incident.lng, unit.lat, unit.lng).toFixed(1)} km away
                      </p>
                    )}
                    {unit.phone && (
                      <p className="text-xs text-green-700 mt-1">📞 {unit.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evacuation Routes (If Needed) */}
          {needsEvacuation && evacuationShelters.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">🏃 Evacuation Routes to Safety</h4>
              <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-lg">
                <p className="text-xs font-bold text-amber-700 mb-3">NEARBY SAFE PLACES</p>
                <div className="space-y-2">
                  {evacuationShelters.map((shelter, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-amber-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{shelter.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{shelter.address}</p>
                          <p className="text-xs text-amber-700 font-semibold mt-1">
                            🏠 Capacity: {shelter.capacity} people
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-600">
                            {shelter.distance.toFixed(1)} km
                          </p>
                          <p className="text-xs text-orange-600">
                            {estimateResponseTime(shelter.distance)} travel
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Sticky Bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2">
          <Button
            variant="success"
            size="sm"
            className="w-full"
            onClick={() => onStatusUpdate(INCIDENT_STATUS.IN_PROGRESS)}
          >
            ✓ Mark In Progress
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onStatusUpdate(INCIDENT_STATUS.RESOLVED)}
          >
            ✓ Resolve Incident
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onClose()}
          >
            ✕ Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
