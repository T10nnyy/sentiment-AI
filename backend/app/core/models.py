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

logger = logging.getLogger(__name__)

class ModelManager:
    """Manages ML model loading, inference, and hot-reload functionality"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline: Optional[Pipeline] = None
        self.model_info = {}
        self.load_time = 0
        self._lock = asyncio.Lock()
    
    async def load_model(self, model_path: Optional[str] = None) -> bool:
        """Load model from local path or HuggingFace Hub"""
        async with self._lock:
            try:
                start_time = time.time()
                
                # Determine model source
                if model_path and os.path.exists(model_path):
                    model_source = model_path
                    logger.info(f"Loading local model from {model_path}")
                elif os.path.exists(settings.local_model_path):
                    model_source = settings.local_model_path
                    logger.info(f"Loading local model from {settings.local_model_path}")
                else:
                    model_source = settings.model_name
                    logger.info(f"Loading model from HuggingFace Hub: {model_source}")
                
                # Determine device
                device = self._get_device()
                logger.info(f"Using device: {device}")
                
                # Load tokenizer and model directly
                self.tokenizer = AutoTokenizer.from_pretrained(model_source)
                
                # Load model based on framework
                if settings.ml_framework == "pytorch":
                    self.model = AutoModelForSequenceClassification.from_pretrained(
                        model_source,
                        torch_dtype=torch.float16 if device != "cpu" else torch.float32
                    )
                    self.model.to(device)
                    self.model.eval()
                    
                    # Create pipeline
                    self.pipeline = pipeline(
                        "text-classification",
                        model=self.model,
                        tokenizer=self.tokenizer,
                        device=0 if device == "cuda" else -1,
                        return_all_scores=True
                    )
                    
                elif settings.ml_framework == "tensorflow":
                    self.model = AutoModelForSequenceClassification.from_pretrained(
                        model_source
                    )
                    
                    # Create pipeline
                    self.pipeline = pipeline(
                        "text-classification",
                        model=self.model,
                        tokenizer=self.tokenizer,
                        framework="tf",
                        return_all_scores=True
                    )
                
                # Apply quantization if enabled
                if settings.enable_quantization:
                    self.model = self._apply_quantization(self.model)
                
                # Store load time
                self.load_time = time.time() - start_time
                
                # Update model info
                self.model_info = {
                    "name": model_source,
                    "framework": settings.ml_framework,
                    "device": str(device),
                    "load_time": self.load_time,
                    "quantized": settings.enable_quantization,
                    "parameters": sum(p.numel() for p in self.model.parameters()) if self.model else 0,
                    "model_size_mb": sum(p.numel() * p.element_size() for p in self.model.parameters()) / 1024 / 1024 if self.model else 0
                }
                
                logger.info(f"Model loaded successfully in {self.load_time:.2f}s")
                logger.info(f"Model parameters: {self.model_info['parameters']:,}")
                logger.info(f"Model size: {self.model_info['model_size_mb']:.2f} MB")
                
                return True
                
            except Exception as e:
                logger.error(f"Failed to load model: {str(e)}")
                return False
    
    async def reload_model(self) -> bool:
        """Reload model (used by hot-reload)"""
        logger.info("Reloading model...")
        return await self.load_model()
    
    def _get_device(self) -> str:
        """Determine the best available device"""
        if settings.device == "cuda" and torch.cuda.is_available():
            return "cuda"
        elif settings.device == "mps" and torch.backends.mps.is_available():
            return "mps"
        return "cpu"
    
    def _apply_quantization(self, model):
        """Apply model quantization based on backend"""
        try:
            if settings.quantization_backend == "bitsandbytes" and settings.ml_framework == "pytorch":
                from bitsandbytes import quantize_8bit
                model = quantize_8bit(model)
                logger.info("Applied bitsandbytes 8-bit quantization")
                
            elif settings.quantization_backend == "onnx":
                # ONNX quantization would be implemented here
                logger.info("ONNX quantization not implemented in this demo")
                
            elif settings.quantization_backend == "tensorrt":
                # TensorRT quantization would be implemented here
                logger.info("TensorRT quantization not implemented in this demo")
                
            return model
                
        except Exception as e:
            logger.warning(f"Quantization failed: {str(e)}")
            return model
    
    async def predict(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Predict sentiment for a list of texts"""
        if not self.pipeline:
            raise RuntimeError("Model not loaded")
        
        try:
            # Run inference
            results = self.pipeline(texts)
            
            # Process results
            processed_results = []
            for i, text in enumerate(texts):
                result = results[i] if isinstance(results[0], list) else [results[i]]
                
                # Convert to standard format
                sentiment_scores = {}
                for item in result:
                    label = item['label'].lower()
                    if label in ['positive', 'pos']:
                        sentiment_scores['positive'] = item['score']
                    elif label in ['negative', 'neg']:
                        sentiment_scores['negative'] = item['score']
                    else:
                        sentiment_scores[label] = item['score']
                
                # Determine overall sentiment
                if 'positive' in sentiment_scores and 'negative' in sentiment_scores:
                    overall_sentiment = 'positive' if sentiment_scores['positive'] > sentiment_scores['negative'] else 'negative'
                    confidence = max(sentiment_scores['positive'], sentiment_scores['negative'])
                else:
                    # Fallback for other label formats
                    max_item = max(result, key=lambda x: x['score'])
                    overall_sentiment = max_item['label'].lower()
                    confidence = max_item['score']
                
                processed_results.append({
                    'text': text,
                    'sentiment': overall_sentiment,
                    'confidence': confidence,
                    'scores': sentiment_scores
                })
            
            return processed_results
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get current model information"""
        return self.model_info.copy()
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.pipeline is not None

# Global model manager instance
model_manager = ModelManager()
