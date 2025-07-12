"""
ML Model Management with Hot Reload Support
"""

import asyncio
import logging
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    pipeline,
    Pipeline
)
from .config import settings
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)

class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to analyze")

class BatchSentimentRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100, description="List of texts to analyze")

class SentimentScore(BaseModel):
    label: str = Field(..., description="Sentiment label")
    score: float = Field(..., ge=0.0, le=1.0, description="Confidence score")

class SentimentResult(BaseModel):
    text: str = Field(..., description="Original text")
    label: str = Field(..., description="Predicted sentiment label")
    score: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence")
    processing_time: float = Field(..., ge=0.0, description="Processing time in seconds")
    scores: Optional[Dict[str, float]] = Field(None, description="All label scores")

class BatchSentimentResult(BaseModel):
    results: List[SentimentResult] = Field(..., description="List of prediction results")
    total_processing_time: float = Field(..., ge=0.0, description="Total processing time in seconds")
    average_processing_time: float = Field(..., ge=0.0, description="Average processing time per text")

class ModelInfo(BaseModel):
    name: str = Field(..., description="Model name")
    framework: str = Field(..., description="ML framework")
    device: str = Field(..., description="Device (CPU/GPU)")
    quantized: bool = Field(..., description="Whether model is quantized")
    version: str = Field(..., description="Model version")

class HealthStatus(BaseModel):
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    model_loaded: bool = Field(..., description="Whether model is loaded")
    timestamp: str = Field(..., description="Timestamp of health check")
    memory_usage: Optional[Dict[str, Any]] = Field(None, description="Memory usage information")
    uptime: Optional[float] = Field(None, description="Service uptime in seconds")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "healthy",
                "service": "sentiment-analysis-api",
                "model_loaded": True,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }
    )

class ModelManager:
    """Manages ML model loading, inference, and hot-reload functionality"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline: Optional[Pipeline] = None
        self.model_info = {}
        self.load_time = 0
        self.device = None
        self._lock = asyncio.Lock()
        self.start_time = time.time()
    
    async def load_model(self, model_path: Optional[str] = None) -> bool:
        """Load model from local path or HuggingFace Hub"""
        async with self._lock:
            try:
                from ..core.config import settings
                
                logger.info(f"Loading model: {settings.model_name}")
                start_time = time.time()
                
                # Determine device
                if settings.device == "auto":
                    self.device = "cuda" if torch.cuda.is_available() else "cpu"
                else:
                    self.device = settings.device
                    
                logger.info(f"Using device: {self.device}")
                
                # Load model and tokenizer
                self.tokenizer = AutoTokenizer.from_pretrained(
                    settings.model_name,
                    cache_dir=settings.cache_dir
                )
                
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    settings.model_name,
                    cache_dir=settings.cache_dir
                )
                
                # Create pipeline
                self.pipeline = pipeline(
                    "sentiment-analysis",
                    model=self.model,
                    tokenizer=self.tokenizer,
                    device=0 if self.device == "cuda" else -1,
                    return_all_scores=True
                )
                
                self.load_time = time.time() - start_time
                logger.info(f"Model loaded successfully in {self.load_time:.2f}s")
                
                return True
                
            except Exception as e:
                logger.error(f"Failed to load model: {str(e)}")
                return False
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.pipeline is not None
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get current model information"""
        from ..core.config import settings
        
        return {
            "name": settings.model_name,
            "framework": "transformers",
            "device": self.device or "unknown",
            "quantized": settings.quantized,
            "load_time": self.load_time,
            "version": settings.model_version
        }
    
    async def reload_model(self):
        """Reload the model"""
        logger.info("Reloading model...")
        self.pipeline = None
        self.model = None
        self.tokenizer = None
        return await self.load_model()
    
    async def predict(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Predict sentiment for a list of texts"""
        if not self.pipeline:
            raise RuntimeError("Model not loaded")
        
        try:
            start_time = time.time()
            # Run inference
            results = self.pipeline(texts)
            end_time = time.time()
            
            # Process results
            processed_results = []
            for i, text in enumerate(texts):
                result = results[i] if isinstance(results[0], list) else [results[i]]
                
                # Convert to standard format
                sentiment_scores = {}
                for item in result:
                    label = item['label'].lower()
                    if label in ['positive', 'pos']:
                        sentiment_scores[SentimentLabel.POSITIVE] = item['score']
                    elif label in ['negative', 'neg']:
                        sentiment_scores[SentimentLabel.NEGATIVE] = item['score']
                    else:
                        sentiment_scores[label] = item['score']
                
                # Determine overall sentiment
                if SentimentLabel.POSITIVE in sentiment_scores and SentimentLabel.NEGATIVE in sentiment_scores:
                    overall_sentiment = SentimentLabel.POSITIVE if sentiment_scores[SentimentLabel.POSITIVE] > sentiment_scores[SentimentLabel.NEGATIVE] else SentimentLabel.NEGATIVE
                    confidence = max(sentiment_scores[SentimentLabel.POSITIVE], sentiment_scores[SentimentLabel.NEGATIVE])
                else:
                    # Fallback for other label formats
                    max_item = max(result, key=lambda x: x['score'])
                    overall_sentiment = max_item['label'].lower()
                    confidence = max_item['score']
                
                processed_results.append({
                    'text': text,
                    'label': overall_sentiment.upper(),
                    'score': confidence,
                    'confidence': confidence,
                    'processing_time': end_time - start_time,
                    'scores': sentiment_scores,
                    'timestamp': datetime.utcnow().isoformat()
                })
            
            return processed_results
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise

    def get_health_status(self) -> Dict[str, Any]:
        """Get current health status of the service"""
        from ..core.config import settings
        
        current_time = time.time()
        uptime = current_time - self.start_time
        memory_usage = self.get_memory_usage()
        
        return {
            "status": "healthy",
            "service": settings.service_name,
            "model_loaded": self.is_loaded(),
            "timestamp": datetime.utcnow().isoformat(),
            "memory_usage": memory_usage,
            "uptime": uptime
        }
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Get memory usage information"""
        import psutil
        
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        
        return {
            "rss": memory_info.rss,  # Resident Set Size
            "vms": memory_info.vms,  # Virtual Memory Size
            "shared": memory_info.shared,
            "text": memory_info.text,
            "lib": memory_info.lib,
            "data": memory_info.data,
            "dirty": memory_info.dirty
        }

# Global model manager instance
model_manager = ModelManager()
