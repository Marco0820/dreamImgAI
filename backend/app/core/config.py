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

    # Database settings - We will now read the full URL directly from the .env file
    DATABASE_URL: str

    # Tencent Cloud API Credentials
    TENCENT_SECRET_ID: Optional[str] = None
    TENCENT_SECRET_KEY: Optional[str] = None

    # TTAPI Key
    TTAPI_KEY: str = os.getenv("TTAPI_KEY", "your_ttapi_key_here")

    # Fireworks.ai API Key
    FIREWORKS_API_KEY: Optional[str] = None

    # Cloudflare Turnstile
    CLOUDFLARE_TURNSTILE_SECRET_KEY: str = os.getenv("CLOUDFLARE_TURNSTILE_SECRET_KEY", "your_secret_key_here")

    # Creem API Key
    CREEM_API_KEY: Optional[str] = None
    CREEM_WEBHOOK_SECRET: Optional[str] = None
    CREEM_API_URL: Optional[str] = None # For overriding the default test API

    # Client URL for redirecting after payment
    CLIENT_BASE_URL: str = "http://localhost:3000"

    NEXTAUTH_SECRET: Optional[str] = os.getenv("NEXTAUTH_SECRET")

settings = Config()

if not settings.TTAPI_KEY or settings.TTAPI_KEY == "YOUR_TTAPI_KEY":
    print("--- WARNING: TTAPI_KEY is not set or is using the default placeholder in the .env file.")

if not settings.NEXTAUTH_SECRET:
    print("--- WARNING: NEXTAUTH_SECRET is not set. This might affect other parts of the app if they exist.") 