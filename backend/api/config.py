from typing import List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # API settings
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG") == "true"
    PROJECT_NAME: str = "Warehouse Management API"
    VERSION: str = "0.1.0"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # CORS settings
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS").split(",")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT")
    # Note: removed BaseSettings inheritance and Config class to avoid pydantic parsing

    # KiotViet
    KIOTVIET_AUTH_URL: str = os.getenv("KIOTVIET_AUTH_URL")
    KIOTVIET_BASE_URL: str = os.getenv("KIOTVIET_BASE_URL")
    KIOTVIET_CLIENT_ID: str = os.getenv("KIOTVIET_CLIENT_ID")
    KIOTVIET_CLIENT_SECRET: str = os.getenv("KIOTVIET_CLIENT_SECRET")
    KIOTVIET_RETAILER: str = os.getenv("KIOTVIET_RETAILER")

settings = Settings()
