/**
 * CRYSIS OS MapView Component
 * Leaflet-based map for incident visualization
 */

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { calculateDistance } from "../../utils/geoUtils";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

export const MapView = ({
  center = { lat: 23.52, lng: 87.31 },
  zoom = 12,
  incidents = [],
  services = null,
  onMarkerClick = null,
  userLocation = null,
  className = ""
}) => {
  const [map, setMap] = useState(null);
  const [markersGroup, setMarkersGroup] = useState(null);

  // Initialize map
  useEffect(() => {
    const container = document.getElementById("map-container");
    if (!container) return;

    const mapInstance = L.map("map-container").setView([center.lat, center.lng], zoom);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
      }
    ).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Keep map focused on the latest detected location/center.
  useEffect(() => {
    if (!map || !center) return;

    const targetLat = userLocation?.lat ?? center.lat;
    const targetLng = userLocation?.lng ?? center.lng;
    map.setView([targetLat, targetLng], zoom, { animate: true });
  }, [map, center, zoom, userLocation]);

  // Update markers when incidents change
  useEffect(() => {
    if (!map) return;

    // Clear previous markers
    if (markersGroup) {
      markersGroup.clearLayers();
    } else {
      const newGroup = L.layerGroup().addTo(map);
      setMarkersGroup(newGroup);
      return;
    }

    // Add user location marker
    if (userLocation) {
      const userMarker = L.circleMarker(
        [userLocation.lat, userLocation.lng],
        {
          radius: 8,
          fillColor: "#3b82f6",
          color: "#1e40af",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8
        }
      );
      userMarker.bindPopup("📍 Your Location");
      markersGroup.addLayer(userMarker);
    }

    // Add incident markers
    incidents.forEach((incident) => {
      const icon = getIncidentIcon(incident.type);
      const marker = L.marker([incident.lat, incident.lng], { icon }).bindPopup(
        `<strong>${incident.type.toUpperCase()}</strong><br/>
        Severity: ${incident.severity}<br/>
        Status: ${incident.status}`
      );

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(incident));
      }

      markersGroup.addLayer(marker);
    });

    // Add service markers if provided
    if (services) {
      services.forEach((service) => {
        const icon = getServiceIcon(service.type);
        const marker = L.marker([service.lat, service.lng], { icon }).bindPopup(
          `<strong>${service.name}</strong><br/>
          Distance: ${service.distance?.toFixed(2) || "?"} km<br/>
          Phone: ${service.phone}`
        );
        markersGroup.addLayer(marker);
      });
    }
  }, [map, incidents, services, userLocation, onMarkerClick, markersGroup]);

  return (
    <div
      id="map-container"
      className={`w-full h-full rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
};

/**
 * Create custom icon for incident type
 */
function getIncidentIcon(type) {
  const colors = {
    fire: "#ef4444",
    flood: "#06b6d4",
    medical: "#8b5cf6",
    accident: "#f97316",
    crime: "#ec4899",
    other: "#6b7280"
  };

  const color = colors[type] || colors.other;

  return L.divIcon({
    className: "custom-incident-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${getTypeEmoji(type)}
      </div>
    `,
    iconSize: [32, 32],
    popupAnchor: [0, -16]
  });
}

/**
 * Create custom icon for service type
 */
function getServiceIcon(type) {
  const colors = {
    hospital: "#10b981",
    police: "#3b82f6",
    fire: "#ef4444",
    shelter: "#f59e0b"
  };

  const color = colors[type] || colors.police;

  return L.divIcon({
    className: "custom-service-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      ">
        ${getServiceEmoji(type)}
      </div>
    `,
    iconSize: [28, 28],
    popupAnchor: [0, -14]
  });
}

/**
 * Get emoji for incident type
 */
function getTypeEmoji(type) {
  const emojis = {
    fire: "🔥",
    flood: "🌊",
    medical: "🏥",
    accident: "🚗",
    crime: "🚨",
    other: "❓"
  };
  return emojis[type] || emojis.other;
}

/**
 * Get emoji for service type
 */
function getServiceEmoji(type) {
  const emojis = {
    hospital: "🏥",
    police: "🚔",
    fire: "🚒",
    shelter: "🛖"
  };
  return emojis[type] || "📍";
}

export default MapView;
