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
      question_id,
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
        question_id,
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
        {/* ... (your existing UI/layout/data code remains unchanged) ... */}
      </div>
    </div>
  );
};

export default QuizPage;
