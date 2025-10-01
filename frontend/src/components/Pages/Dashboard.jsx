import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  Users, 
  BookOpen, 
  Brain,
  ArrowRight,
  BarChart3,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { useAppContext } from "../../App";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, mentors, API } = useAppContext();
  const [analytics, setAnalytics] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, checklistRes] = await Promise.all([
        axios.get(`${API}/analytics/${currentUser.id}`),
        axios.get(`${API}/checklist/${currentUser.id}`)
      ]);
      
      setAnalytics(analyticsRes.data);
      setChecklist(checklistRes.data);
      
      // Mock recent quizzes data
      setRecentQuizzes([
        {
          id: 1,
          title: "Python & Algorithms",
          date: "2025-01-13",
          score: "8/10",
          accuracy: 80,
          mentor: "Sarah Chen"
        },
        {
          id: 2,
          title: "System Design",
          date: "2025-01-12",
          score: "6/8",
          accuracy: 75,
          mentor: "Alex Rodriguez"
        }
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-8 md:p-12 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {getGreeting()}, {currentUser?.username}!
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl">
            Ready to ace your next interview? Let's continue building your expertise.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => navigate("/practice")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              Start Practice
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              onClick={() => navigate("/mentors")}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 shadow-lg"
            >
              Browse Mentors
              <Users className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Quizzes</p>
                <p className="text-3xl font-bold text-green-900">
                  {analytics?.total_quizzes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Questions Answered</p>
                <p className="text-3xl font-bold text-blue-900">
                  {analytics?.total_questions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Accuracy Rate</p>
                <p className="text-3xl font-bold text-purple-900">
                  {analytics?.accuracy || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Study Streak</p>
                <p className="text-3xl font-bold text-orange-900">7 days</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-slate-900">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest quiz sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {recentQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-900">{quiz.title}</h4>
                        <p className="text-sm text-slate-600">
                          by {quiz.mentor} • {quiz.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {quiz.score}
                        </Badge>
                        <div className="flex items-center">
                          <div className="w-12 h-2 bg-slate-200 rounded-full mr-2">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${quiz.accuracy}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{quiz.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No recent activity. Start a quiz to see your progress!</p>
                  <Button 
                    onClick={() => navigate("/practice")}
                    className="mt-4"
                    variant="outline"
                  >
                    Start First Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance by Topic */}
          {analytics?.topic_performance && Object.keys(analytics.topic_performance).length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-slate-900">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Performance by Topic
                </CardTitle>
                <CardDescription>Track your progress across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.topic_performance).map(([topic, stats]) => (
                    <div key={topic} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">{topic}</span>
                        <Badge variant="outline">
                          {stats.correct}/{stats.attempted}
                        </Badge>
                      </div>
                      <Progress value={stats.accuracy} className="h-3" />
                      <p className="text-sm text-slate-500">
                        {stats.accuracy.toFixed(1)}% accuracy
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Featured Mentors */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-slate-900">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Featured Mentors
              </CardTitle>
              <CardDescription>Expert guidance from industry professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mentors.slice(0, 3).map((mentor) => (
                  <div key={mentor.id} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <div className="text-2xl">{mentor.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{mentor.name}</p>
                      <p className="text-sm text-slate-500 truncate">{mentor.title}</p>
                      <p className="text-xs text-slate-400">{mentor.questionCount} questions</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => navigate("/mentors")}
                variant="outline" 
                className="w-full mt-4"
              >
                View All Mentors
              </Button>
            </CardContent>
          </Card>

          {/* Progress Checklist Preview */}
          {checklist && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-slate-900">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Progress Overview
                </CardTitle>
                <CardDescription>Your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(checklist.checklist).slice(0, 3).map(([topic, stats]) => (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{topic}</span>
                        <span className="text-slate-500">
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                      <Progress value={stats.completion_percentage} className="h-2" />
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => navigate("/checklist")}
                  variant="outline" 
                  className="w-full mt-4"
                >
                  View Full Progress
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;