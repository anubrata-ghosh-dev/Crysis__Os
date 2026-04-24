/**
 * CRYSIS OS Incident Card Component
 * Display incident information in card format
 */

import { MapPin, Clock, AlertCircle } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { incidentUtils } from "../../services/incidentService";
import { formatDistance, formatTime, estimateResponseTime } from "../../utils/geoUtils";

export const IncidentCard = ({ 
  incident, 
  onClick = null,
  nearestUnit = null,
  className = "",
  isDarkMode = false
}) => {
  const formatted = incidentUtils.formatIncident(incident);
  const severityColor = incidentUtils.getSeverityColor(incident.severity);
  const icon = incidentUtils.getIncidentIcon(incident.type);

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-lg transition-all ${className}`}
      style={{
        backgroundColor: isDarkMode ? (incident.severity === "critical" ? "#450a0a" : "#111827") : (incident.severity === "critical" ? "#fef2f2" : "#ffffff"),
        borderColor: incident.severity === "critical" ? (isDarkMode ? "#7f1d1d" : "#fca5a5") : (isDarkMode ? "#374151" : "#e5e7eb")
      }}
      variant={incident.severity === "critical" ? "critical" : "default"}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: severityColor + "20" }}
          >
            {formatted.typeLabel.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: isDarkMode ? "#f3f4f6" : "#111827" }}>{formatted.typeLabel}</h3>
            <p className="text-sm line-clamp-2" style={{ color: isDarkMode ? "#d1d5db" : "#4b5563" }}>{incident.description}</p>
          </div>
        </div>
        <Badge variant={incident.severity}>
          {incident.severity.toUpperCase()}
        </Badge>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm mb-2" style={{ color: isDarkMode ? "#d1d5db" : "#374151" }}>
        <MapPin size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <span>{incident.address || `${incident.lat?.toFixed(3)}, ${incident.lng?.toFixed(3)}`}</span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm mb-3" style={{ color: isDarkMode ? "#d1d5db" : "#374151" }}>
        <Clock size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <span>{formatted.createdDate}</span>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={incident.status === "resolved" ? "success" : "info"}>
          {formatted.statusLabel}
        </Badge>
        {incident.responders && incident.responders.length > 0 && (
          <Badge variant="info">
            {incident.responders.length} responder{incident.responders.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Nearest Unit Info */}
      {nearestUnit && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <div className="font-medium text-blue-900 mb-1">Nearest Unit</div>
          <div className="flex justify-between">
            <span className="text-blue-800">{nearestUnit.name}</span>
            <span className="text-blue-600 font-medium">
              {formatDistance(nearestUnit.distance)} away
            </span>
          </div>
          <div className="text-blue-700 mt-1">
            ETA: {formatTime(estimateResponseTime(nearestUnit.distance))}
          </div>
        </div>
      )}

      {/* Reporter Info (if available) */}
      {incident.reportedBy && (
        <div className="text-xs mt-3 pt-3 border-t" style={{ color: isDarkMode ? "#cbd5e1" : "#4b5563", borderColor: isDarkMode ? "#374151" : "#e5e7eb" }}>
          Reported by: {incident.reportedBy}
          {incident.phoneNumber && ` • ${incident.phoneNumber}`}
        </div>
      )}
    </Card>
  );
};

export default IncidentCard;
