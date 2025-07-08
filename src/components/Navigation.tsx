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
    { id: "programs", label: "Program Kerja", icon: FileText },
    { id: "reports", label: "Laporan", icon: FileText },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg relative">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">KKN15</h1>
        
        {/* Desktop User Info */}
        <div className="hidden md:flex items-center space-x-2">
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

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <OfflineIndicator />
          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex px-4 pb-4 space-x-2 overflow-x-auto">
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

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-500">
          {/* User Info on Mobile */}
          <div className="flex items-center justify-between p-4 border-b border-blue-500">
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
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className={`w-full justify-start px-4 py-3 text-left ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white border-l-4 border-white"
                      : "text-white hover:bg-blue-600"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="text-base">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
