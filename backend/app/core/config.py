"""
Configuration settings for the sentiment analysis service
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    HOST: str = Field(default="0.0.0.0", description="Host to bind to")
    PORT: int = Field(default=8000, description="Port to bind to")
    RELOAD: bool = Field(default=True, description="Reload on code changes")
    
    # Model Configuration
    MODEL_NAME: str = Field(default="cardiffnlp/twitter-roberta-base-sentiment-latest", description="HuggingFace model name")
    FALLBACK_MODEL: str = "distilbert-base-uncased-finetuned-sst-2-english"
    DEVICE: str = Field(default="auto", description="Device to use (auto, cpu, cuda)")
    QUANTIZED: bool = Field(default=False, description="Whether to use quantized model")
    CACHE_DIR: str = Field(default="./model_cache", description="Model cache directory")
    MODEL_VERSION: str = Field(default="1.0.0", description="Model version")
    
    # Processing Configuration
    MAX_BATCH_SIZE: int = Field(default=100, description="Maximum batch size")
    MAX_FILE_SIZE: int = Field(default=1000, description="Maximum file size")
    BATCH_TIMEOUT: float = Field(default=1.0, description="Batch timeout in seconds")
    MAX_TEXT_LENGTH: int = Field(default=10000, description="Maximum text length")
    
    # Environment Configuration
    ENVIRONMENT: str = Field(default="development", description="Environment type")
    DEBUG: bool = Field(default=False, description="Debug mode")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # Performance Configuration
    WORKERS: int = Field(default=1, description="Number of worker processes")
    TIMEOUT: int = Field(default=30, description="Request timeout in seconds")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    
    # HuggingFace Configuration
    HF_HUB_DISABLE_PROGRESS_BARS: bool = Field(default=True, description="Disable progress bars in HuggingFace")
    TOKENIZERS_PARALLELISM: bool = Field(default=False, description="Disable tokenizers parallelism")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()

# Set environment variables
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = str(settings.HF_HUB_DISABLE_PROGRESS_BARS).lower()
os.environ["TOKENIZERS_PARALLELISM"] = str(settings.TOKENIZERS_PARALLELISM).lower()

# Batch processing settings
batch_size = getattr(settings, 'MAX_BATCH_SIZE', 32)
batch_timeout = getattr(settings, 'BATCH_TIMEOUT', 1.0)
