from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings # Import the settings object

# Use the DATABASE_URL from the settings object, which is loaded from .env
# Provide a fallback for local development if .env is not present
DATABASE_URL_FALLBACK = "postgresql://postgres:lyz919191@localhost:5432/dreamimg_dev?client_encoding=utf8"

engine = create_engine(
    settings.DATABASE_URL or DATABASE_URL_FALLBACK
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()