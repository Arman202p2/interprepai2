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
  Settings 
} from "lucide-react";

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/mentors", label: "Mentors", icon: Users },
    { path: "/practice", label: "Practice", icon: BookOpen },
    { path: "/quiz", label: "Quiz", icon: Brain },
    { path: "/checklist", label: "Progress", icon: CheckSquare },
    { path: "/history", label: "History", icon: History },
    { path: "/chat", label: "AI Chat", icon: MessageCircle },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Navigation - Bottom Tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Secondary Row for Mobile */}
        <div className="grid grid-cols-4 gap-1 p-2 pt-0">
          {navigationItems.slice(4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add bottom padding to content when mobile nav is visible */}
      <div className="md:hidden h-36"></div>
    </>
  );
};

export default MobileNav;