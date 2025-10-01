import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  CheckSquare, 
  Trophy, 
  Target, 
  TrendingUp,
  BookOpen,
  Brain,
  Users,
  Building2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useAppContext } from "../../App";

const ChecklistPage = () => {
  const { currentUser, API } = useAppContext();
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const response = await axios.get(`${API}/checklist/${currentUser.id}`);
      setChecklist(response.data);
    } catch (error) {
      console.error("Error loading checklist:", error);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 80) return <Trophy className="w-5 h-5 text-green-600" />;
    if (percentage >= 60) return <Target className="w-5 h-5 text-blue-600" />;
    if (percentage >= 40) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <BookOpen className="w-5 h-5 text-slate-600" />;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Progress Checklist</h1>
        </div>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Track your learning journey and see how you're progressing across different topics
        </p>
      </div>

      {/* Overall Stats */}
      {checklist && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{checklist.total_quizzes}</p>
              <p className="text-sm text-blue-700">Total Quizzes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{checklist.total_questions_answered}</p>
              <p className="text-sm text-green-700">Questions Answered</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">
                {Object.values(checklist.checklist).filter(item => item.completion_percentage >= 80).length}
              </p>
              <p className="text-sm text-purple-700">Mastered Topics</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-900">
                {Math.round(
                  Object.values(checklist.checklist).reduce((acc, item) => acc + item.completion_percentage, 0) / 
                  Object.keys(checklist.checklist).length
                )}%
              </p>
              <p className="text-sm text-orange-700">Average Progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Cards */}
      {checklist && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Topic Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(checklist.checklist).map(([topic, stats]) => (
              <Card key={topic} className={`border-2 shadow-lg ${getStatusColor(stats.completion_percentage)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {getStatusIcon(stats.completion_percentage)}
                      <span>{topic}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {stats.completion_percentage}%
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Completed</span>
                      <span className="font-medium">{stats.completed}/{stats.total}</span>
                    </div>
                    <Progress 
                      value={stats.completion_percentage} 
                      className="h-3" 
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    {stats.completion_percentage >= 80 && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        🏆 Mastered
                      </Badge>
                    )}
                    {stats.completion_percentage >= 60 && stats.completion_percentage < 80 && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        🎯 Proficient
                      </Badge>
                    )}
                    {stats.completion_percentage >= 40 && stats.completion_percentage < 60 && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        📈 Learning
                      </Badge>
                    )}
                    {stats.completion_percentage < 40 && (
                      <Badge className="bg-slate-100 text-slate-800 border-slate-300">
                        📚 Getting Started
                      </Badge>
                    )}
                  </div>

                  {/* Next Steps */}
                  <div className="text-xs text-slate-600 text-center">
                    {stats.completion_percentage >= 80 && "Great job! You've mastered this topic."}
                    {stats.completion_percentage >= 60 && stats.completion_percentage < 80 && "Keep practicing to reach mastery level."}
                    {stats.completion_percentage >= 40 && stats.completion_percentage < 60 && "You're making good progress. Keep it up!"}
                    {stats.completion_percentage < 40 && "Start with easier questions to build confidence."}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-slate-900">
            <Trophy className="w-6 h-6 mr-3 text-indigo-600" />
            Achievements
          </CardTitle>
          <CardDescription>Your learning milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Achievement Cards */}
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏅</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">First Quiz</p>
                <p className="text-sm text-slate-600">Completed your first practice session</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Learning Streak</p>
                <p className="text-sm text-slate-600">7 days of consistent practice</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Topic Master</p>
                <p className="text-sm text-slate-600">Achieved 80%+ in a topic</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {checklist && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Personalized Recommendations</CardTitle>
            <CardDescription>Based on your current progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(checklist.checklist)
                .filter(([_, stats]) => stats.completion_percentage < 60)
                .slice(0, 3)
                .map(([topic, stats]) => (
                  <div key={topic} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Focus on {topic}</p>
                      <p className="text-sm text-slate-600">
                        Complete {Math.max(1, Math.ceil((60 - stats.completion_percentage) * stats.total / 100))} more questions to reach proficiency
                      </p>
                    </div>
                    <Badge variant="outline">{stats.completion_percentage}%</Badge>
                  </div>
                ))}
              
              {Object.entries(checklist.checklist).every(([_, stats]) => stats.completion_percentage >= 60) && (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Excellent Progress!</h3>
                  <p className="text-slate-600">You're doing great across all topics. Keep practicing to maintain your skills!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChecklistPage;