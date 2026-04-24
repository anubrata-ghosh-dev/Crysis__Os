/**
 * CRYSIS OS Incident Details Component
 * Detailed view of an incident with AI recommendations
 */

import { X, MapPin, Phone, AlertCircle, Zap } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { incidentUtils } from "../../services/incidentService";
import { formatDistance, estimateResponseTime, formatTime } from "../../utils/geoUtils";

export const IncidentDetails = ({ 
  incident, 
  aiRecommendations = null,
  nearestUnits = [],
  onClose = () => {} 
}) => {
  if (!incident) return null;

  const formatted = incidentUtils.formatIncident(incident);
  const severityColor = incidentUtils.getSeverityColor(incident.severity);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
              style={{ backgroundColor: severityColor + "20" }}
            >
              {formatted.typeLabel.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formatted.typeLabel}</h2>
              <p className="text-sm text-gray-600">{formatted.createdDate}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X size={24} />
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-6">
          {/* Status and Severity */}
          <div className="flex gap-2">
            <Badge variant={incident.severity}>{incident.severity.toUpperCase()}</Badge>
            <Badge variant={incident.status === "resolved" ? "success" : "info"}>
              {formatted.statusLabel}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {incident.description}
            </p>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin size={18} />
                Location
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  {incident.address || "No address provided"}
                </p>
                <p className="text-xs text-gray-600 font-mono">
                  {incident.lat?.toFixed(4)}, {incident.lng?.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Reporter Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                Reporter
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-1">
                  {incident.reportedBy || "Anonymous"}
                </p>
                {incident.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Phone size={14} />
                    {incident.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Recommendations Section */}
          {aiRecommendations && (
            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="text-blue-600" size={18} />
                AI Decision Support
              </h3>

              {/* Priority */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Priority Level:</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {aiRecommendations.priority?.toUpperCase() || "UNKNOWN"}
                </p>
              </div>

              {/* Recommended Actions */}
              {aiRecommendations.actions && aiRecommendations.actions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</p>
                  <ul className="space-y-1">
                    {aiRecommendations.actions.map((action, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">✓</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alerts */}
              {aiRecommendations.alerts && aiRecommendations.alerts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">⚠️ Alerts:</p>
                  <div className="space-y-2">
                    {aiRecommendations.alerts.map((alert, idx) => (
                      <div key={idx} className="text-sm text-gray-700 bg-white p-2 rounded">
                        {alert.message || `${alert.type}: ${JSON.stringify(alert)}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nearest Units */}
          {nearestUnits && nearestUnits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Nearest Emergency Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nearestUnits.map((unit, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{unit.name}</p>
                    <div className="text-sm text-gray-700 mt-2 space-y-1">
                      <p>📍 {formatDistance(unit.distance)} away</p>
                      <p>⏱️ ETA: {formatTime(estimateResponseTime(unit.distance))}</p>
                      {unit.phone && <p>📞 {unit.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responders */}
          {incident.responders && incident.responders.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Assigned Responders</h3>
              <div className="space-y-2">
                {incident.responders.map((responder, idx) => (
                  <div key={idx} className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{responder.name}</p>
                      <p className="text-sm text-gray-600">{responder.unit}</p>
                    </div>
                    <Badge variant="info">
                      {responder.status || "Dispatched"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentDetails;
