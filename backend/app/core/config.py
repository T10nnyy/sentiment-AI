"""
Configuration settings for the sentiment analysis microservice
"""

import os
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # Model Configuration
    model_name: str = "siebert/sentiment-roberta-large-english"
    device: str = "auto"  # auto, cpu, cuda
    quantized: bool = False
    cache_dir: str = "./models"
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # Performance Configuration
    max_batch_size: int = 100
    max_text_length: int = 512
    enable_hot_reload: bool = True
    
    # Logging Configuration
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()
