import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  History, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  Trophy,
  Medal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAppContext } from "../../App";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { mentors } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterTopic, setFilterTopic] = useState("all");

  // Mock quiz history data - in real app this would come from backend
  const [quizHistory] = useState([
    {
      id: 1,
      title: "Python & Data Structures",
      date: "2025-01-13",
      score: "8/10",
      accuracy: 80,
      timeTaken: "15:30",
      topics: ["Python", "Data Structures"],
      difficulty: "Medium",
      mentor: "Sarah Chen",
      questions: 10
    },
    {
      id: 2,
      title: "System Design Fundamentals",
      date: "2025-01-12",
      score: "6/8",
      accuracy: 75,
      timeTaken: "22:45",
      topics: ["System Design"],
      difficulty: "Hard",
      mentor: "Alex Rodriguez",
      questions: 8
    },
    {
      id: 3,
      title: "JavaScript & React",
      date: "2025-01-11",
      score: "9/12",
      accuracy: 75,
      timeTaken: "18:20",
      topics: ["JavaScript", "React"],
      difficulty: "Medium",
      mentor: "David Kim",
      questions: 12
    },
    {
      id: 4,
      title: "Machine Learning Basics",
      date: "2025-01-10",
      score: "7/10",
      accuracy: 70,
      timeTaken: "25:15",
      topics: ["Machine Learning", "Python"],
      difficulty: "Easy",
      mentor: "Priya Sharma",
      questions: 10
    },
    {
      id: 5,
      title: "Product Management Interview",
      date: "2025-01-09",
      score: "5/6",
      accuracy: 83,
      timeTaken: "12:30",
      topics: ["Product Strategy", "Behavioral"],
      difficulty: "Medium",
      mentor: "Emily Watson",
      questions: 6
    }
  ]);

  const filteredHistory = quizHistory.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.mentor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPeriod = filterPeriod === "all" || 
                         (filterPeriod === "week" && new Date(quiz.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (filterPeriod === "month" && new Date(quiz.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const matchesTopic = filterTopic === "all" || quiz.topics.includes(filterTopic);
    
    return matchesSearch && matchesPeriod && matchesTopic;
  });

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return "text-green-600 bg-green-100";
    if (accuracy >= 70) return "text-blue-600 bg-blue-100";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-orange-100 text-orange-800";
      case "Very Hard": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const allTopics = [...new Set(quizHistory.flatMap(quiz => quiz.topics))];
  const totalQuizzes = filteredHistory.length;
  const averageAccuracy = filteredHistory.length > 0 
    ? Math.round(filteredHistory.reduce((sum, quiz) => sum + quiz.accuracy, 0) / filteredHistory.length)
    : 0;
  const totalQuestions = filteredHistory.reduce((sum, quiz) => sum + quiz.questions, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Quiz History</h1>
        </div>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Review your past performance and track your improvement over time
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{totalQuizzes}</p>
            <p className="text-sm text-blue-700">Total Quizzes</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{averageAccuracy}%</p>
            <p className="text-sm text-green-700">Average Accuracy</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{totalQuestions}</p>
            <p className="text-sm text-purple-700">Questions Answered</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6 text-center">
            <Medal className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">
              {filteredHistory.filter(quiz => quiz.accuracy >= 80).length}
            </p>
            <p className="text-sm text-orange-700">High Scores (80%+)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTopic} onValueChange={setFilterTopic}>
              <SelectTrigger>
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {allTopics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterPeriod("all");
                setFilterTopic("all");
              }}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600">
          Showing <span className="font-semibold">{filteredHistory.length}</span> quiz sessions
        </p>
      </div>

      {/* Quiz History Cards */}
      <div className="space-y-4">
        {filteredHistory.map((quiz) => (
          <Card key={quiz.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Quiz Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{quiz.title}</h3>
                      <p className="text-sm text-slate-600">by {quiz.mentor}</p>
                    </div>
                    <Badge className={getAccuracyColor(quiz.accuracy)}>
                      {quiz.accuracy}%
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{formatDate(quiz.date)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{quiz.timeTaken}</span>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {quiz.score}
                    </Badge>
                    
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1">
                    {quiz.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => navigate("/practice")}
                    className="flex items-center"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No quiz history found</h3>
            <p className="text-slate-600 mb-4">
              {quizHistory.length === 0 
                ? "You haven't taken any quizzes yet. Start practicing to see your history here!"
                : "Try adjusting your search criteria or browse all quizzes."}
            </p>
            <Button onClick={() => navigate("/practice")}>
              Start Your First Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      {filteredHistory.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Performance Insights</CardTitle>
            <CardDescription>Based on your recent quiz history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Strongest Topics</h4>
                <div className="space-y-2">
                  {allTopics
                    .map(topic => {
                      const topicQuizzes = filteredHistory.filter(quiz => quiz.topics.includes(topic));
                      const avgAccuracy = topicQuizzes.reduce((sum, quiz) => sum + quiz.accuracy, 0) / topicQuizzes.length;
                      return { topic, avgAccuracy, count: topicQuizzes.length };
                    })
                    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
                    .slice(0, 3)
                    .map(({ topic, avgAccuracy, count }) => (
                      <div key={topic} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-slate-700">{topic}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{count} quizzes</Badge>
                          <Badge className={getAccuracyColor(avgAccuracy)}>
                            {Math.round(avgAccuracy)}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Areas for Improvement</h4>
                <div className="space-y-2">
                  {allTopics
                    .map(topic => {
                      const topicQuizzes = filteredHistory.filter(quiz => quiz.topics.includes(topic));
                      const avgAccuracy = topicQuizzes.reduce((sum, quiz) => sum + quiz.accuracy, 0) / topicQuizzes.length;
                      return { topic, avgAccuracy, count: topicQuizzes.length };
                    })
                    .sort((a, b) => a.avgAccuracy - b.avgAccuracy)
                    .slice(0, 3)
                    .map(({ topic, avgAccuracy, count }) => (
                      <div key={topic} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-slate-700">{topic}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{count} quizzes</Badge>
                          <Badge className={getAccuracyColor(avgAccuracy)}>
                            {Math.round(avgAccuracy)}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoryPage;