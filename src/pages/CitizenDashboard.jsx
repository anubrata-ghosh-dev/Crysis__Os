/**
 * CRYSIS OS Citizen Dashboard
 * Main interface for citizens to report and track emergencies
 */

import { useState, useEffect } from "react";
import { AlertCircle, Phone } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { MapView } from "../components/map/MapView";
import { IncidentForm } from "../components/incident/IncidentForm";
import { IncidentCard } from "../components/incident/IncidentCard";
import { IncidentDetails } from "../components/incident/IncidentDetails";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { generateMockIncidents } from "../services/incidentService";
import { incidentService } from "../services/firebase";
import emergencyData from "../data/emergencyData";
import cityConfig from "../data/cityConfig";
import aiService from "../services/aiService";
import useLocation from "../hooks/useLocation";

const REPORT_RATE_LIMIT_KEY = "crysis_report_timestamps";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REPORTS_PER_WINDOW = 3;

const checkReportRateLimit = () => {
  const now = Date.now();
  const raw = localStorage.getItem(REPORT_RATE_LIMIT_KEY);
  const stored = raw ? JSON.parse(raw) : [];

  const recentTimestamps = stored.filter((timestamp) => now - timestamp <= RATE_LIMIT_WINDOW_MS);

  if (recentTimestamps.length >= MAX_REPORTS_PER_WINDOW) {
    const oldestAllowed = recentTimestamps[0];
    const waitMs = RATE_LIMIT_WINDOW_MS - (now - oldestAllowed);
    const waitMinutes = Math.max(1, Math.ceil(waitMs / 60000));
    throw new Error(`Rate limit reached. Please wait about ${waitMinutes} minute(s) before reporting again.`);
  }

  const updated = [...recentTimestamps, now];
  localStorage.setItem(REPORT_RATE_LIMIT_KEY, JSON.stringify(updated));
};

export const CitizenDashboard = ({
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onSwitchRole = () => {},
  onLogout = () => {}
}) => {
  const { location, getCurrentPosition } = useLocation();
  const [activeView, setActiveView] = useState("map"); // map, report, list
  const [showForm, setShowForm] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [nearbyServices, setNearbyServices] = useState(null);
  const [aiReco, setAiReco] = useState(null);
  const [locationAsked, setLocationAsked] = useState(false);

  // Request location permission when component mounts
  useEffect(() => {
    if (!locationAsked) {
      getCurrentPosition();
      setLocationAsked(true);
    }
  }, []);

  // Load incidents on mount - USE REAL FIREBASE
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        // ✅ USE REAL FIREBASE
        const dbIncidents = await incidentService.getIncidents();
        console.log("Loaded incidents from Firebase (Citizen):", dbIncidents);
        setIncidents(dbIncidents);
      } catch (error) {
        console.error("Error loading incidents from Firebase:", error);
        // Fallback to mock data if Firebase fails
        console.log("Falling back to mock data");
        setIncidents(generateMockIncidents(8));
      }
    };
    
    // Load incidents immediately
    loadIncidents();
    
    // Refresh every 5 seconds to get latest data
    const interval = setInterval(loadIncidents, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Update nearby services when location changes
  useEffect(() => {
    if (location && selectedIncident) {
      const nearest = aiService.getNearestUnits(
        selectedIncident.lat,
        selectedIncident.lng,
        selectedIncident.type
      );
      setNearbyServices(nearest);
    }
  }, [location, selectedIncident]);

  // Handle incident selection
  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    const reco = aiService.analyzeIncident(incident);
    setAiReco(reco);
    setShowDetails(true);
  };

  // Handle form submission
  const handleReportSubmit = async (formData) => {
    try {
      console.log("📋 Submitting incident report...");

      checkReportRateLimit();
      
      // Save to Firebase
      const savedIncident = await incidentService.createIncident({
        ...formData,
        status: "open"
      });
      
      console.log("✅ Incident saved to Firebase with ID:", savedIncident.id);
      
      // Add Firebase-returned incident to local state
      setIncidents(prev => [savedIncident, ...prev]);
    } catch (error) {
      console.error("❌ Error saving to Firebase:", error.message);
      alert(`⚠️ Could not save to Firebase: ${error.message}. Please check your internet connection and try again.`);
    }

    // Form will show success message and close itself
  };

  // Quick action buttons
  const quickActions = [
    { label: "📞 Police: 100", number: "100", color: "bg-blue-600" },
    { label: "🚑 Ambulance: 102", number: "102", color: "bg-green-600" },
    { label: "🔥 Fire: 101", number: "101", color: "bg-red-600" }
  ];

  return (
    <div className={`flex min-h-screen ${isDarkMode ? "bg-gray-950" : "bg-gray-100"} transition-colors`}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar
          title="Emergency Response System"
          activeIncidents={incidents.filter(i => i.status === "open").length}
          showActiveIncidents={false}
          location={cityConfig.name}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          currentRole="citizen"
          onSwitchRole={onSwitchRole}
          onLogout={onLogout}
        />

        {/* Content Area */}
        <div className={`flex-1 overflow-auto p-3 sm:p-6 ${isDarkMode ? "bg-gray-950" : "bg-gray-100"} transition-colors`}>
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Quick Emergency Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.number}
                  className={`${action.color} text-white py-3 sm:py-4 text-base sm:text-lg font-bold h-auto rounded-xl`}
                  onClick={() => window.location.href = `tel:${action.number}`}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Main Report Button */}
            <Card className="bg-gradient-to-r from-red-500 to-red-600 border-0 rounded-2xl">
              <CardContent className="py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Report an Emergency</h3>
                  <p className="text-red-100 mt-1 text-sm sm:text-base">Click below to report an incident</p>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowForm(!showForm)}
                  className="bg-white text-red-600 hover:bg-red-50 w-full sm:w-auto"
                >
                  {showForm ? "✕ Cancel" : "🚨 Report Now"}
                </Button>
              </CardContent>
            </Card>

            {/* Report Form */}
            {showForm && (
              <IncidentForm 
                onSubmit={handleReportSubmit}
                onClose={() => setShowForm(false)}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Tabs for View Selection */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "map", label: "🗺️ Map View" },
                
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeView === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Map View */}
            {activeView === "map" && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-md h-[70vh] sm:h-96">
                <MapView
                  center={location || { lat: cityConfig.coordinates.lat, lng: cityConfig.coordinates.lng }}
                  zoom={16}
                  incidents={[]}
                  userLocation={location}
                  onMarkerClick={handleIncidentSelect}
                />
              </div>
            )}

            {/* List View */}
            {activeView === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {incidents.length === 0 ? (
                  <Card className="col-span-full p-6 sm:p-8 text-center rounded-2xl">
                    <p className="text-gray-500 text-lg">No incidents to display</p>
                  </Card>
                ) : (
                  incidents.map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      isDarkMode={isDarkMode}
                      onClick={() => handleIncidentSelect(incident)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incident Details Modal */}
      {showDetails && (
        <IncidentDetails
          incident={selectedIncident}
          aiRecommendations={aiReco}
          nearestUnits={nearbyServices || []}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default CitizenDashboard;
