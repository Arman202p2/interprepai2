import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

# Sample questions across various topics
sample_questions = [
    # Python
    {
        "id": "q1",
        "text": "What is the difference between list and tuple in Python?",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "Lists are mutable (can be changed) while tuples are immutable (cannot be changed after creation). Lists use square brackets [] while tuples use parentheses ().",
        "explanation": "This is a fundamental Python concept about data structures.",
        "ai_answer": "Lists are mutable, meaning their elements can be modified after creation, while tuples are immutable and cannot be changed. Lists are defined with square brackets [], tuples with parentheses (). Lists are generally used for homogeneous collections that may change, while tuples are used for heterogeneous data that should remain constant.",
        "topic": "Python",
        "difficulty": "Easy",
        "source_url": "https://www.prepinsta.com/python/",
        "source_name": "PrepInsta",
        "company": "Google",
        "time_estimate": 90
    },
    {
        "id": "q2",
        "text": "Which of the following is used to define a function in Python?",
        "question_type": "mcq",
        "options": ["function", "def", "define", "func"],
        "correct_answer": "def",
        "explanation": "The 'def' keyword is used to define functions in Python.",
        "ai_answer": "The 'def' keyword is used to define functions in Python. Example: def my_function(): pass",
        "topic": "Python",
        "difficulty": "Easy",
        "source_url": "https://www.indiabix.com/python/",
        "source_name": "IndiaBix",
        "company": "Microsoft",
        "time_estimate": 45
    },
    # JavaScript
    {
        "id": "q3",
        "text": "What is a closure in JavaScript?",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.",
        "explanation": "Closures are a fundamental concept in JavaScript for maintaining state.",
        "ai_answer": "A closure in JavaScript is a function that retains access to its outer scope's variables even after the outer function has finished executing. This allows functions to have 'private' variables and maintain state between calls.",
        "topic": "JavaScript",
        "difficulty": "Medium",
        "source_url": "https://www.prepinsta.com/javascript/",
        "source_name": "PrepInsta",
        "company": "Amazon",
        "time_estimate": 120
    },
    {
        "id": "q4",
        "text": "Which method is used to add an element at the end of an array in JavaScript?",
        "question_type": "mcq",
        "options": ["push()", "pop()", "shift()", "unshift()"],
        "correct_answer": "push()",
        "explanation": "push() adds elements to the end of an array.",
        "ai_answer": "The push() method adds one or more elements to the end of an array and returns the new length of the array.",
        "topic": "JavaScript",
        "difficulty": "Easy",
        "source_url": "https://www.indiabix.com/javascript/",
        "source_name": "IndiaBix",
        "company": "Facebook",
        "time_estimate": 40
    },
    # Data Structures
    {
        "id": "q5",
        "text": "What is the time complexity of searching in a balanced Binary Search Tree?",
        "question_type": "mcq",
        "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        "correct_answer": "O(log n)",
        "explanation": "Balanced BST provides O(log n) search time.",
        "ai_answer": "In a balanced Binary Search Tree, search operations have O(log n) time complexity because the tree height is logarithmic with respect to the number of nodes.",
        "topic": "Data Structures",
        "difficulty": "Medium",
        "source_url": "https://www.tcyonline.com/",
        "source_name": "TCYOnline",
        "company": "Apple",
        "time_estimate": 60
    },
    {
        "id": "q6",
        "text": "Explain the difference between Stack and Queue data structures.",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "Stack follows LIFO (Last In First Out) principle where elements are added and removed from the same end. Queue follows FIFO (First In First Out) principle where elements are added at the rear and removed from the front.",
        "explanation": "Understanding the fundamental difference between these two linear data structures.",
        "ai_answer": "Stack is a LIFO (Last In First Out) data structure where insertion and deletion happen at the same end (top). Common operations are push and pop. Queue is a FIFO (First In First Out) data structure where insertion happens at the rear and deletion at the front. Common operations are enqueue and dequeue.",
        "topic": "Data Structures",
        "difficulty": "Easy",
        "source_url": "https://www.prepinsta.com/data-structures/",
        "source_name": "PrepInsta",
        "company": "Amazon",
        "time_estimate": 90
    },
    # Algorithms
    {
        "id": "q7",
        "text": "What is the best case time complexity of Quick Sort?",
        "question_type": "mcq",
        "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        "correct_answer": "O(n log n)",
        "explanation": "Quick Sort has O(n log n) in best and average cases.",
        "ai_answer": "The best case time complexity of Quick Sort is O(n log n), which occurs when the pivot divides the array into two equal halves at each step.",
        "topic": "Algorithms",
        "difficulty": "Medium",
        "source_url": "https://www.tcyonline.com/",
        "source_name": "TCYOnline",
        "company": "Google",
        "time_estimate": 60
    },
    {
        "id": "q8",
        "text": "Explain the concept of Dynamic Programming with an example.",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "Dynamic Programming is an optimization technique that solves complex problems by breaking them down into simpler subproblems and storing the results to avoid redundant calculations. Example: Fibonacci series, where we store previously calculated values.",
        "explanation": "Dynamic Programming is crucial for optimization problems.",
        "ai_answer": "Dynamic Programming is an algorithmic technique that solves problems by breaking them into overlapping subproblems and storing their solutions (memoization). Classic example: Calculating Fibonacci numbers. Instead of recalculating fib(n-1) and fib(n-2) repeatedly, we store these values and reuse them, reducing time complexity from exponential to linear.",
        "topic": "Algorithms",
        "difficulty": "Hard",
        "source_url": "https://www.prepinsta.com/algorithms/",
        "source_name": "PrepInsta",
        "company": "Microsoft",
        "time_estimate": 180
    },
    # Database
    {
        "id": "q9",
        "text": "What does SQL stand for?",
        "question_type": "mcq",
        "options": ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
        "correct_answer": "Structured Query Language",
        "explanation": "SQL stands for Structured Query Language.",
        "ai_answer": "SQL stands for Structured Query Language. It is a standard language for managing and manipulating relational databases.",
        "topic": "Database",
        "difficulty": "Easy",
        "source_url": "https://www.indiabix.com/sql/",
        "source_name": "IndiaBix",
        "company": "Oracle",
        "time_estimate": 30
    },
    {
        "id": "q10",
        "text": "Explain ACID properties in databases.",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "ACID stands for Atomicity (all or nothing), Consistency (database remains in valid state), Isolation (concurrent transactions don't interfere), and Durability (committed data is permanent).",
        "explanation": "ACID properties ensure reliable database transactions.",
        "ai_answer": "ACID properties ensure reliable database transactions: Atomicity ensures all operations in a transaction complete or none do. Consistency maintains database integrity rules. Isolation ensures concurrent transactions don't interfere with each other. Durability guarantees committed transactions persist even after system failures.",
        "topic": "Database",
        "difficulty": "Medium",
        "source_url": "https://www.tcyonline.com/",
        "source_name": "TCYOnline",
        "company": "IBM",
        "time_estimate": 120
    },
    # Operating Systems
    {
        "id": "q11",
        "text": "What is the difference between process and thread?",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "A process is an independent program in execution with its own memory space. A thread is a lightweight unit of execution within a process that shares the process's memory space.",
        "explanation": "Understanding processes and threads is fundamental to OS concepts.",
        "ai_answer": "A process is an independent execution unit with its own memory space, file descriptors, and resources. A thread is a lightweight execution unit within a process that shares the process's memory and resources. Multiple threads can exist in one process, enabling concurrent execution while sharing data efficiently.",
        "topic": "Operating Systems",
        "difficulty": "Medium",
        "source_url": "https://www.prepinsta.com/operating-systems/",
        "source_name": "PrepInsta",
        "company": "Intel",
        "time_estimate": 100
    },
    {
        "id": "q12",
        "text": "Which scheduling algorithm is also known as shortest job first?",
        "question_type": "mcq",
        "options": ["FCFS", "SJF", "Round Robin", "Priority Scheduling"],
        "correct_answer": "SJF",
        "explanation": "SJF stands for Shortest Job First.",
        "ai_answer": "SJF (Shortest Job First) is a CPU scheduling algorithm that selects the process with the smallest execution time to execute next, minimizing average waiting time.",
        "topic": "Operating Systems",
        "difficulty": "Easy",
        "source_url": "https://www.indiabix.com/operating-systems/",
        "source_name": "IndiaBix",
        "company": "AMD",
        "time_estimate": 45
    },
    # Networking
    {
        "id": "q13",
        "text": "What is the difference between TCP and UDP?",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "TCP is connection-oriented, reliable, ensures data delivery in order with error checking. UDP is connectionless, faster, but doesn't guarantee delivery or order.",
        "explanation": "TCP and UDP are fundamental transport layer protocols.",
        "ai_answer": "TCP (Transmission Control Protocol) is connection-oriented and reliable, establishing a connection before data transfer, ensuring ordered delivery with error checking and retransmission. UDP (User Datagram Protocol) is connectionless and faster, sending data without establishing a connection, but doesn't guarantee delivery, order, or error correction. TCP is used for applications requiring reliability (HTTP, FTP), while UDP is used for real-time applications (streaming, gaming).",
        "topic": "Networking",
        "difficulty": "Medium",
        "source_url": "https://www.prepinsta.com/networking/",
        "source_name": "PrepInsta",
        "company": "Cisco",
        "time_estimate": 110
    },
    {
        "id": "q14",
        "text": "Which layer of the OSI model is responsible for routing?",
        "question_type": "mcq",
        "options": ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
        "correct_answer": "Network Layer",
        "explanation": "The Network Layer (Layer 3) handles routing.",
        "ai_answer": "The Network Layer (Layer 3) of the OSI model is responsible for routing, determining the best path for data packets to travel from source to destination.",
        "topic": "Networking",
        "difficulty": "Easy",
        "source_url": "https://www.tcyonline.com/",
        "source_name": "TCYOnline",
        "company": "Juniper",
        "time_estimate": 50
    },
    # OOP
    {
        "id": "q15",
        "text": "What are the four pillars of Object-Oriented Programming?",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "The four pillars are: Encapsulation (bundling data and methods), Abstraction (hiding complexity), Inheritance (reusing code from parent class), and Polymorphism (one interface, multiple implementations).",
        "explanation": "Understanding OOP fundamentals is crucial for software development.",
        "ai_answer": "The four pillars of OOP are: 1) Encapsulation - bundling data and methods that operate on that data within a single unit (class) and restricting access. 2) Abstraction - hiding complex implementation details and showing only essential features. 3) Inheritance - mechanism where a new class derives properties and behaviors from an existing class. 4) Polymorphism - ability of objects to take multiple forms, allowing methods to perform different tasks based on the object.",
        "topic": "OOP",
        "difficulty": "Easy",
        "source_url": "https://www.prepinsta.com/oops/",
        "source_name": "PrepInsta",
        "company": "Adobe",
        "time_estimate": 100
    },
    {
        "id": "q16",
        "text": "What is method overloading?",
        "question_type": "mcq",
        "options": [
            "Having multiple methods with same name but different parameters",
            "Having multiple methods with different names",
            "Overriding a parent class method",
            "Using static methods"
        ],
        "correct_answer": "Having multiple methods with same name but different parameters",
        "explanation": "Method overloading allows multiple methods with the same name but different signatures.",
        "ai_answer": "Method overloading is a feature that allows a class to have multiple methods with the same name but different parameters (different number, type, or order of parameters). This is a form of compile-time polymorphism.",
        "topic": "OOP",
        "difficulty": "Easy",
        "source_url": "https://www.indiabix.com/oops/",
        "source_name": "IndiaBix",
        "company": "Salesforce",
        "time_estimate": 55
    },
    # React
    {
        "id": "q17",
        "text": "What is the purpose of useEffect hook in React?",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "useEffect is used to perform side effects in functional components like data fetching, subscriptions, or manually changing the DOM. It runs after render and can be controlled with dependencies.",
        "explanation": "useEffect is a fundamental React hook for side effects.",
        "ai_answer": "The useEffect hook in React allows you to perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in class components. You can fetch data, subscribe to services, manipulate the DOM, or set up timers. The dependency array controls when the effect runs.",
        "topic": "React",
        "difficulty": "Medium",
        "source_url": "https://www.prepinsta.com/react/",
        "source_name": "PrepInsta",
        "company": "Netflix",
        "time_estimate": 100
    },
    {
        "id": "q18",
        "text": "What is Virtual DOM in React?",
        "question_type": "mcq",
        "options": [
            "A lightweight copy of the actual DOM kept in memory",
            "A browser API",
            "A database",
            "A styling framework"
        ],
        "correct_answer": "A lightweight copy of the actual DOM kept in memory",
        "explanation": "Virtual DOM is a key concept in React's performance optimization.",
        "ai_answer": "Virtual DOM is a lightweight JavaScript representation of the actual DOM kept in memory. React uses it to optimize performance by comparing the virtual DOM with the previous version (diffing), calculating the minimal changes needed, and updating only those parts in the real DOM (reconciliation).",
        "topic": "React",
        "difficulty": "Easy",
        "source_url": "https://www.tcyonline.com/",
        "source_name": "TCYOnline",
        "company": "Airbnb",
        "time_estimate": 70
    },
    # Very Hard Questions
    {
        "id": "q19",
        "text": "Explain how React's reconciliation algorithm works and why it's important for performance.",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "React's reconciliation algorithm (also called diffing) compares the current Virtual DOM with the new Virtual DOM using a heuristic O(n) algorithm. It assumes elements of different types produce different trees and uses keys to identify which items have changed. This allows React to update only the necessary parts of the actual DOM, significantly improving performance compared to re-rendering the entire DOM.",
        "explanation": "Deep understanding of React internals is expected for senior positions.",
        "ai_answer": "React's reconciliation algorithm efficiently updates the DOM through a process called 'diffing'. When state changes, React creates a new Virtual DOM tree and compares it with the previous one. The algorithm makes two assumptions: 1) Elements of different types will produce different trees (so it replaces the entire subtree). 2) Keys help identify stable elements across renders. The algorithm works in O(n) time by comparing trees level by level, updating only changed nodes. This is crucial for performance as direct DOM manipulation is expensive; React minimizes these operations by batching updates and only touching necessary DOM nodes.",
        "topic": "React",
        "difficulty": "Very Hard",
        "source_url": "https://www.reddit.com/r/reactjs/",
        "source_name": "Reddit - ReactJS",
        "company": "Facebook",
        "time_estimate": 240
    },
    {
        "id": "q20",
        "text": "Design and explain a system to handle rate limiting in a distributed microservices architecture.",
        "question_type": "descriptive",
        "options": None,
        "correct_answer": "Use a distributed rate limiter with Redis or similar in-memory store. Implement token bucket or sliding window algorithm. Each service checks a centralized counter before processing requests. Use consistent hashing for distribution. Implement circuit breakers for failure handling. Consider API gateway for centralized rate limiting. Use distributed caching and eventual consistency for scalability.",
        "explanation": "System design question testing distributed systems knowledge.",
        "ai_answer": "A robust distributed rate limiting system requires: 1) Centralized store (Redis/Memcached) for maintaining rate limit counters with TTL. 2) Algorithm choice: Token bucket for smooth rate limiting or Sliding window for precise control. 3) API Gateway as the first line of defense implementing rate limits before requests reach microservices. 4) Service-level rate limiting using middleware that checks Redis before processing. 5) Use Lua scripts in Redis for atomic operations. 6) Implement tiered rate limits (per user, per IP, per endpoint). 7) Circuit breakers to prevent cascade failures. 8) Monitoring and alerting for rate limit breaches. 9) Graceful degradation with proper error messages. 10) Consider geo-distribution using Redis Cluster with eventual consistency trade-offs.",
        "topic": "System Design",
        "difficulty": "Very Hard",
        "source_url": "https://www.reddit.com/r/programming/",
        "source_name": "Reddit - Programming",
        "company": "Uber",
        "time_estimate": 300
    }
]

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing questions
    await db.questions.delete_many({})
    
    # Insert sample questions
    await db.questions.insert_many(sample_questions)
    
    print(f"✅ Successfully seeded {len(sample_questions)} questions!")
    print(f"Topics: Python, JavaScript, Data Structures, Algorithms, Database, Operating Systems, Networking, OOP, React, System Design")
    print(f"Companies: Google, Microsoft, Amazon, Facebook, Apple, Netflix, Uber, Oracle, IBM, Intel, AMD, Cisco, Adobe, Salesforce, Airbnb")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
