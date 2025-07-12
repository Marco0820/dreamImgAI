from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from typing import Optional

class Config(BaseSettings):
    # Pydantic V2 configuration using model_config dictionary
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

    PROJECT_NAME: str = "DreamImg AI"
    API_V1_STR: str = "/api/v1"

    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "app"
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"

    # Tencent Cloud API Credentials
    TENCENT_SECRET_ID: str
    TENCENT_SECRET_KEY: str

    # Cloudflare Turnstile
    CLOUDFLARE_TURNSTILE_SECRET_KEY: str

    # Creem API Key
    CREEM_API_KEY: Optional[str] = None
    CREEM_WEBHOOK_SECRET: Optional[str] = None
    CREEM_API_URL: Optional[str] = None # For overriding the default test API

    # Client URL for redirecting after payment
    CLIENT_BASE_URL: str = "http://localhost:3000"

    NEXTAUTH_SECRET: Optional[str] = os.getenv("NEXTAUTH_SECRET")

settings = Config()

if not settings.TENCENT_SECRET_ID or not settings.TENCENT_SECRET_KEY:
    print("--- FATAL ERROR: Tencent Cloud credentials are not set in the .env file.")

if not settings.NEXTAUTH_SECRET:
    print("--- WARNING: NEXTAUTH_SECRET is not set. This might affect other parts of the app if they exist.") 