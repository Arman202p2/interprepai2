from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path
import json
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def view_users():
    # Connect to MongoDB
    client = MongoClient(mongo_url)
    db = client[db_name]
    
    print("\n=== Users in Database ===\n")
    
    # Get all users
    users = list(db.users.find({}))
    
    if not users:
        print("No users found in database.")
        return
        
    for user in users:
        # Convert MongoDB specific types to serializable format
        user_dict = {}
        for key, value in user.items():
            if key == '_id':
                user_dict[key] = str(value)
            elif isinstance(value, datetime):
                user_dict[key] = value.isoformat()
            else:
                user_dict[key] = value
        
        user_str = json.dumps(user_dict, indent=2)
        print(user_str)
        print("-" * 50)
    
    client.close()

if __name__ == "__main__":
    view_users()