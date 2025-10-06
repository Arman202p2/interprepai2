import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useAppContext } from "../../App";
import posthog from "posthog-js";

const ENV_TAG = process.env.NODE_ENV;

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { API, currentUser, mentors } = useAppContext();

  const quizData = location.state?.quizData;
  const config = location.state?.config;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [timerActive, setTimerActive] = useState(config?.enable_timer || false);
  const [quizStartTime] = useState(Date.now());

  // Track quiz start (once per quiz)
  useEffect(() => {
    if (quizData && quizData.quiz_id) {
      posthog.capture("quiz_started", {
        env: ENV_TAG,
        quiz_id: quizData.quiz_id,
        total_questions: quizData.questions?.length,
        user_id: currentUser?.id || currentUser?.email,
        mentor_id: config?.mentor_id,
        timestamp: Date.now(),
      });
    }
  }, [quizData, config, currentUser]);

  // Redirect if no quiz data
  useEffect(() => {
    if (!quizData || !quizData.questions) {
      toast.error("No quiz data found. Please start a new quiz.");
      navigate("/practice");
      return;
    }
    if (config?.enable_timer && quizData.questions.length > 0) {
      setTimeRemaining(quizData.questions[0].time_estimate || 60);
    }
  }, [quizData, config, navigate]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeRemaining !== null && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        setTotalTime((prev) => prev + 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, timerActive]);

  const handleTimeUp = () => {
    toast.error("Time's up for this question!");
    setTimerActive(false);
    // Track event for time expiry
    posthog.capture("quiz_time_expired", {
      env: ENV_TAG,
      quiz_id: quizData.quiz_id,
      question_id: currentQuestion.id,
      user_id: currentUser?.id || currentUser?.email,
      mentor_id: config?.mentor_id,
      question_index: currentQuestionIndex,
      timestamp: Date.now(),
    });
  };

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / (quizData?.questions?.length || 1)) * 100;
  const mentor = mentors.find((m) => m.id === config?.mentor_id);

  // Track question attempt (for MCQs, includes correctness if possible)
  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    let isCorrect = null;
    if (
      currentQuestion.question_type === "mcq" &&
      currentQuestion.correct_answer !== undefined
    ) {
      isCorrect = answer === currentQuestion.correct_answer;
    }
    posthog.capture("quiz_question_answered", {
      env: ENV_TAG,
      quiz_id: quizData.quiz_id,
      question_id: currentQuestion.id,
      user_id: currentUser?.id || currentUser?.email,
      mentor_id: config?.mentor_id,
      answer,
      question_index: currentQuestionIndex,
      is_correct: isCorrect,
      time_spent: totalTime,
      flagged: flaggedQuestions.has(questionId),
      timestamp: Date.now(),
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      if (timerActive) {
        setTimeRemaining(quizData.questions[nextIndex].time_estimate || 60);
      }
      // Track navigation
      posthog.capture("quiz_next_question", {
        env: ENV_TAG,
        quiz_id: quizData.quiz_id,
        user_id: currentUser?.id || currentUser?.email,
        mentor_id: config?.mentor_id,
        prev_question_index: currentQuestionIndex,
        next_question_index: nextIndex,
        timestamp: Date.now(),
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      if (timerActive) {
        setTimeRemaining(quizData.questions[prevIndex].time_estimate || 60);
      }
      // Track navigation
      posthog.capture("quiz_previous_question", {
        env: ENV_TAG,
        quiz_id: quizData.quiz_id,
        user_id: currentUser?.id || currentUser?.email,
        mentor_id: config?.mentor_id,
        prev_question_index: currentQuestionIndex,
        next_question_index: prevIndex,
        timestamp: Date.now(),
      });
    }
  };

  const handleFlag = () => {
    const questionId = currentQuestion.id;
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      let action = "";
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
        toast.info("Question unflagged");
        action = "unflagged";
      } else {
        newSet.add(questionId);
        toast.info("Question flagged for review");
        action = "flagged";
      }
      // Track flag/unflag event
      posthog.capture("quiz_question_flag", {
        env: ENV_TAG,
        quiz_id: quizData.quiz_id,
        user_id: currentUser?.id || currentUser?.email,
        mentor_id: config?.mentor_id,
        question_id: currentQuestion.id,
        question_index: currentQuestionIndex,
        action,
        timestamp: Date.now(),
      });
      return newSet;
    });
  };

  const handleSkip = () => {
    toast.info("Question skipped");
    posthog.capture("quiz_question_skipped", {
      env: ENV_TAG,
      quiz_id: quizData.quiz_id,
      user_id: currentUser?.id || currentUser?.email,
      mentor_id: config?.mentor_id,
      question_id: currentQuestion.id,
      question_index: currentQuestionIndex,
      timestamp: Date.now(),
    });
    handleNext();
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    if (timerActive) {
      setTimeRemaining(quizData.questions[index].time_estimate || 60);
    }
    posthog.capture("quiz_question_jump", {
      env: ENV_TAG,
      quiz_id: quizData.quiz_id,
      user_id: currentUser?.id || currentUser?.email,
      mentor_id: config?.mentor_id,
      from_index: currentQuestionIndex,
      to_index: index,
      timestamp: Date.now(),
    });
  };

  // Track quiz submission
  const handleSubmitQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);

    try {
      const response = await axios.post(`${API}/quiz/submit`, {
        quiz_id: quizData.quiz_id,
        user_answers: userAnswers,
        time_taken: timeTaken,
      });
      toast.success("Quiz submitted successfully!");
      posthog.capture("quiz_submitted", {
        env: ENV_TAG,
        quiz_id: quizData.quiz_id,
        user_id: currentUser?.id || currentUser?.email,
        mentor_id: config?.mentor_id,
        questions_answered: Object.keys(userAnswers).length,
        total_questions: quizData.questions.length,
        time_taken: timeTaken,
        flagged_questions: Array.from(flaggedQuestions),
        timestamp: Date.now(),
      });
      navigate("/dashboard", {
        state: {
          quizResults: response.data,
          showResults: true,
        },
      });
    } catch (error) {
      toast.error("Failed to submit quiz. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionStatus = (index) => {
    const question = quizData.questions[index];
    const hasAnswer = userAnswers[question.id] !== undefined;
    const isFlagged = flaggedQuestions.has(question.id);
    const isCurrent = index === currentQuestionIndex;
    if (isCurrent) return "current";
    if (isFlagged) return "flagged";
    if (hasAnswer) return "answered";
    return "unanswered";
  };

  if (!quizData || !currentQuestion) {
    return (
      <div className="p-8 text-center">
        <p>Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* updated */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Quiz in Progress
                </h1>
                {mentor && (
                  <p className="text-slate-600">
                    Questions curated by{" "}
                    <span className="font-semibold">{mentor.name}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {timerActive && (
                  <div className="flex items-center space-x-2">
                    <Clock
                      className={`w-5 h-5 ${
                        timeRemaining < 30 ? "text-red-500" : "text-blue-600"
                      }`}
                    />
                    <span
                      className={`text-lg font-bold ${
                        timeRemaining < 30 ? "text-red-500" : "text-blue-600"
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimerActive(false)}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      End Quiz
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>End Quiz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to end this quiz? Your progress
                        will be saved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmitQuiz}>
                        End Quiz
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">
                  Question {currentQuestionIndex + 1} of{" "}
                  {quizData.questions.length}
                </span>
                <span className="text-sm text-slate-600">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        currentQuestion.difficulty === "Easy"
                          ? "default"
                          : currentQuestion.difficulty === "Medium"
                          ? "secondary"
                          : currentQuestion.difficulty === "Hard"
                          ? "destructive"
                          : "destructive"
                      }
                    >
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentQuestion.topic}</Badge>
                    {currentQuestion.company && (
                      <Badge variant="outline">{currentQuestion.company}</Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFlag}
                      className={
                        flaggedQuestions.has(currentQuestion.id)
                          ? "bg-yellow-100"
                          : ""
                      }
                    >
                      <Flag
                        className={`w-4 h-4 ${
                          flaggedQuestions.has(currentQuestion.id)
                            ? "text-yellow-600"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Question Text */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {currentQuestion.text}
                  </h3>

                  {currentQuestion.source_url && (
                    <p className="text-sm text-slate-500 mb-4">
                      Source:{" "}
                      <a
                        href={currentQuestion.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {currentQuestion.source_name || "View Source"}
                      </a>
                    </p>
                  )}
                </div>

                {/* Answer Interface */}
                <div>
                  {currentQuestion.question_type === "mcq" &&
                  currentQuestion.options ? (
                    <RadioGroup
                      value={userAnswers[currentQuestion.id] || ""}
                      onValueChange={(value) =>
                        handleAnswerChange(currentQuestion.id, value)
                      }
                    >
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}`}
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div>
                      <Label
                        htmlFor="free-text"
                        className="text-sm font-medium text-slate-700 mb-2 block"
                      >
                        Your Answer:
                      </Label>
                      <Textarea
                        id="free-text"
                        value={userAnswers[currentQuestion.id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.id, e.target.value)
                        }
                        placeholder="Type your answer here..."
                        className="min-h-[120px]"
                      />
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleSkip}>
                      <SkipForward className="w-4 h-4 mr-1" />
                      Skip
                    </Button>

                    {currentQuestionIndex === quizData.questions.length - 1 ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-green-600 hover:bg-green-700">
                            Submit Quiz
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You have answered{" "}
                              {Object.keys(userAnswers).length} out of{" "}
                              {quizData.questions.length} questions. Are you
                              ready to submit?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Review Answers
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmitQuiz}>
                              Submit Quiz
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Overview */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Question Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {quizData.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => jumpToQuestion(index)}
                        className={`
                          w-10 h-10 rounded-lg font-semibold text-sm transition-all
                          ${
                            status === "current"
                              ? "bg-blue-600 text-white shadow-lg"
                              : status === "answered"
                              ? "bg-green-100 text-green-800 border-2 border-green-200"
                              : status === "flagged"
                              ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-slate-100 rounded"></div>
                    <span>Not answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
