/**
 * CRYSIS OS Sidebar Navigation Component
 * Left sidebar with navigation links
 */

import { Menu, X, AlertCircle, Users, Map, Settings, LogOut } from "lucide-react";
import { useState } from "react";

export const Sidebar = ({ isAdmin = false, onLogout, onNavClick = () => {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems = isAdmin
    ? [
        { id: "dashboard", label: "Dashboard", icon: AlertCircle },
        { id: "incidents", label: "Incidents", icon: Map },
        { id: "teams", label: "Teams", icon: Users },
        { id: "settings", label: "Settings", icon: Settings }
      ]
    : [
        { id: "report", label: "Report Emergency", icon: AlertCircle },
        { id: "map", label: "Map", icon: Map },
        { id: "my-reports", label: "My Reports", icon: AlertCircle }
      ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    onNavClick(id);
  };

  return (
    <div className={`bg-gray-900 text-white h-screen flex flex-col transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {isOpen && (
          <h1 className="text-xl font-bold text-blue-400">CRYSIS OS</h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full text-left ${
              activeTab === item.id
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full text-red-400"
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
