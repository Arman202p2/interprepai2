import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import posthog from "posthog-js";

// -------- POSTHOG SETUP --------
posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
  api_host: "https://app.posthog.com",
});
const ENV_TAG = process.env.NODE_ENV;
// --------------------------------

// Layout Components
import Navigation from "./components/Layout/Navigation";
import MobileNav from "./components/Layout/MobileNav";

// Page Components
import LoginPage from "./components/Pages/LoginPage";
import RegisterPage from "./components/Pages/RegisterPage";
import Dashboard from "./components/Pages/Dashboard";
import MentorsPage from "./components/Pages/MentorsPage";
import PracticePage from "./components/Pages/PracticePage";
import QuizPage from "./components/Pages/QuizPage";
import ChecklistPage from "./components/Pages/ChecklistPage";
import HistoryPage from "./components/Pages/HistoryPage";
import ChatPage from "./components/Pages/ChatPage";
import SettingsPage from "./components/Pages/SettingsPage";

// Context
const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [mentors, setMentors] = useState([]);

  const location = useLocation(); // ✅ Now works because Router wraps App

  // -------- Check for user/session & load metadata --------
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }
    loadMetadata();
    posthog.capture("app_loaded", { env: ENV_TAG });
  }, []);

  // -------- Page view tracking --------
  useEffect(() => {
    posthog.capture("page_view", {
      page: location.pathname,
      env: ENV_TAG,
      logged_in: !!currentUser,
    });
  }, [location, currentUser]);

  // -------- User identification tracking --------
  useEffect(() => {
    if (currentUser) {
      posthog.identify(currentUser.id || currentUser.email, {
        ...currentUser,
        env: ENV_TAG,
      });
    }
  }, [currentUser]);

  const loadMetadata = async () => {
    try {
      const [topicsRes, companiesRes] = await Promise.all([
        axios.get(`${API}/metadata/topics`),
        axios.get(`${API}/metadata/companies`),
      ]);
      setAvailableTopics(topicsRes.data.topics);
      setAvailableCompanies(companiesRes.data.companies);
      await loadMentors();
    } catch (error) {
      console.error("Error loading metadata:", error);
      toast.error("Failed to load app data");
    } finally {
      setLoading(false);
    }
  };

  const loadMentors = async () => {
    const mockMentors = [
      {
        id: 1,
        name: "Sarah Chen",
        title: "Senior Software Engineer",
        company: "Google",
        avatar: "👩‍💻",
        expertise: ["Python", "JavaScript", "System Design", "Algorithms"],
        experience: "8 years",
        linkedin: "https://linkedin.com/in/sarahchen",
        bio: "Former Google SWE with expertise in distributed systems and backend development.",
        questionCount: 45,
        rating: 4.9,
      },
      {
        id: 2,
        name: "Alex Rodriguez",
        title: "Principal Engineer",
        company: "Microsoft",
        avatar: "👨‍💻",
        expertise: ["C#", "Azure", "System Design", "Leadership"],
        experience: "12 years",
        linkedin: "https://linkedin.com/in/alexrodriguez",
        bio: "Principal Engineer at Microsoft Azure with deep expertise in cloud architecture.",
        questionCount: 38,
        rating: 4.8,
      },
      {
        id: 3,
        name: "Priya Sharma",
        title: "Data Scientist",
        company: "Meta",
        avatar: "👩‍🔬",
        expertise: ["Machine Learning", "Python", "Statistics", "SQL"],
        experience: "6 years",
        linkedin: "https://linkedin.com/in/priyasharma",
        bio: "Data Scientist at Meta working on recommendation systems and ML infrastructure.",
        questionCount: 32,
        rating: 4.9,
      },
      {
        id: 4,
        name: "David Kim",
        title: "Frontend Lead",
        company: "Netflix",
        avatar: "👨‍🎨",
        expertise: ["React", "TypeScript", "UI/UX", "Performance"],
        experience: "7 years",
        linkedin: "https://linkedin.com/in/davidkim",
        bio: "Frontend Lead at Netflix focusing on user experience and performance optimization.",
        questionCount: 29,
        rating: 4.7,
      },
      {
        id: 5,
        name: "Emily Watson",
        title: "Product Manager",
        company: "Amazon",
        avatar: "👩‍💼",
        expertise: [
          "Product Strategy",
          "Analytics",
          "Leadership",
          "Behavioral",
        ],
        experience: "10 years",
        linkedin: "https://linkedin.com/in/emilywatson",
        bio: "Senior PM at Amazon with experience launching products used by millions.",
        questionCount: 41,
        rating: 4.8,
      },
    ];
    setMentors(mockMentors);
  };

  const login = async (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    posthog.capture("user_login", { env: ENV_TAG, ...userData });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    posthog.capture("user_logout", { env: ENV_TAG });
  };

  const contextValue = {
    currentUser,
    setCurrentUser: login,
    logout,
    availableTopics,
    availableCompanies,
    mentors,
    API,
    BACKEND_URL,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">
            Loading Interview Prep Pro...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Routes>
          <Route
            path="/login"
            element={
              !currentUser ? <LoginPage /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/register"
            element={
              !currentUser ? <RegisterPage /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="/dashboard"
            element={currentUser ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/mentors"
            element={currentUser ? <MentorsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/practice"
            element={currentUser ? <PracticePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/quiz"
            element={currentUser ? <QuizPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/checklist"
            element={
              currentUser ? <ChecklistPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/history"
            element={currentUser ? <HistoryPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat"
            element={currentUser ? <ChatPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={
              currentUser ? <SettingsPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/"
            element={<Navigate to={currentUser ? "/dashboard" : "/login"} />}
          />
        </Routes>
        {currentUser && (
          <>
            <Navigation />
            <MobileNav />
          </>
        )}
        <Toaster position="top-right" theme="light" richColors closeButton />
      </div>
    </AppContext.Provider>
  );
}

export default App;
