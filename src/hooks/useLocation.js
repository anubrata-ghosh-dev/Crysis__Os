/**
 * CRYSIS OS useLocation Hook
 * Handle geolocation and location tracking
 */

import { useState, useEffect, useCallback, useRef } from "react";

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const watchIdRef = useRef(null);
  const requestIdRef = useRef(0);

  /**
   * Check permission status using Permissions API
   */
  const checkPermission = useCallback(async () => {
    try {
      if (!navigator.permissions) {
        console.log("[GEOLOCATION] Permissions API not available");
        return null;
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' });
      console.log("[GEOLOCATION] Permission status:", permission.state);
      setPermissionStatus(permission.state);

      permission.addEventListener('change', () => {
        console.log("[GEOLOCATION] Permission changed to:", permission.state);
        setPermissionStatus(permission.state);
      });

      return permission.state;
    } catch (err) {
      console.warn("[GEOLOCATION] Could not check permission:", err);
      return null;
    }
  }, []);
  const getCurrentPosition = useCallback(() => {
    console.log("[GEOLOCATION] getCurrentPosition called");
    console.log("[GEOLOCATION] window.isSecureContext:", window.isSecureContext);
    console.log("[GEOLOCATION] hostname:", window.location.hostname);

    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
      const errMsg = "Location requires HTTPS (or localhost) in this browser.";
      console.error("[GEOLOCATION] Security context error:", errMsg);
      setError(errMsg);
      return;
    }

    if (!navigator.geolocation) {
      const errMsg = "Geolocation is not supported by this browser.";
      console.error("[GEOLOCATION] Geolocation not supported:", errMsg);
      setError(errMsg);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    console.log("[GEOLOCATION] Starting request ID:", currentRequestId);
    setIsLoading(true);

    const onSuccess = (position) => {
      console.log("[GEOLOCATION] Position received for request ID:", currentRequestId);
      console.log("[GEOLOCATION] Position data:", {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      if (currentRequestId !== requestIdRef.current) {
        console.log("[GEOLOCATION] Ignoring stale request", currentRequestId, "current is", requestIdRef.current);
        return;
      }

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        isDefault: false
      });
      setError(null);
      setIsLoading(false);
    };

    const onFailure = (err) => {
      console.error("[GEOLOCATION] Error on first attempt for request ID:", currentRequestId);
      console.error("[GEOLOCATION] Error code:", err.code);
      console.error("[GEOLOCATION] Error message:", err.message);

      if (currentRequestId !== requestIdRef.current) {
        console.log("[GEOLOCATION] Ignoring stale request on failure", currentRequestId);
        return;
      }

      // Retry once with relaxed constraints before falling back.
      console.log("[GEOLOCATION] Retrying with relaxed settings...");
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (retryErr) => {
          console.error("[GEOLOCATION] Retry also failed, request ID:", currentRequestId);
          console.error("[GEOLOCATION] Retry error code:", retryErr.code);
          console.error("[GEOLOCATION] Retry error message:", retryErr.message);

          if (currentRequestId !== requestIdRef.current) {
            console.log("[GEOLOCATION] Ignoring stale retry failure");
            return;
          }

          const errorMsg = retryErr.message || err.message;
          setError(errorMsg);
          setIsLoading(false);

          // Default to Durgapur coordinates if permission denied or unavailable.
          console.log("[GEOLOCATION] Falling back to default Durgapur location");
          setLocation({
            lat: 23.52,
            lng: 87.31,
            accuracy: null,
            timestamp: Date.now(),
            isDefault: true
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    };

    console.log("[GEOLOCATION] Calling navigator.geolocation.getCurrentPosition with high accuracy...");
    navigator.geolocation.getCurrentPosition(onSuccess, onFailure, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  }, []);

  /**
   * Start watching location changes
   */
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, []);

  /**
   * Stop watching location
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => stopWatching();
  }, [stopWatching]);

  /**
   * Note: Consumers should call getCurrentPosition() explicitly.
   */
  return {
    location,
    error,
    isLoading,
    permissionStatus,
    getCurrentPosition,
    checkPermission,
    startWatching,
    stopWatching
  };
};

export default useLocation;
