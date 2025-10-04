import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  BookOpen,
  Settings,
  Users,
  Building2,
  Timer,
  Target,
  Play,
  ArrowRight,
  Zap,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { useAppContext } from "../../App";

const PracticePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, availableTopics, availableCompanies, mentors, API } =
    useAppContext();

  // Get pre-selected mentor from navigation state
  const preselectedMentor = location.state?.selectedMentor;

  const [quizConfig, setQuizConfig] = useState({
    topics: currentUser?.selected_topics || [],
    companies: currentUser?.target_companies || [],
    num_questions: 10,
    difficulty: "all",
    enable_timer: true,
    mentor_id: preselectedMentor?.id || null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedMentor) {
      setQuizConfig((prev) => ({
        ...prev,
        mentor_id: preselectedMentor.id,
        topics: preselectedMentor.expertise.filter((skill) =>
          availableTopics.includes(skill)
        ),
      }));
      toast.success(`Quiz configured for mentor: ${preselectedMentor.name}`);
    }
  }, [preselectedMentor, availableTopics]);

  const handleConfigChange = (key, value) => {
    setQuizConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleTopic = (topic) => {
    setQuizConfig((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  };

  const toggleCompany = (company) => {
    setQuizConfig((prev) => ({
      ...prev,
      companies: prev.companies.includes(company)
        ? prev.companies.filter((c) => c !== company)
        : [...prev.companies, company],
    }));
  };

  const startQuiz = async () => {
    if (quizConfig.topics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/quiz/start`, {
        user_id: currentUser.id,
        topics: quizConfig.topics,
        num_questions: parseInt(quizConfig.num_questions),
        difficulty:
          quizConfig.difficulty === "all" ? null : quizConfig.difficulty,
        companies:
          quizConfig.companies.length > 0 ? quizConfig.companies : null,
        enable_timer: quizConfig.enable_timer,
        mentor_id: quizConfig.mentor_id,
      });

      // Store quiz data and navigate to quiz page
      navigate("/quiz", {
        state: {
          quizData: response.data,
          config: quizConfig,
        },
      });
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to start quiz";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMentor = mentors.find((m) => m.id === quizConfig.mentor_id);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Practice Session
          </h1>
        </div>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Configure your personalized practice session with questions from
          expert mentors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Mentor */}
          {selectedMentor && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{selectedMentor.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedMentor.name}
                    </h3>
                    <p className="text-slate-600">
                      {selectedMentor.title} at {selectedMentor.company}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {selectedMentor.rating}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {selectedMentor.questionCount} questions
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigChange("mentor_id", null)}
                  >
                    Change Mentor
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz Configuration */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-slate-900">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Quiz Configuration
              </CardTitle>
              <CardDescription>Customize your practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="num_questions">Number of Questions</Label>
                  <Input
                    id="num_questions"
                    type="number"
                    min="1"
                    max="50"
                    value={quizConfig.num_questions}
                    onChange={(e) =>
                      handleConfigChange("num_questions", e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label id="difficulty-label">Difficulty Level</Label>
                  <Select
                    value={quizConfig.difficulty}
                    onValueChange={(value) =>
                      handleConfigChange("difficulty", value)
                    }
                  >
                    <SelectTrigger
                      className="h-12"
                      aria-labelledby="difficulty-label"
                    >
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                      <SelectItem value="Very Hard">Very Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timer Setting */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Timer className="w-5 h-5 text-slate-600" />
                  <div>
                    <Label>Enable Timer</Label>
                    <p className="text-sm text-slate-500">
                      Add time pressure to simulate real interviews
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quizConfig.enable_timer}
                  onCheckedChange={(checked) =>
                    handleConfigChange("enable_timer", checked)
                  }
                />
              </div>

              {/* Topics Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Select Topics ({quizConfig.topics.length} selected)
                </Label>
                <ScrollArea className="h-32 w-full rounded-md border border-slate-200 bg-white p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {availableTopics.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topic-${topic}`}
                          checked={quizConfig.topics.includes(topic)}
                          onCheckedChange={() => toggleTopic(topic)}
                        />
                        <Label
                          htmlFor={`topic-${topic}`}
                          className="text-sm cursor-pointer"
                        >
                          {topic}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Company Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Target Companies ({quizConfig.companies.length} selected)
                </Label>
                <ScrollArea className="h-32 w-full rounded-md border border-slate-200 bg-white p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {availableCompanies.map((company) => (
                      <div
                        key={company}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`company-${company}`}
                          checked={quizConfig.companies.includes(company)}
                          onCheckedChange={() => toggleCompany(company)}
                        />
                        <Label
                          htmlFor={`company-${company}`}
                          className="text-sm cursor-pointer"
                        >
                          {company}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          {/* Quiz Summary */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">
                Quiz Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Questions</span>
                  <Badge variant="outline">{quizConfig.num_questions}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Difficulty</span>
                  <Badge variant="outline">
                    {quizConfig.difficulty || "All Levels"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Timer</span>
                  <Badge
                    variant={quizConfig.enable_timer ? "default" : "secondary"}
                  >
                    {quizConfig.enable_timer ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Topics</span>
                  <Badge variant="outline">{quizConfig.topics.length}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Companies</span>
                  <Badge variant="outline">{quizConfig.companies.length}</Badge>
                </div>

                {selectedMentor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Mentor</span>
                    <Badge variant="default">
                      {selectedMentor.name.split(" ")[0]}
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={startQuiz}
                disabled={loading || quizConfig.topics.length === 0}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg group"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Starting Quiz...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Mentor Selection */}
          {!selectedMentor && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-slate-900">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Choose a Mentor
                </CardTitle>
                <CardDescription>
                  Get questions from industry experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentors.slice(0, 3).map((mentor) => (
                    <button
                      key={mentor.id}
                      onClick={() => handleConfigChange("mentor_id", mentor.id)}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{mentor.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {mentor.name}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {mentor.company}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => navigate("/mentors")}
                >
                  Browse All Mentors
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Tips */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-slate-900">
                <Zap className="w-5 h-5 mr-2 text-amber-600" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-700">
                <p>• Start with easier questions to build confidence</p>
                <p>• Enable timer to simulate interview pressure</p>
                <p>• Focus on your target company's question style</p>
                <p>• Review explanations after each question</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
