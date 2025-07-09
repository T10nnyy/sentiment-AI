"""
Configuration management using Pydantic Settings
"""

from pydantic import BaseSettings, Field
from typing import List, Literal
import os

class Settings(BaseSettings):
    # Model Configuration
    model_name: str = Field(
        default="siebert/sentiment-roberta-large-english",
        env="MODEL_NAME"
    )
    model_framework: Literal["pytorch", "tensorflow"] = Field(
        default="pytorch",
        env="MODEL_FRAMEWORK"
    )
    local_model_path: str = Field(default="./model/", env="LOCAL_MODEL_PATH")
    device: Literal["cpu", "cuda", "mps"] = Field(default="cpu", env="DEVICE")
    
    # Quantization Settings
    enable_quantization: bool = Field(default=False, env="ENABLE_QUANTIZATION")
    quantization_backend: Literal["onnx", "bitsandbytes", "tensorrt"] = Field(
        default="onnx",
        env="QUANTIZATION_BACKEND"
    )
    
    # Hot Reload
    enable_hot_reload: bool = Field(default=True, env="ENABLE_HOT_RELOAD")
    
    # Processing Settings
    batch_size: int = Field(default=16, env="BATCH_SIZE")
    max_length: int = Field(default=512, env="MAX_LENGTH")
    batch_timeout: float = Field(default=0.1, env="BATCH_TIMEOUT")
    
    # API Settings
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    debug: bool = Field(default=False, env="DEBUG")
    cors_origins: List[str] = Field(
        default=["http://localhost:3000"],
        env="CORS_ORIGINS"
    )
    
    # Monitoring
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()
