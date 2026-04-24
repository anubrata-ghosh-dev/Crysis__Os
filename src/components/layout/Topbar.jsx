/**
 * CRYSIS OS Topbar Component
 * Top navigation bar with title and status
 */

import { AlertCircle, Clock, MapPin, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const Topbar = ({
  title,
  activeIncidents = 0,
  showActiveIncidents = true,
  location = null,
  isDarkMode = false,
  onToggleDarkMode = () => {},
  currentRole = "citizen",
  onSwitchRole = () => {},
  onLogout = () => {}
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentTime = now.toLocaleTimeString();
  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  return (
    <div className={`${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-b px-4 sm:px-6 py-4 transition-colors`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Left: Title and Status */}
        <div className="min-w-0 flex-1">
          <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"} transition-colors`}>
            {title}
          </h2>
          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} transition-colors`}>
            {showActiveIncidents && activeIncidents > 0 && (
              <div className="flex items-center gap-1 text-red-600 font-medium">
                <AlertCircle size={16} />
                {activeIncidents} active incident{activeIncidents !== 1 ? "s" : ""}
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {location}
              </div>
            )}
          </div>
        </div>

        {/* Right: Dark Mode Toggle + Time/Date */}
        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 w-full sm:w-auto">
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={currentRole}
              onChange={(e) => onSwitchRole(e.target.value)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm border transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
              aria-label="Switch role"
            >
              <option value="citizen">Citizen</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={onLogout}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-red-900/40 text-red-300 hover:bg-red-900/60"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              Logout
            </button>
          </div>

          <div className={`${isDarkMode ? "text-gray-300" : "text-gray-700"} transition-colors text-right`}>
            <div className="flex items-center justify-end gap-2 text-xs sm:text-sm font-medium">
              <Clock size={16} />
              {currentTime}
            </div>
            <div className={`text-[11px] sm:text-xs ${isDarkMode ? "text-gray-500" : "text-gray-600"} mt-1 transition-colors`}>
              {currentDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
