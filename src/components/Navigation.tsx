import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import OfflineIndicator from "./OfflineIndicator";
import {
  LayoutDashboard,
  Plus,
  Minus,
  FileText,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "income", label: "Pemasukan", icon: Plus },
    { id: "expense", label: "Pengeluaran", icon: Minus },
    { id: "programs", label: "Program", icon: FileText },
    { id: "reports", label: "Laporan", icon: FileText },
  ];

  return (
    <>
      {/* Desktop & Tablet Navigation */}
      <nav className="hidden md:block bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">KKN15</h1>
            <div className="flex items-center space-x-2">
              <OfflineIndicator />
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <span className="px-2 py-1 bg-blue-900 rounded-full text-xs">
                  {user?.role === "treasurer" ? "Bendahara" : "Anggota"}
                </span>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === item.id
                      ? "bg-white text-blue-700"
                      : "text-white hover:bg-blue-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">KKN15</h1>

          <div className="flex items-center space-x-2">
            <OfflineIndicator />
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile User Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-blue-700 border-t border-blue-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
                <span className="px-2 py-1 bg-blue-900 rounded-full text-xs">
                  {user?.role === "treasurer" ? "Bendahara" : "Anggota"}
                </span>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-xs">Keluar</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center px-1 py-2 text-xs transition-all duration-200 relative ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-b-full"></div>
                )}

                <Icon
                  className={`h-5 w-5 mb-1 transition-colors ${
                    isActive ? "text-blue-600" : "text-gray-600"
                  }`}
                />

                <span
                  className={`font-medium truncate w-full text-center leading-tight ${
                    isActive ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
