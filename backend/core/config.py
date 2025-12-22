"""
Configuration module for NexusMind backend.
Loads environment variables and provides app-wide settings.
"""
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()


class Settings(BaseModel):
    """Application settings loaded from environment variables."""
    
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")  # Anon key for frontend
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY", "")  # Service key for backend
    
    # CORS Configuration
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # API Configuration
    api_title: str = "NexusMind API"
    api_version: str = "1.0.0"
    api_description: str = "AI-Powered Markdown Wiki Backend"
    
    class Config:
        env_file = ".env"


# Global settings instance
settings = Settings()
