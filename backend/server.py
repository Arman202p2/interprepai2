from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import google.generativeai as genai
import asyncio
print("File loaded")


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

@app.on_event("startup")
async def check_mongodb():
    print("Startup function running")
    try:
        await db.command("ping")
        print("MongoDB connection: Successful")
    except Exception as e:
        print("MongoDB connection: Failed")
        print(e)


# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Gemini API key
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# ============= MODELS =============

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password: str
    selected_topics: List[str] = []
    custom_topics: List[str] = []
    target_companies: List[str] = []
    notification_frequency: int = 10  # number of notifications per day
    quiz_goal: int = 1  # minimum quizzes to complete per day
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    selected_topics: List[str] = []
    custom_topics: List[str] = []
    target_companies: List[str] = []

class UserLogin(BaseModel):
    email: str
    password: str

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    question_type: str  # "mcq" or "descriptive"
    options: Optional[List[str]] = None  # for MCQ
    correct_answer: str
    explanation: Optional[str] = None
    ai_answer: Optional[str] = None
    topic: str
    difficulty: str  # "Easy", "Medium", "Hard", "Very Hard"
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    company: Optional[str] = None
    time_estimate: int = 60  # in seconds
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuestionCreate(BaseModel):
    text: str
    question_type: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None
    topic: str
    difficulty: str
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    company: Optional[str] = None

class QuizAttempt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    questions: List[str]  # question IDs
    user_answers: Dict[str, str]  # question_id -> answer
    scores: Dict[str, bool]  # question_id -> correct/incorrect
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    total_questions: int
    correct_answers: int = 0
    time_taken: int = 0  # in seconds

class QuizConfig(BaseModel):
    user_id: str
    topics: List[str]
    num_questions: int = 10
    difficulty: Optional[str] = None
    companies: Optional[List[str]] = None
    enable_timer: bool = True

class QuizSubmission(BaseModel):
    quiz_id: str
    user_answers: Dict[str, str]
    time_taken: int

class AIChat(BaseModel):
    user_id: str
    message: str
    session_id: str

class CompanySelection(BaseModel):
    companies: List[str]

# ============= HELPER FUNCTIONS =============

async def generate_ai_answer(question_text: str, correct_answer: str, explanation: str = None) -> str:
    """Generate AI answer using Gemini native API"""
    try:
        prompt = f"Question: {question_text}\n"
        if explanation:
            prompt += f"Context: {explanation}\n"
        prompt += f"Correct Answer: {correct_answer}\n\nProvide a comprehensive explanation of this answer."

        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        # Gemini responses may be synchronous; if used within async, wrap with a thread executor if needed.
        return response.text if hasattr(response, "text") else correct_answer
    except Exception as e:
        logging.error(f"AI answer generation error: {str(e)}")
        return correct_answer

async def validate_answer_with_ai(question_text: str, correct_answer: str, user_answer: str) -> bool:
    """Validate non-MCQ answer using Gemini API directly"""
    try:
        prompt = (
            f"Question: {question_text}\n"
            f"Correct Answer: {correct_answer}\n"
            f"User's Answer: {user_answer}\n\n"
            "Evaluate if the user's answer is correct. Consider semantic similarity, not just exact match.\n"
            "Respond with only 'CORRECT' or 'INCORRECT'."
        )
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        result_text = response.text if hasattr(response, "text") else ""
        return "CORRECT" in result_text.upper()
    except Exception as e:
        logging.error(f"AI validation error: {str(e)}")
        return user_answer.lower().strip() == correct_answer.lower().strip()

def calculate_time_estimate(text: str, answer: str) -> int:
    """Calculate time estimate based on text length"""
    total_length = len(text) + len(answer)
    # Base time: 1 second per 10 characters, minimum 30s, maximum 300s
    time_seconds = max(30, min(300, total_length // 10))
    return time_seconds

# ============= ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Interview Prep API"}

# User Routes
@api_router.post("/users/register")
async def register_user(user: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_obj = User(**user.dict())
    await db.users.insert_one(user_obj.dict())
    return {"id": user_obj.id, "username": user_obj.username, "email": user_obj.email}

@api_router.post("/users/login")
async def login_user(login: UserLogin):
    # Find user by email
    user = await db.users.find_one({"email": login.email})
    
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="No account found with this email"
        )
    
    # Verify password
    if user["password"] != login.password:  # TODO: Use proper password hashing
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )
    
    return User(**user)

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.put("/users/{user_id}/topics")
async def update_topics(user_id: str, topics: Dict[str, List[str]]):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "selected_topics": topics.get("selected_topics", []),
            "custom_topics": topics.get("custom_topics", [])
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Topics updated"}

@api_router.put("/users/{user_id}/companies")
async def update_companies(user_id: str, company_data: CompanySelection):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"target_companies": company_data.companies}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Companies updated"}

# Question Routes
@api_router.post("/questions")
async def create_question(question: QuestionCreate):
    # Calculate time estimate
    time_est = calculate_time_estimate(question.text, question.correct_answer)
    
    question_dict = question.dict()
    question_dict['time_estimate'] = time_est
    
    # Generate AI answer
    ai_answer = await generate_ai_answer(
        question.text, 
        question.correct_answer,
        question.explanation
    )
    question_dict['ai_answer'] = ai_answer
    
    question_obj = Question(**question_dict)
    await db.questions.insert_one(question_obj.dict())
    return question_obj

@api_router.get("/questions")
async def get_questions(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    company: Optional[str] = None
):
    query = {}
    if topic:
        query["topic"] = topic
    if difficulty:
        query["difficulty"] = difficulty
    if company:
        query["company"] = company
    
    questions = await db.questions.find(query).to_list(1000)
    return [Question(**q) for q in questions]

@api_router.get("/questions/{question_id}")
async def get_question(question_id: str):
    question = await db.questions.find_one({"id": question_id})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return Question(**question)

# Quiz Routes
@api_router.post("/quiz/start")
async def start_quiz(config: QuizConfig):
    # Get user's completed questions to avoid duplicates
    completed_quizzes = await db.quiz_attempts.find({"user_id": config.user_id}).to_list(1000)
    completed_question_ids = set()
    for quiz in completed_quizzes:
        completed_question_ids.update(quiz.get("questions", []))
    
    # Build query
    query = {"topic": {"$in": config.topics}}
    if config.difficulty:
        query["difficulty"] = config.difficulty
    if config.companies:
        query["company"] = {"$in": config.companies}
    
    # Exclude completed questions
    if completed_question_ids:
        query["id"] = {"$nin": list(completed_question_ids)}
    
    # Get available questions
    available_questions = await db.questions.find(query).to_list(1000)
    
    if len(available_questions) == 0:
        raise HTTPException(status_code=404, detail="No new questions available")
    
    # Select random questions
    import random
    selected_questions = random.sample(
        available_questions, 
        min(config.num_questions, len(available_questions))
    )
    
    # Create quiz attempt
    quiz = QuizAttempt(
        user_id=config.user_id,
        questions=[q["id"] for q in selected_questions],
        user_answers={},
        scores={},
        total_questions=len(selected_questions)
    )
    
    await db.quiz_attempts.insert_one(quiz.dict())
    
    # Return questions without answers
    questions_response = []
    for q in selected_questions:
        q_obj = Question(**q)
        q_dict = q_obj.dict()
        # Remove correct answer from response
        q_dict.pop("correct_answer", None)
        questions_response.append(q_dict)
    
    return {
        "quiz_id": quiz.id,
        "questions": questions_response,
        "enable_timer": config.enable_timer
    }

@api_router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission):
    # Get quiz
    quiz = await db.quiz_attempts.find_one({"id": submission.quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get questions
    questions = await db.questions.find({"id": {"$in": quiz["questions"]}}).to_list(1000)
    question_map = {q["id"]: Question(**q) for q in questions}
    
    # Score answers
    scores = {}
    correct_count = 0
    
    for q_id, user_answer in submission.user_answers.items():
        question = question_map.get(q_id)
        if not question:
            continue
        
        if question.question_type == "mcq":
            # Exact match for MCQ
            is_correct = user_answer.strip() == question.correct_answer.strip()
        else:
            # AI validation for descriptive
            is_correct = await validate_answer_with_ai(
                question.text,
                question.correct_answer,
                user_answer
            )
        
        scores[q_id] = is_correct
        if is_correct:
            correct_count += 1
    
    # Update quiz
    await db.quiz_attempts.update_one(
        {"id": submission.quiz_id},
        {"$set": {
            "user_answers": submission.user_answers,
            "scores": scores,
            "correct_answers": correct_count,
            "time_taken": submission.time_taken,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "quiz_id": submission.quiz_id,
        "total_questions": quiz["total_questions"],
        "correct_answers": correct_count,
        "scores": scores
    }

@api_router.get("/quiz/{quiz_id}/results")
async def get_quiz_results(quiz_id: str):
    quiz = await db.quiz_attempts.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get questions with answers
    questions = await db.questions.find({"id": {"$in": quiz["questions"]}}).to_list(1000)
    
    results = []
    for q in questions:
        q_obj = Question(**q)
        results.append({
            "question": q_obj,
            "user_answer": quiz["user_answers"].get(q_obj.id, ""),
            "is_correct": quiz["scores"].get(q_obj.id, False)
        })
    
    return {
        "quiz": QuizAttempt(**quiz),
        "results": results
    }

# Analytics Routes
@api_router.get("/analytics/{user_id}")
async def get_analytics(user_id: str):
    # Get all completed quizzes
    quizzes = await db.quiz_attempts.find({
        "user_id": user_id,
        "completed_at": {"$ne": None}
    }).to_list(1000)
    
    if not quizzes:
        return {
            "total_quizzes": 0,
            "total_questions": 0,
            "correct_answers": 0,
            "accuracy": 0,
            "topic_performance": {},
            "difficulty_performance": {},
            "recent_activity": []
        }
    
    total_quizzes = len(quizzes)
    total_questions = sum(q.get("total_questions", 0) for q in quizzes)
    correct_answers = sum(q.get("correct_answers", 0) for q in quizzes)
    accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    
    # Topic performance
    topic_stats = {}
    difficulty_stats = {}
    
    for quiz in quizzes:
        question_ids = quiz.get("questions", [])
        questions = await db.questions.find({"id": {"$in": question_ids}}).to_list(1000)
        
        for q in questions:
            topic = q.get("topic", "Unknown")
            difficulty = q.get("difficulty", "Unknown")
            q_id = q.get("id")
            is_correct = quiz.get("scores", {}).get(q_id, False)
            
            # Topic stats
            if topic not in topic_stats:
                topic_stats[topic] = {"attempted": 0, "correct": 0}
            topic_stats[topic]["attempted"] += 1
            if is_correct:
                topic_stats[topic]["correct"] += 1
            
            # Difficulty stats
            if difficulty not in difficulty_stats:
                difficulty_stats[difficulty] = {"attempted": 0, "correct": 0}
            difficulty_stats[difficulty]["attempted"] += 1
            if is_correct:
                difficulty_stats[difficulty]["correct"] += 1
    
    # Calculate accuracy for each
    for topic in topic_stats:
        attempted = topic_stats[topic]["attempted"]
        correct = topic_stats[topic]["correct"]
        topic_stats[topic]["accuracy"] = (correct / attempted * 100) if attempted > 0 else 0
    
    for diff in difficulty_stats:
        attempted = difficulty_stats[diff]["attempted"]
        correct = difficulty_stats[diff]["correct"]
        difficulty_stats[diff]["accuracy"] = (correct / attempted * 100) if attempted > 0 else 0
    
    # Recent activity
    recent = sorted(quizzes, key=lambda x: x.get("completed_at", ""), reverse=True)[:10]
    recent_activity = [
        {
            "date": q.get("completed_at"),
            "total": q.get("total_questions", 0),
            "correct": q.get("correct_answers", 0)
        }
        for q in recent
    ]
    
    return {
        "total_quizzes": total_quizzes,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "accuracy": round(accuracy, 2),
        "topic_performance": topic_stats,
        "difficulty_performance": difficulty_stats,
        "recent_activity": recent_activity
    }

# Checklist Routes
@api_router.get("/checklist/{user_id}")
async def get_checklist(user_id: str):
    # Get user's selected topics
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    all_topics = user.get("selected_topics", []) + user.get("custom_topics", [])
    
    # Get completed quizzes
    completed_quizzes = await db.quiz_attempts.find({
        "user_id": user_id,
        "completed_at": {"$ne": None}
    }).to_list(1000)
    
    completed_question_ids = set()
    for quiz in completed_quizzes:
        completed_question_ids.update(quiz.get("questions", []))
    
    # Get all questions for user's topics
    all_questions = await db.questions.find({"topic": {"$in": all_topics}}).to_list(1000)
    
    # Organize by topic
    checklist = {}
    for topic in all_topics:
        topic_questions = [q for q in all_questions if q.get("topic") == topic]
        completed = [q for q in topic_questions if q.get("id") in completed_question_ids]
        pending = [q for q in topic_questions if q.get("id") not in completed_question_ids]
        
        checklist[topic] = {
            "total": len(topic_questions),
            "completed": len(completed),
            "pending": len(pending),
            "completion_percentage": (len(completed) / len(topic_questions) * 100) if len(topic_questions) > 0 else 0
        }
    
    return {
        "checklist": checklist,
        "completed_quizzes": len(completed_quizzes),
        "total_questions_answered": len(completed_question_ids)
    }

# AI Chat Routes
@api_router.post("/ai/chat")
async def ai_chat(chat_data: AIChat):
    try:
        prompt = (
            "You are a helpful interview preparation assistant. Help users with their interview questions, provide study tips, and motivate them.\n\n"
            f"User: {chat_data.message}"
        )
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return {"response": response.text if hasattr(response, "text") else ""}
    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI chat error")

# Get available topics and companies
@api_router.get("/metadata/topics")
async def get_available_topics():
    questions = await db.questions.find().to_list(10000)
    topics = list(set(q.get("topic") for q in questions if q.get("topic")))
    return {"topics": sorted(topics)}

@api_router.get("/metadata/companies")
async def get_available_companies():
    questions = await db.questions.find().to_list(10000)
    companies = list(set(q.get("company") for q in questions if q.get("company")))
    return {"companies": sorted([c for c in companies if c])}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()