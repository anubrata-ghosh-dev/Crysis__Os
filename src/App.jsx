/**
 * CRYSIS OS - Main Application
 * Intelligent Emergency Response Operating System
 */

import { useState, useEffect } from "react";
import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

const ROLE_STORAGE_KEY = "crysis_user_role";
const ADMIN_AUTH_KEY = "crysis_admin_auth";
const normalizePasskey = (value = "") => value.trim().replace(/^['\"]|['\"]$/g, "");
const ADMIN_PASSKEY = normalizePasskey(import.meta.env.VITE_ADMIN_PASSKEY || "crysis-admin-2026");

const getRoleFromPath = (pathname) => {
  if (pathname === "/admin") return "admin";
  if (pathname === "/citizen") return "citizen";
  return null;
};

const getPathForRole = (role) => (role === "admin" ? "/admin" : "/citizen");

const goToRolePath = (role, replace = false) => {
  const targetPath = getPathForRole(role);
  if (window.location.pathname !== targetPath) {
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", targetPath);
  }
};

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("crysis_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode to document
  useEffect(() => {
    localStorage.setItem("crysis_dark_mode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const persistRole = (role, replace = false) => {
    setUserRole(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);

    const targetPath = getPathForRole(role);
    if (window.location.pathname !== targetPath) {
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({}, "", targetPath);
    }
  };

  const clearRole = (replace = false) => {
    setUserRole(null);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);

    if (window.location.pathname !== "/") {
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({}, "", "/");
    }
  };

  const requestAdminAccess = () => {
    const alreadyAuthorized = sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
    if (alreadyAuthorized) return true;

    const enteredPasskey = window.prompt("Enter admin passkey to access Control Room:");
    if (enteredPasskey === null) return false;

    if (normalizePasskey(enteredPasskey) === ADMIN_PASSKEY) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      return true;
    }

    window.alert("Invalid passkey. Admin access denied. If you recently changed .env.local, restart the dev server and refresh.");
    return false;
  };

  const enterRole = (role, replace = false) => {
    if (role === "admin" && !requestAdminAccess()) {
      return false;
    }

    if (role === "citizen") {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }

    persistRole(role, replace);
    return true;
  };

  // Initialize role from URL first, then localStorage fallback
  useEffect(() => {
    const pathRole = getRoleFromPath(window.location.pathname);
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    const initialRole = pathRole || savedRole;

    if (!initialRole) {
      if (window.location.pathname !== "/") {
        window.history.replaceState({}, "", "/");
      }
      return;
    }

    const entered = enterRole(initialRole, true);
    if (!entered) {
      clearRole(true);
    }
  }, []);

  // Keep app state in sync with browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const pathRole = getRoleFromPath(window.location.pathname);

      if (!pathRole) {
        clearRole(true);
        return;
      }

      const entered = enterRole(pathRole, true);
      if (!entered) {
        clearRole(true);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleLogin = (role) => {
    goToRolePath(role);
    const entered = enterRole(role);
    if (!entered) {
      clearRole(true);
    }
  };

  const handleLogout = () => {
    clearRole();
  };

  const handleRoleSwitch = (nextRole) => {
    if (!nextRole || nextRole === userRole) return;
    goToRolePath(nextRole);
    const entered = enterRole(nextRole);
    if (!entered) {
      clearRole(true);
    }
  };

  // If not logged in, show login screen
  if (!userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Render appropriate dashboard based on role
  return userRole === "admin" ? (
    <AdminDashboard
      isDarkMode={isDarkMode}
      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      onSwitchRole={handleRoleSwitch}
      onLogout={handleLogout}
    />
  ) : (
    <CitizenDashboard
      isDarkMode={isDarkMode}
      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      onSwitchRole={handleRoleSwitch}
      onLogout={handleLogout}
    />
  );
}

/**
 * Login Screen Component
 */
function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-400 mb-2">CRYSIS OS</h1>
          <p className="text-xl text-gray-300">
            Intelligent Emergency Response System
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Durgapur-Asansol Region
          </p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {/* Citizen Button */}
          <button
            onClick={() => onLogin("citizen")}
            className="w-full group relative overflow-hidden bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl">👤</span>
              <div className="text-left">
                <div className="font-bold">Citizen</div>
                <div className="text-xs text-blue-200">Report Emergencies</div>
              </div>
            </div>
          </button>

          {/* Admin Button */}
          <button
            onClick={() => onLogin("admin")}
            className="w-full group relative overflow-hidden bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all"
          >
            <div className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-3">
              <span className="text-2xl">🎛️</span>
              <div className="text-left">
                <div className="font-bold">Control Room</div>
                <div className="text-xs text-red-200">Admin Access</div>
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
          <h2 className="text-gray-300 font-semibold">ℹ️ Quick Links</h2>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-red-400 font-bold text-lg">100</p>
              <p className="text-gray-400">Police</p>
            </div>
            <div>
              <p className="text-green-400 font-bold text-lg">102</p>
              <p className="text-gray-400">Ambulance</p>
            </div>
            <div>
              <p className="text-orange-400 font-bold text-lg">101</p>
              <p className="text-gray-400">Fire</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
