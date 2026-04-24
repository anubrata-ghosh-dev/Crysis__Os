/**
 * Geographic Utilities for CRYSIS OS
 * Distance calculations, coordinate handling, etc.
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return (distanceKm * 1000).toFixed(0) + " m";
  }
  return distanceKm.toFixed(2) + " km";
};

/**
 * Estimate response time in minutes
 * @param distanceKm - distance in kilometers
 * @param avgSpeedKmh - average response speed (default 30 km/h)
 */
export const estimateResponseTime = (distanceKm, avgSpeedKmh = 30) => {
  return Math.ceil((distanceKm / avgSpeedKmh) * 60);
};

/**
 * Format time for display
 */
export const formatTime = (minutes) => {
  if (minutes < 1) return "< 1 min";
  if (minutes === 1) return "1 min";
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Check if point is within bounds
 */
export const isWithinBounds = (lat, lng, bounds) => {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

/**
 * Get bounding box around a center point
 */
export const getBoundingBox = (centerLat, centerLng, radiusKm) => {
  const latOffset = (radiusKm / 111); // 1 degree latitude ≈ 111 km
  const lngOffset = (radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180)));

  return {
    minLat: centerLat - latOffset,
    maxLat: centerLat + latOffset,
    minLng: centerLng - lngOffset,
    maxLng: centerLng + lngOffset
  };
};

/**
 * Convert coordinates to string for display
 */
export const coordinatesToString = (lat, lng) => {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

/**
 * Get direction between two points (N, NE, E, SE, S, SW, W, NW)
 */
export const getDirection = (fromLat, fromLng, toLat, toLng) => {
  const dLng = toLng - fromLng;
  const dLat = toLat - fromLat;
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);

  if (angle >= -22.5 && angle < 22.5) return "N";
  if (angle >= 22.5 && angle < 67.5) return "NE";
  if (angle >= 67.5 && angle < 112.5) return "E";
  if (angle >= 112.5 && angle < 157.5) return "SE";
  if (angle >= 157.5 || angle < -157.5) return "S";
  if (angle >= -157.5 && angle < -112.5) return "SW";
  if (angle >= -112.5 && angle < -67.5) return "W";
  if (angle >= -67.5 && angle < -22.5) return "NW";
};

/**
 * Format address with coordinates
 */
export const formatAddress = (address, lat, lng) => {
  if (!address && lat && lng) {
    return `${coordinatesToString(lat, lng)}`;
  }
  return address || "Unknown location";
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

export default {
  calculateDistance,
  formatDistance,
  estimateResponseTime,
  formatTime,
  isWithinBounds,
  getBoundingBox,
  coordinatesToString,
  getDirection,
  formatAddress,
  isValidCoordinates
};
