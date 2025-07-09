"""
ML Model Management with Hot Reload Support
"""

import asyncio
import logging
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import threading
import torch
import tensorflow as tf
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    TFAutoModelForSequenceClassification,
    pipeline
)
from .config import settings

logger = logging.getLogger(__name__)

class ModelManager:
    """Manages ML model loading, inference, and hot-reload functionality"""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.model_info = {}
        self.lock = threading.RLock()
        self.is_quantized = False
        self.device = self._get_device()
        
    def _get_device(self) -> str:
        """Determine the best available device"""
        if settings.device == "cuda" and torch.cuda.is_available():
            return "cuda"
        elif settings.device == "mps" and torch.backends.mps.is_available():
            return "mps"
        return "cpu"
    
    async def load_model(self, model_path: Optional[str] = None) -> bool:
        """Load model from local path or HuggingFace Hub"""
        try:
            with self.lock:
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
                
                # Load tokenizer and model directly
                self.tokenizer = AutoTokenizer.from_pretrained(model_source)
                
                # Load model based on framework
                if settings.model_framework == "pytorch":
                    self.model = AutoModelForSequenceClassification.from_pretrained(
                        model_source,
                        torch_dtype=torch.float16 if self.device != "cpu" else torch.float32
                    )
                    self.model.to(self.device)
                    self.model.eval()
                    
                    # Create pipeline
                    self.pipeline = pipeline(
                        "text-classification",
                        model=self.model,
                        tokenizer=self.tokenizer,
                        device=0 if self.device == "cuda" else -1,
                        return_all_scores=True
                    )
                    
                elif settings.model_framework == "tensorflow":
                    self.model = TFAutoModelForSequenceClassification.from_pretrained(
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
                    await self._apply_quantization()
                
                # Update model info
                self.model_info = {
                    "name": model_source,
                    "framework": settings.model_framework,
                    "quantized": self.is_quantized,
                    "device": self.device,
                    "load_time": time.time() - start_time
                }
                
                logger.info(f"Model loaded successfully in {self.model_info['load_time']:.2f}s")
                return True
                
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            return False
    
    async def _apply_quantization(self):
        """Apply model quantization based on backend"""
        try:
            if settings.quantization_backend == "bitsandbytes" and settings.model_framework == "pytorch":
                from bitsandbytes import quantize_8bit
                self.model = quantize_8bit(self.model)
                self.is_quantized = True
                logger.info("Applied bitsandbytes 8-bit quantization")
                
            elif settings.quantization_backend == "onnx":
                # ONNX quantization would be implemented here
                logger.info("ONNX quantization not implemented in this demo")
                
            elif settings.quantization_backend == "tensorrt":
                # TensorRT quantization would be implemented here
                logger.info("TensorRT quantization not implemented in this demo")
                
        except Exception as e:
            logger.warning(f"Quantization failed: {str(e)}")
    
    async def predict_single(self, text: str) -> Dict[str, Union[str, float]]:
        """Predict sentiment for a single text"""
        if not self.pipeline:
            raise RuntimeError("Model not loaded")
        
        try:
            with self.lock:
                # Run inference
                results = self.pipeline(text)
            
            # Process results for siebert model (NEGATIVE/POSITIVE labels)
            if isinstance(results, list) and len(results) > 0:
                if isinstance(results[0], list):
                    # Multiple scores returned
                    scores = results[0]
                    positive_score = 0.0
                    negative_score = 0.0
                    
                    for score_dict in scores:
                        label = score_dict['label'].upper()
                        if label == 'POSITIVE':
                            positive_score = score_dict['score']
                        elif label == 'NEGATIVE':
                            negative_score = score_dict['score']
                    
                    if positive_score > negative_score:
                        return {"label": "positive", "score": positive_score}
                    else:
                        return {"label": "negative", "score": negative_score}
                else:
                    # Single result
                    result = results[0]
                    label = result['label'].upper()
                    score = result['score']
                    
                    # Map siebert model labels to lowercase
                    if label == 'POSITIVE':
                        return {"label": "positive", "score": score}
                    elif label == 'NEGATIVE':
                        return {"label": "negative", "score": score}
            
            # Fallback
            return {"label": "neutral", "score": 0.5}
            
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise

    
    async def predict_batch(self, texts: List[str]) -> List[Dict[str, Union[str, float]]]:
        """Predict sentiment for a batch of texts"""
        if not self.pipeline:
            raise RuntimeError("Model not loaded")
        
        try:
            with self.lock:
                results = []
                
                # Process in batches
                for i in range(0, len(texts), settings.batch_size):
                    batch = texts[i:i + settings.batch_size]
                    batch_results = self.pipeline(batch)
                
                for result in batch_results:
                    if isinstance(result, list):
                        # Multiple scores
                        positive_score = 0.0
                        negative_score = 0.0
                        
                        for score_dict in result:
                            label = score_dict['label'].upper()
                            if label == 'POSITIVE':
                                positive_score = score_dict['score']
                            elif label == 'NEGATIVE':
                                negative_score = score_dict['score']
                        
                        if positive_score > negative_score:
                            results.append({"label": "positive", "score": positive_score})
                        else:
                            results.append({"label": "negative", "score": negative_score})
                    else:
                        # Single result
                        label = result['label'].upper()
                        score = result['score']
                        
                        if label == 'POSITIVE':
                            results.append({"label": "positive", "score": score})
                        elif label == 'NEGATIVE':
                            results.append({"label": "negative", "score": score})
            
            return results
            
    except Exception as e:
        logger.error(f"Batch prediction failed: {str(e)}")
        raise
    
    def get_model_info(self) -> Dict:
        """Get current model information"""
        return self.model_info.copy()
    
    async def reload_model(self) -> bool:
        """Reload model (used by hot-reload)"""
        logger.info("Reloading model...")
        return await self.load_model()

# Global model manager instance
model_manager = ModelManager()
