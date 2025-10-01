import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Users, 
  BookOpen, 
  Brain, 
  CheckSquare, 
  History, 
  MessageCircle, 
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "../ui/button";
import { useAppContext } from "../../App";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAppContext();

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/mentors", label: "Mentors", icon: Users },
    { path: "/practice", label: "Practice", icon: BookOpen },
    { path: "/quiz", label: "Quiz", icon: Brain },
    { path: "/checklist", label: "Checklist", icon: CheckSquare },
    { path: "/history", label: "History", icon: History },
    { path: "/chat", label: "AI Chat", icon: MessageCircle },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Interview Prep Pro</h1>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{currentUser?.username}</p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add top padding to content when desktop nav is visible */}
      <div className="hidden md:block h-16"></div>
    </>
  );
};

export default Navigation;