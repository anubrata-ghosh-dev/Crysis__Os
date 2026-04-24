/**
 * CRYSIS OS Incident Form Component
 * Form for citizens to report emergencies
 */

import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Input, Label, Select, TextArea } from "../ui/Form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/Card";
import { INCIDENT_TYPES, SEVERITY_LEVELS } from "../../services/incidentService";
import useLocation from "../../hooks/useLocation";
import { calculateDistance } from "../../utils/geoUtils";

const DEMO_LOCATION_BOUNDS = {
  minLat: 23.35,
  maxLat: 23.72,
  minLng: 87.10,
  maxLng: 87.56
};

const MIN_DEMO_DISTANCE_KM = 1;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const FULL_NAME_REGEX = /^[A-Za-z][A-Za-z' -]{1,}\s+[A-Za-z][A-Za-z' -]{1,}$/;

const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

export const IncidentForm = ({ onSubmit = () => {}, onClose = () => {}, isDarkMode = false }) => {
  const { location, getCurrentPosition } = useLocation();
  const [formData, setFormData] = useState({
    type: "",
    severity: "",
    description: "",
    address: "",
    phoneNumber: "",
    reportedBy: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMode, setLocationMode] = useState("current");
  const lastDemoLocationRef = useRef(null);

  const isValidPhone = PHONE_REGEX.test(formData.phoneNumber.trim());
  const isValidFullName = FULL_NAME_REGEX.test(formData.reportedBy.trim());

  // Handle location fetching
  useEffect(() => {
    if (location && useCurrentLocation) {
      setSelectedLocation(location);
      setLocationMode("current");
    }
  }, [location, useCurrentLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      return;
    }

    if (name === "reportedBy") {
      const sanitizedName = value.replace(/[^A-Za-z' -]/g, "").replace(/\s{2,}/g, " ");
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedName
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetLocation = () => {
    setUseCurrentLocation(true);
    setLocationMode("current");
    getCurrentPosition();
  };

  const generateDemoLocation = () => {
    let attempts = 0;

    while (attempts < 100) {
      const candidate = {
        lat: getRandomInRange(DEMO_LOCATION_BOUNDS.minLat, DEMO_LOCATION_BOUNDS.maxLat),
        lng: getRandomInRange(DEMO_LOCATION_BOUNDS.minLng, DEMO_LOCATION_BOUNDS.maxLng),
        accuracy: 10,
        isDemo: true,
        timestamp: Date.now()
      };

      const previous = lastDemoLocationRef.current;
      const distanceFromPrevious = previous
        ? calculateDistance(previous.lat, previous.lng, candidate.lat, candidate.lng)
        : null;

      if (!previous || distanceFromPrevious >= MIN_DEMO_DISTANCE_KM) {
        lastDemoLocationRef.current = candidate;
        setSelectedLocation(candidate);
        setUseCurrentLocation(false);
        setLocationMode("demo");
        return;
      }

      attempts += 1;
    }

    alert("Could not generate a valid demo location. Please try again.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.type.trim()) {
      alert("Please select an incident type");
      return;
    }
    
    if (!formData.severity.trim()) {
      alert("Please select a severity level");
      return;
    }
    
    if (!formData.description.trim()) {
      alert("Please enter a description of the incident");
      return;
    }
    
    if (!formData.reportedBy.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!isValidFullName) {
      alert("Please enter your full name with surname (e.g., Anubrat Ghosh)");
      return;
    }
    
    if (!formData.phoneNumber.trim()) {
      alert("Please enter your contact number");
      return;
    }

    if (!isValidPhone) {
      alert("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        phoneNumber: `+91${formData.phoneNumber}`,
        lat: selectedLocation?.lat || 23.52,
        lng: selectedLocation?.lng || 87.31
      };

      // Call parent submission
      await onSubmit(submitData);
      
      // Show success state
      setIsSubmitted(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          type: "",
          severity: "",
          description: "",
          address: "",
          phoneNumber: "",
          reportedBy: ""
        });
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting incident:", error);
      alert("Error submitting incident. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - show confirmation
  if (isSubmitted) {
    return (
      <Card
        className="w-full max-w-2xl mx-auto border-2"
        style={{
          backgroundColor: isDarkMode ? "#052e16" : "#f0fdf4",
          borderColor: isDarkMode ? "#166534" : "#22c55e"
        }}
      >
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <CheckCircle className="text-green-600" size={64} />
          <h2 className="text-2xl font-bold" style={{ color: isDarkMode ? "#86efac" : "#15803d" }}>✓ Emergency Submitted Successfully!</h2>
          <p className="text-lg" style={{ color: isDarkMode ? "#bbf7d0" : "#16a34a" }}>
            Your incident has been reported and emergency responders have been notified.
          </p>
          <p style={{ color: isDarkMode ? "#bbf7d0" : "#16a34a" }}>
            Reference ID: <span className="font-mono font-bold">{`incident_${Date.now()}`}</span>
          </p>
          <p className="text-sm mt-4" style={{ color: isDarkMode ? "#86efac" : "#166534" }}>
            Help is on the way. Stay safe and await further instructions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full max-w-2xl mx-auto transition-colors"
      style={{
        backgroundColor: isDarkMode ? "#111827" : "#ffffff",
        borderColor: isDarkMode ? "#374151" : "#e5e7eb"
      }}
    >
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2"
          style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}
        >
          <AlertCircle className="text-red-600" size={24} />
          Report Emergency
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent
          className="space-y-4"
          style={{ color: isDarkMode ? "#f3f4f6" : "#000000" }}
        >
          {/* Location Display - PROMINENT */}
          <div
            className="p-5 rounded-lg border-2 transition-colors"
            style={{
              backgroundColor: isDarkMode ? "#111827" : "#f8fafc",
              borderColor: isDarkMode ? "#374151" : "#cbd5e1"
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <Label
                className="text-lg font-bold"
                style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}
              >
                📍 Your Exact Location
              </Label>
              <span
                className="text-sm font-bold px-3 py-1 rounded-full transition-colors"
                style={{
                  backgroundColor: selectedLocation
                    ? (locationMode === "demo" ? (isDarkMode ? "#172554" : "#dbeafe") : (isDarkMode ? "#064e3b" : "#dcfce7"))
                    : (isDarkMode ? "#78350f" : "#fef3c7"),
                  color: selectedLocation
                    ? (locationMode === "demo" ? (isDarkMode ? "#93c5fd" : "#1d4ed8") : (isDarkMode ? "#86efac" : "#166534"))
                    : (isDarkMode ? "#fcd34d" : "#b45309")
                }}
              >
                {selectedLocation ? (locationMode === "demo" ? "✓ DEMO LOCATION" : "✓ DETECTED") : "⚠ DEFAULT"}
              </span>
            </div>
            
            {selectedLocation ? (
              <div
                className="space-y-2 p-3 rounded border transition-colors"
                style={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  borderColor: isDarkMode ? "#4b5563" : "#dbeafe"
                }}
              >
                <p className="text-sm" style={{ color: isDarkMode ? "#e5e7eb" : "#374151" }}>
                  <span className="font-bold">Latitude:</span> <span className="font-mono text-lg text-blue-600 font-bold">{selectedLocation.lat.toFixed(6)}</span>
                </p>
                <p className="text-sm" style={{ color: isDarkMode ? "#e5e7eb" : "#374151" }}>
                  <span className="font-bold">Longitude:</span> <span className="font-mono text-lg text-blue-600 font-bold">{selectedLocation.lng.toFixed(6)}</span>
                </p>
                <p className="text-xs" style={{ color: isDarkMode ? "#cbd5e1" : "#4b5563" }}>
                  📏 Accuracy: ±{selectedLocation.accuracy ? selectedLocation.accuracy.toFixed(0) : "~20"}m
                </p>
                {locationMode === "demo" && (
                  <p className="text-xs" style={{ color: isDarkMode ? "#93c5fd" : "#1d4ed8" }}>
                    🎲 Demo location generated inside Durgapur-Asansol.
                  </p>
                )}
              </div>
            ) : (
              <div
                className="space-y-2 p-3 rounded border transition-colors"
                style={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  borderColor: isDarkMode ? "#4b5563" : "#fde68a"
                }}
              >
                <p className="text-sm" style={{ color: isDarkMode ? "#e5e7eb" : "#374151" }}>
                  <span className="font-bold">Latitude:</span> <span className="font-mono text-lg text-amber-600 font-bold">23.520000</span>
                </p>
                <p className="text-sm" style={{ color: isDarkMode ? "#e5e7eb" : "#374151" }}>
                  <span className="font-bold">Longitude:</span> <span className="font-mono text-lg text-amber-600 font-bold">87.310000</span>
                </p>
                <p className="text-xs mt-2" style={{ color: isDarkMode ? "#fbbf24" : "#b45309" }}>
                  📍 Allow location access for accurate coordinates
                </p>
              </div>
            )}
            
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                className="w-full"
              >
                🔄 {useCurrentLocation ? "Update" : "Use"} Current Location
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDemoLocation}
                className="w-full"
              >
                🎲 Demo Location
              </Button>
            </div>
          </div>

          {/* Incident Type */}
          <div>
            <Label htmlFor="type" style={{ color: isDarkMode ? "#f3f4f6" : "#000000" }}>Incident Type *</Label>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              isDarkMode={isDarkMode}
              options={[
                { value: "fire", label: "🔥 Fire" },
                { value: "flood", label: "🌊 Flood" },
                { value: "medical", label: "🏥 Medical Emergency" },
                { value: "accident", label: "🚗 Accident" },
                { value: "crime", label: "🚨 Crime" },
                { value: "other", label: "❓ Other" }
              ]}
            />
          </div>

          {/* Severity Level */}
          <div>
            <Label htmlFor="severity" style={{ color: isDarkMode ? "#f3f4f6" : "#000000" }}>Severity Level *</Label>
            <Select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              isDarkMode={isDarkMode}
              options={[
                { value: "critical", label: "🔴 Critical" },
                { value: "high", label: "🟠 High" },
                { value: "medium", label: "🟡 Medium" },
                { value: "low", label: "🟢 Low" }
              ]}
            />
          </div>

          {/* Address / Location Description */}
          <div>
            <Label htmlFor="address" style={{ color: isDarkMode ? "#f3f4f6" : "#000000" }}>Location / Address Description</Label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              isDarkMode={isDarkMode}
              placeholder="e.g., Near Durgapur Hospital, Main Road"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" style={{ color: isDarkMode ? "#f3f4f6" : "#000000" }}>Description Details *</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              isDarkMode={isDarkMode}
              placeholder="Please describe the incident in detail. Include any injuries, affected persons, hazards, etc."
              rows={4}
            />
          </div>

          {/* Reporter Name */}
          <div>
            <Label htmlFor="reportedBy" style={{ color: isDarkMode ? "#f3f4f6" : "#000000" }}>Your Full Name *</Label>
            <Input
              type="text"
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleInputChange}
              isDarkMode={isDarkMode}
              placeholder="Enter first name and surname"
              required
            />
            {!isValidFullName && formData.reportedBy.trim().length > 0 && (
              <p className="text-xs mt-1" style={{ color: isDarkMode ? "#fca5a5" : "#dc2626" }}>
                Enter at least first name and surname.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber" style={{ color: isDarkMode ? "#f3f4f6" : "#000000" }}>Contact Phone Number *</Label>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-2 rounded-lg border text-sm font-semibold"
                style={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#f3f4f6",
                  borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
                  color: isDarkMode ? "#f3f4f6" : "#111827"
                }}
              >
                +91
              </span>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                isDarkMode={isDarkMode}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                maxLength={10}
                required
              />
            </div>
            {!isValidPhone && formData.phoneNumber.trim().length > 0 && (
              <p className="text-xs mt-1" style={{ color: isDarkMode ? "#fca5a5" : "#dc2626" }}>
                Enter exactly 10 digits, starting with 6-9.
              </p>
            )}
          </div>

          {/* Privacy Notice */}
          <div
            className="p-3 rounded-lg border transition-colors"
            style={{
              backgroundColor: isDarkMode ? "#451a03" : "#fffbeb",
              borderColor: isDarkMode ? "#92400e" : "#fde68a"
            }}
          >
            <p className="text-xs" style={{ color: isDarkMode ? "#fde68a" : "#374151" }}>
              ⚠️ False reporting is a criminal offence and punishable under law .
              <br />
              Your location will be shared with emergency responders. Your contact information will be used only for emergency response.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            type="submit"
            variant="danger"
            size="lg"
            disabled={
              isLoading ||
              !formData.type.trim() ||
              !formData.severity.trim() ||
              !formData.description.trim() ||
              !formData.reportedBy.trim() ||
              !formData.phoneNumber.trim() ||
              !isValidFullName ||
              !isValidPhone
            }
            className="flex-1"
          >
            {isLoading ? "⏳ Submitting..." : "🚨 Report Emergency"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onClose}
            className="flex-1"
          >
            ✕ Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default IncidentForm;
