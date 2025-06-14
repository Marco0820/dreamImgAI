# backend/init_db.py
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# This is to ensure that the script can find the 'app' module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# --- Direct Database Connection ---
# Bypassing all config files to ensure connection by hardcoding the URL directly in the script.
DATABASE_URL = "postgresql://postgres:lyz919191@localhost:5432/dreamimg_dev"

try:
    engine = create_engine(DATABASE_URL)

    from app.database import Base
    from app.models import User, Image, SharedImage, Favorite, Comment

    print("Initializing database...")
    print("This will create all the necessary tables based on your models.")
    
    # The main command to create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database initialized successfully. Tables have been created.")
    print("You can now start the main backend server.")

except Exception as e:
    print("❌ An error occurred during database initialization:")
    print(e) 