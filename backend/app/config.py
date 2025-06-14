import os
import boto3
import json
from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional

# Path to the .env file
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

def get_secret(secret_name: str, region_name: str):
    """Retrieves a secret from AWS Secrets Manager."""
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    try:
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    except Exception as e:
        raise e
    else:
        return json.loads(get_secret_value_response['SecretString'])

class Settings(BaseSettings):
    PROJECT_NAME: str = "DreamImg.AI"
    API_V1_STR: str = "/api/v1"

    # Environment settings
    ENVIRONMENT: str = "development"
    AWS_REGION: Optional[str] = None
    DB_CREDENTIALS_SECRET_NAME: Optional[str] = None

    # Security (can be in .env or secrets manager)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # Database: Will be constructed for production
    DATABASE_URL: Optional[str] = "postgresql+psycopg2://postgres:lyz919191@localhost:5432/dreamimg_dev"
    
    # API Keys (can be in .env or secrets manager)
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    STABILITY_API_KEY: Optional[str] = None
    SEGMIND_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = "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"

    # Stripe Settings (can be in .env or secrets manager)
    STRIPE_API_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # URLs
    FRONTEND_URL: str = "http://localhost:3000"

    # CORS settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    class Config:
        case_sensitive = True
        env_file = ENV_FILE
        env_file_encoding = 'utf-8'

# Load settings from the .env file first
settings = Settings()

# If in production, override settings with values from Secrets Manager
if settings.ENVIRONMENT == "production":
    if not all([settings.AWS_REGION, settings.DB_CREDENTIALS_SECRET_NAME]):
        raise ValueError("In production, AWS_REGION and DB_CREDENTIALS_SECRET_NAME must be set.")
    
    secrets = get_secret(settings.DB_CREDENTIALS_SECRET_NAME, settings.AWS_REGION)
    
    # Construct Database URL from secret components
    db_user = secrets.get('username')
    db_pass = secrets.get('password')
    db_host = secrets.get('host')
    db_port = secrets.get('port')
    db_name = secrets.get('dbname')
    settings.DATABASE_URL = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

    # Override other settings from the secret
    settings.SECRET_KEY = secrets.get("SECRET_KEY", settings.SECRET_KEY)
    settings.OPENAI_API_KEY = secrets.get("OPENAI_API_KEY", settings.OPENAI_API_KEY)
    settings.GROQ_API_KEY = secrets.get("GROQ_API_KEY", settings.GROQ_API_KEY)
    settings.STABILITY_API_KEY = secrets.get("STABILITY_API_KEY", settings.STABILITY_API_KEY)
    settings.SEGMIND_API_KEY = secrets.get("SEGMIND_API_KEY", settings.SEGMIND_API_KEY)
    settings.STRIPE_API_KEY = secrets.get("STRIPE_API_KEY", settings.STRIPE_API_KEY)
    settings.STRIPE_WEBHOOK_SECRET = secrets.get("STRIPE_WEBHOOK_SECRET", settings.STRIPE_WEBHOOK_SECRET)
    settings.HF_TOKEN = secrets.get("HF_TOKEN", settings.HF_TOKEN) 