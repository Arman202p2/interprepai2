#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Interview Prep Application
Tests all endpoints with realistic data and proper error handling
"""

import requests
import json
import uuid
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://quiz-mastery-1.preview.emergentagent.com/api"
TEST_USER_EMAIL = "demo@test.com"
TEST_USER_USERNAME = "demouser"
TEST_USER_PASSWORD = "demo123"

class InterviewPrepAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_user_id = None
        self.test_quiz_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
        print()
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == "GET":
                response = self.session.get(url, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data)
            else:
                return False, f"Unsupported method: {method}", 0
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return response.status_code < 400, response_data, response.status_code
        
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}", 0
    
    def test_health_check(self):
        """Test 1: Health Check - GET /api/"""
        print("🔍 Testing Health Check...")
        success, data, status_code = self.make_request("GET", "/")
        
        if success and isinstance(data, dict) and "message" in data:
            self.log_result("Health Check", True, f"API is running: {data['message']}")
        else:
            self.log_result("Health Check", False, f"Unexpected response (Status: {status_code})", data)
    
    def test_user_registration(self):
        """Test 2: User Registration"""
        print("🔍 Testing User Registration...")
        
        user_data = {
            "username": TEST_USER_USERNAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "selected_topics": ["Python", "JavaScript", "System Design"],
            "target_companies": ["Google", "Microsoft", "Amazon"]
        }
        
        success, data, status_code = self.make_request("POST", "/users/register", user_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.test_user_id = data["id"]
            self.log_result("User Registration", True, f"User created with ID: {self.test_user_id}")
        else:
            # Check if user already exists
            if status_code == 400 and "already registered" in str(data):
                self.log_result("User Registration", True, "User already exists (expected for repeated tests)")
                # Try to login to get user ID
                self.test_user_login()
            else:
                self.log_result("User Registration", False, f"Registration failed (Status: {status_code})", data)
    
    def test_user_login(self):
        """Test 3: User Login"""
        print("🔍 Testing User Login...")
        
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        success, data, status_code = self.make_request("POST", "/users/login", login_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.test_user_id = data["id"]
            expected_fields = ["username", "email", "selected_topics", "target_companies"]
            has_all_fields = all(field in data for field in expected_fields)
            
            if has_all_fields:
                self.log_result("User Login", True, f"Login successful, user data complete")
            else:
                self.log_result("User Login", True, f"Login successful but missing some fields")
        else:
            self.log_result("User Login", False, f"Login failed (Status: {status_code})", data)
    
    def test_questions_api(self):
        """Test 4: Questions API with various filters"""
        print("🔍 Testing Questions API...")
        
        # Test 4a: Get all questions
        success, data, status_code = self.make_request("GET", "/questions")
        if success and isinstance(data, list):
            self.log_result("Get All Questions", True, f"Retrieved {len(data)} questions")
        else:
            self.log_result("Get All Questions", False, f"Failed to get questions (Status: {status_code})", data)
        
        # Test 4b: Filter by topic
        success, data, status_code = self.make_request("GET", "/questions", params={"topic": "Python"})
        if success and isinstance(data, list):
            python_questions = [q for q in data if q.get("topic") == "Python"]
            if len(python_questions) == len(data):
                self.log_result("Filter by Topic (Python)", True, f"Retrieved {len(data)} Python questions")
            else:
                self.log_result("Filter by Topic (Python)", False, "Some questions don't match Python topic")
        else:
            self.log_result("Filter by Topic (Python)", False, f"Failed to filter by topic (Status: {status_code})", data)
        
        # Test 4c: Filter by difficulty
        success, data, status_code = self.make_request("GET", "/questions", params={"difficulty": "Easy"})
        if success and isinstance(data, list):
            self.log_result("Filter by Difficulty (Easy)", True, f"Retrieved {len(data)} Easy questions")
        else:
            self.log_result("Filter by Difficulty (Easy)", False, f"Failed to filter by difficulty (Status: {status_code})", data)
        
        # Test 4d: Filter by company
        success, data, status_code = self.make_request("GET", "/questions", params={"company": "Google"})
        if success and isinstance(data, list):
            self.log_result("Filter by Company (Google)", True, f"Retrieved {len(data)} Google questions")
        else:
            self.log_result("Filter by Company (Google)", False, f"Failed to filter by company (Status: {status_code})", data)
    
    def test_quiz_flow(self):
        """Test 5: Complete Quiz Flow"""
        if not self.test_user_id:
            self.log_result("Quiz Flow", False, "Cannot test quiz flow - no user ID available")
            return
        
        print("🔍 Testing Quiz Flow...")
        
        # Test 5a: Start Quiz
        quiz_config = {
            "user_id": self.test_user_id,
            "topics": ["Python", "JavaScript"],
            "num_questions": 5,
            "enable_timer": True
        }
        
        success, data, status_code = self.make_request("POST", "/quiz/start", quiz_config)
        
        if success and isinstance(data, dict) and "quiz_id" in data and "questions" in data:
            self.test_quiz_id = data["quiz_id"]
            questions = data["questions"]
            self.log_result("Start Quiz", True, f"Quiz started with {len(questions)} questions")
            
            # Test 5b: Submit Quiz
            if len(questions) > 0:
                # Create sample answers
                user_answers = {}
                for i, question in enumerate(questions[:3]):  # Answer first 3 questions
                    q_id = question["id"]
                    if question.get("question_type") == "mcq" and question.get("options"):
                        # Pick first option for MCQ
                        user_answers[q_id] = question["options"][0]
                    else:
                        # Provide a descriptive answer
                        user_answers[q_id] = "This is a sample answer for testing purposes."
                
                quiz_submission = {
                    "quiz_id": self.test_quiz_id,
                    "user_answers": user_answers,
                    "time_taken": 300  # 5 minutes
                }
                
                success, data, status_code = self.make_request("POST", "/quiz/submit", quiz_submission)
                
                if success and isinstance(data, dict) and "scores" in data:
                    correct_answers = data.get("correct_answers", 0)
                    total_questions = data.get("total_questions", 0)
                    self.log_result("Submit Quiz", True, f"Quiz submitted: {correct_answers}/{total_questions} correct")
                    
                    # Test 5c: Get Quiz Results
                    success, data, status_code = self.make_request("GET", f"/quiz/{self.test_quiz_id}/results")
                    
                    if success and isinstance(data, dict) and "quiz" in data and "results" in data:
                        results = data["results"]
                        self.log_result("Get Quiz Results", True, f"Retrieved results for {len(results)} questions")
                    else:
                        self.log_result("Get Quiz Results", False, f"Failed to get quiz results (Status: {status_code})", data)
                else:
                    self.log_result("Submit Quiz", False, f"Failed to submit quiz (Status: {status_code})", data)
            else:
                self.log_result("Submit Quiz", False, "No questions available to submit")
        else:
            self.log_result("Start Quiz", False, f"Failed to start quiz (Status: {status_code})", data)
    
    def test_analytics(self):
        """Test 6: Analytics"""
        if not self.test_user_id:
            self.log_result("Analytics", False, "Cannot test analytics - no user ID available")
            return
        
        print("🔍 Testing Analytics...")
        
        success, data, status_code = self.make_request("GET", f"/analytics/{self.test_user_id}")
        
        if success and isinstance(data, dict):
            expected_fields = ["total_quizzes", "total_questions", "correct_answers", "accuracy", 
                             "topic_performance", "difficulty_performance", "recent_activity"]
            has_all_fields = all(field in data for field in expected_fields)
            
            if has_all_fields:
                self.log_result("Analytics", True, f"Analytics retrieved: {data['total_quizzes']} quizzes, {data['accuracy']}% accuracy")
            else:
                missing_fields = [field for field in expected_fields if field not in data]
                self.log_result("Analytics", False, f"Missing fields: {missing_fields}")
        else:
            self.log_result("Analytics", False, f"Failed to get analytics (Status: {status_code})", data)
    
    def test_checklist(self):
        """Test 7: Checklist"""
        if not self.test_user_id:
            self.log_result("Checklist", False, "Cannot test checklist - no user ID available")
            return
        
        print("🔍 Testing Checklist...")
        
        success, data, status_code = self.make_request("GET", f"/checklist/{self.test_user_id}")
        
        if success and isinstance(data, dict):
            expected_fields = ["checklist", "completed_quizzes", "total_questions_answered"]
            has_all_fields = all(field in data for field in expected_fields)
            
            if has_all_fields:
                checklist = data["checklist"]
                total_topics = len(checklist)
                self.log_result("Checklist", True, f"Checklist retrieved for {total_topics} topics")
            else:
                missing_fields = [field for field in expected_fields if field not in data]
                self.log_result("Checklist", False, f"Missing fields: {missing_fields}")
        else:
            self.log_result("Checklist", False, f"Failed to get checklist (Status: {status_code})", data)
    
    def test_ai_chat(self):
        """Test 8: AI Chat"""
        if not self.test_user_id:
            self.log_result("AI Chat", False, "Cannot test AI chat - no user ID available")
            return
        
        print("🔍 Testing AI Chat...")
        
        chat_data = {
            "user_id": self.test_user_id,
            "message": "What are some good tips for preparing for a Python interview?",
            "session_id": str(uuid.uuid4())
        }
        
        success, data, status_code = self.make_request("POST", "/ai/chat", chat_data)
        
        if success and isinstance(data, dict) and "response" in data:
            response_text = data["response"]
            if len(response_text) > 10:  # Reasonable response length
                self.log_result("AI Chat", True, f"AI responded with {len(response_text)} characters")
            else:
                self.log_result("AI Chat", False, "AI response too short or empty")
        else:
            self.log_result("AI Chat", False, f"Failed to get AI response (Status: {status_code})", data)
    
    def test_metadata(self):
        """Test 9: Metadata endpoints"""
        print("🔍 Testing Metadata...")
        
        # Test 9a: Get Topics
        success, data, status_code = self.make_request("GET", "/metadata/topics")
        
        if success and isinstance(data, dict) and "topics" in data:
            topics = data["topics"]
            if isinstance(topics, list) and len(topics) > 0:
                self.log_result("Get Topics", True, f"Retrieved {len(topics)} topics")
            else:
                self.log_result("Get Topics", False, "No topics found or invalid format")
        else:
            self.log_result("Get Topics", False, f"Failed to get topics (Status: {status_code})", data)
        
        # Test 9b: Get Companies
        success, data, status_code = self.make_request("GET", "/metadata/companies")
        
        if success and isinstance(data, dict) and "companies" in data:
            companies = data["companies"]
            if isinstance(companies, list):
                self.log_result("Get Companies", True, f"Retrieved {len(companies)} companies")
            else:
                self.log_result("Get Companies", False, "Invalid companies format")
        else:
            self.log_result("Get Companies", False, f"Failed to get companies (Status: {status_code})", data)
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Interview Prep API Backend Tests")
        print("=" * 60)
        
        # Run tests in logical order
        self.test_health_check()
        self.test_user_registration()
        if not self.test_user_id:
            self.test_user_login()
        
        self.test_questions_api()
        self.test_quiz_flow()
        self.test_analytics()
        self.test_checklist()
        self.test_ai_chat()
        self.test_metadata()
        
        # Print summary
        print("=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results

if __name__ == "__main__":
    tester = InterviewPrepAPITester()
    results = tester.run_all_tests()