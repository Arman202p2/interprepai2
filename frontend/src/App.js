import React, { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  
  // Login/Register state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  // Quiz state
  const [quizConfig, setQuizConfig] = useState({
    topics: [],
    num_questions: 10,
    difficulty: "",
    enable_timer: true
  });
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerEnabled, setTimerEnabled] = useState(true);
  
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [checklist, setChecklist] = useState(null);
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSessionId] = useState(() => Math.random().toString(36).substring(7));
  
  // Metadata
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [customTopic, setCustomTopic] = useState("");
  
  // Load metadata
  useEffect(() => {
    loadMetadata();
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (currentQuiz && timerEnabled && timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timerEnabled) {
      // Ask user if they want to submit or continue
      const shouldSubmit = window.confirm("Time's up! Do you want to submit the quiz now, or continue without the timer?");
      if (shouldSubmit) {
        handleSubmitQuiz();
      } else {
        setTimerEnabled(false);
      }
    }
  }, [timeRemaining, timerEnabled, currentQuiz]);
  
  const loadMetadata = async () => {
    try {
      const topicsRes = await axios.get(`${API}/metadata/topics`);
      const companiesRes = await axios.get(`${API}/metadata/companies`);
      setAvailableTopics(topicsRes.data.topics);
      setAvailableCompanies(companiesRes.data.companies);
    } catch (error) {
      console.error("Error loading metadata:", error);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/users/register`, {
        username,
        email,
        password,
        selected_topics: selectedTopics,
        custom_topics: customTopic ? [customTopic] : [],
        target_companies: selectedCompanies
      });
      alert("Registration successful! Please login.");
      setCurrentView("login");
      setUsername("");
      setPassword("");
      setEmail("");
    } catch (error) {
      alert(error.response?.data?.detail || "Registration failed");
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/users/login`, { email, password });
      setCurrentUser(res.data);
      setSelectedTopics(res.data.selected_topics || []);
      setSelectedCompanies(res.data.target_companies || []);
      setCurrentView("dashboard");
      loadAnalytics(res.data.id);
      loadChecklist(res.data.id);
    } catch (error) {
      alert(error.response?.data?.detail || "Login failed");
    }
  };
  
  const loadAnalytics = async (userId) => {
    try {
      const res = await axios.get(`${API}/analytics/${userId}`);
      setAnalytics(res.data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };
  
  const loadChecklist = async (userId) => {
    try {
      const res = await axios.get(`${API}/checklist/${userId}`);
      setChecklist(res.data);
    } catch (error) {
      console.error("Error loading checklist:", error);
    }
  };
  
  const handleStartQuiz = async () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic");
      return;
    }
    
    try {
      const res = await axios.post(`${API}/quiz/start`, {
        user_id: currentUser.id,
        topics: selectedTopics,
        num_questions: parseInt(quizConfig.num_questions),
        difficulty: quizConfig.difficulty || null,
        companies: selectedCompanies.length > 0 ? selectedCompanies : null,
        enable_timer: quizConfig.enable_timer
      });
      
      setCurrentQuiz(res.data);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizStartTime(Date.now());
      setTimerEnabled(res.data.enable_timer);
      
      // Set initial timer for first question
      if (res.data.enable_timer && res.data.questions.length > 0) {
        setTimeRemaining(res.data.questions[0].time_estimate);
      }
      
      setCurrentView("quiz");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to start quiz");
    }
  };
  
  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Reset timer for next question
      if (timerEnabled) {
        setTimeRemaining(currentQuiz.questions[nextIndex].time_estimate);
      }
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      
      // Reset timer for previous question
      if (timerEnabled) {
        setTimeRemaining(currentQuiz.questions[prevIndex].time_estimate);
      }
    }
  };
  
  const handleSubmitQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    
    try {
      const res = await axios.post(`${API}/quiz/submit`, {
        quiz_id: currentQuiz.quiz_id,
        user_answers: userAnswers,
        time_taken: timeTaken
      });
      
      // Show results
      alert(`Quiz completed! Score: ${res.data.correct_answers}/${res.data.total_questions}`);
      
      // Reload analytics and checklist
      loadAnalytics(currentUser.id);
      loadChecklist(currentUser.id);
      
      setCurrentView("dashboard");
      setCurrentQuiz(null);
    } catch (error) {
      alert("Failed to submit quiz");
    }
  };
  
  const handleEndQuiz = () => {
    const confirm = window.confirm("Are you sure you want to end this quiz? Your progress will be lost.");
    if (confirm) {
      setCurrentQuiz(null);
      setCurrentView("dashboard");
    }
  };
  
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatMessages([...chatMessages, { role: "user", text: userMessage }]);
    setChatInput("");
    
    try {
      const res = await axios.post(`${API}/ai/chat`, {
        user_id: currentUser.id,
        message: userMessage,
        session_id: chatSessionId
      });
      
      setChatMessages(prev => [...prev, { role: "assistant", text: res.data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Sorry, I encountered an error. Please try again." }]);
    }
  };
  
  const handleUpdateTopics = async () => {
    try {
      await axios.put(`${API}/users/${currentUser.id}/topics`, {
        selected_topics: selectedTopics,
        custom_topics: customTopic ? [customTopic] : []
      });
      alert("Topics updated successfully!");
    } catch (error) {
      alert("Failed to update topics");
    }
  };
  
  const handleUpdateCompanies = async () => {
    try {
      await axios.put(`${API}/users/${currentUser.id}/companies`, {
        companies: selectedCompanies
      });
      alert("Companies updated successfully!");
    } catch (error) {
      alert("Failed to update companies");
    }
  };
  
  const toggleCompanySelection = (company) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(selectedCompanies.filter(c => c !== company));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // ============= RENDER FUNCTIONS =============
  
  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Interview Prep Pro</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => setCurrentView("register")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
  
  const renderRegister = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Account</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Topics</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableTopics.map(topic => (
                <label key={topic} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTopics([...selectedTopics, topic]);
                      } else {
                        setSelectedTopics(selectedTopics.filter(t => t !== topic));
                      }
                    }}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-sm">{topic}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Topic (Optional)</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., React Native"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Companies (Optional)</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableCompanies.map(company => (
                <label key={company} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCompanies([...selectedCompanies, company]);
                      } else {
                        setSelectedCompanies(selectedCompanies.filter(c => c !== company));
                      }
                    }}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-sm">{company}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => setCurrentView("login")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
  
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Interview Prep Pro</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {currentUser?.username}</span>
            <button
              onClick={() => {
                setCurrentUser(null);
                setCurrentView("login");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quiz Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            {analytics && (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-indigo-600">{analytics.total_quizzes}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Questions Answered</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.total_questions}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Correct Answers</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.correct_answers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.accuracy}%</p>
                </div>
              </div>
            )}
            
            {/* Quiz Configuration */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Start New Quiz</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quizConfig.num_questions}
                    onChange={(e) => setQuizConfig({...quizConfig, num_questions: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={quizConfig.difficulty}
                    onChange={(e) => setQuizConfig({...quizConfig, difficulty: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Very Hard">Very Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizConfig.enable_timer}
                      onChange={(e) => setQuizConfig({...quizConfig, enable_timer: e.target.checked})}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Timer</span>
                  </label>
                </div>
                
                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Start Quiz
                </button>
              </div>
            </div>
            
            {/* Performance by Topic */}
            {analytics && analytics.topic_performance && Object.keys(analytics.topic_performance).length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Performance by Topic</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.topic_performance).map(([topic, stats]) => (
                    <div key={topic} className="border-b pb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">{topic}</span>
                        <span className="text-sm text-gray-600">{stats.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{width: `${stats.accuracy}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.correct}/{stats.attempted} correct
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Settings & Checklist */}
          <div className="space-y-6">
            {/* Topics Management */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-4">My Topics</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableTopics.map(topic => (
                  <label key={topic} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopics([...selectedTopics, topic]);
                        } else {
                          setSelectedTopics(selectedTopics.filter(t => t !== topic));
                        }
                      }}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm">{topic}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleUpdateTopics}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                Update Topics
              </button>
            </div>
            
            {/* Companies Management */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Target Companies</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableCompanies.map(company => (
                  <label key={company} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company)}
                      onChange={() => toggleCompanySelection(company)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm">{company}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleUpdateCompanies}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                Update Companies
              </button>
            </div>
            
            {/* Checklist */}
            {checklist && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Progress Checklist</h2>
                <div className="space-y-3">
                  {Object.entries(checklist.checklist).map(([topic, stats]) => (
                    <div key={topic} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{topic}</span>
                        <span className="text-xs text-gray-500">
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{width: `${stats.completion_percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* AI Chat Button */}
            <button
              onClick={() => setCurrentView("chat")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
            >
              💬 Chat with AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderQuiz = () => {
    if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
      return <div>Loading...</div>;
    }
    
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Quiz in Progress</h2>
              <div className="flex items-center space-x-4">
                {timerEnabled && timeRemaining !== null && (
                  <div className={`text-lg font-bold ${timeRemaining < 10 ? 'text-red-600' : 'text-indigo-600'}`}>
                    ⏱️ {formatTime(timeRemaining)}
                  </div>
                )}
                <button
                  onClick={handleEndQuiz}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  End Quiz
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all"
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </p>
          </div>
          
          {/* Question Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                currentQuestion.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.difficulty}
              </span>
              <span className="ml-2 text-sm text-gray-600">{currentQuestion.topic}</span>
              {currentQuestion.company && (
                <span className="ml-2 text-sm text-indigo-600 font-medium">
                  🏢 {currentQuestion.company}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.text}
            </h3>
            
            {currentQuestion.source_url && (
              <p className="text-xs text-gray-500 mb-4">
                Source: <a href={currentQuestion.source_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  {currentQuestion.source_name || currentQuestion.source_url}
                </a>
              </p>
            )}
            
            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.question_type === 'mcq' && currentQuestion.options ? (
                currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={userAnswers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))
              ) : (
                <textarea
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
                  rows="6"
                />
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          
          {/* Question Overview */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-3">Question Overview</h4>
            <div className="flex flex-wrap gap-2">
              {currentQuiz.questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    if (timerEnabled) {
                      setTimeRemaining(q.time_estimate);
                    }
                  }}
                  className={`w-10 h-10 rounded-lg font-semibold ${
                    idx === currentQuestionIndex
                      ? 'bg-indigo-600 text-white'
                      : userAnswers[q.id]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderChat = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">AI Interview Assistant</h2>
                <p className="text-purple-100 text-sm">Get help with interview preparation</p>
              </div>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg font-medium">Hi! I'm your AI interview assistant.</p>
                <p className="text-sm">Ask me anything about interview preparation!</p>
              </div>
            )}
            
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-800 shadow'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input */}
          <div className="p-6 bg-white border-t">
            <div className="flex space-x-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Main render
  return (
    <div className="App">
      {currentView === "login" && renderLogin()}
      {currentView === "register" && renderRegister()}
      {currentView === "dashboard" && renderDashboard()}
      {currentView === "quiz" && renderQuiz()}
      {currentView === "chat" && renderChat()}
    </div>
  );
}

export default App;