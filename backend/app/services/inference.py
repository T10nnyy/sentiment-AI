"""
Inference Service for Batch Processing and Optimization
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from collections import deque
import time
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import psutil
from datetime import datetime

from ..core.config import settings
from ..core.models import SentimentResult, SentimentScore, SentimentLabel, ModelInfo, HealthStatus, PredictResponse, BatchPredictResponse, ModelInfoResponse

logger = logging.getLogger(__name__)

@dataclass
class InferenceRequest:
    """Represents a single inference request"""
    id: str
    texts: List[str]
    future: asyncio.Future
    timestamp: float

class SentimentInferenceService:
    """Service for handling sentiment analysis inference"""
    
    def __init__(self):
        self.pipeline: Optional[pipeline] = None
        self.model = None
        self.tokenizer = None
        self.device = settings.DEVICE
        self.model_name = settings.MODEL_NAME
        self._model_loaded = False
        self.start_time = time.time()
        self.load_model()
        self.request_queue = deque()
        self.processing_task: Optional[asyncio.Task] = None
        self.is_running = False
        self._lock = asyncio.Lock()
        self.total_predictions = 0
        self.total_processing_time = 0
        
        # Label mapping for Cardiff model
        self.label_mapping = {
            "LABEL_0": "negative",
            "LABEL_1": "neutral", 
            "LABEL_2": "positive"
        }
    
    def load_model(self) -> bool:
        """Load the sentiment analysis model"""
        try:
            logger.info(f"Loading model: {self.model_name}")
            
            # Load the pipeline
            self.pipeline = pipeline(
                "sentiment-analysis",
                model=self.model_name,
                device=0 if self.device == "cuda" and torch.cuda.is_available() else -1,
                return_all_scores=True
            )
            
            # Load model and tokenizer separately for more control
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            
            logger.info("Model loaded successfully")
            self._model_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self._model_loaded = False
            return False
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self._model_loaded and self.pipeline is not None
    
    def normalize_label(self, label: str) -> str:
        """Normalize label names"""
        return self.label_mapping.get(label, label.lower())
    
    def analyze_sentiment(self, text: str) -> PredictResponse:
        """Analyze sentiment of a single text"""
        if not self.is_model_loaded():
            raise RuntimeError("Model not loaded")
        
        start_time = time.time()
        
        try:
            # Get predictions
            results = self.pipeline(text)
            
            # Find the highest scoring result
            best_result = max(results[0], key=lambda x: x['score'])
            
            normalized_label = self.normalize_label(best_result['label'])
            processing_time = time.time() - start_time
            
            return PredictResponse(
                text=text,
                sentiment=SentimentLabel(
                    label=normalized_label,
                    score=best_result['score']
                ),
                confidence=best_result['score'],
                processing_time=processing_time,
                scores={result['label']: result['score'] for result in results[0]}
            )
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            raise RuntimeError(f"Analysis failed: {str(e)}")
    
    def analyze_batch(self, texts: List[str]) -> BatchPredictResponse:
        """Analyze sentiment of multiple texts"""
        if not self.is_model_loaded():
            raise RuntimeError("Model not loaded")
        
        start_time = time.time()
        results = []
        
        for text in texts:
            try:
                result = self.analyze_sentiment(text)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to analyze text: {text[:50]}... Error: {e}")
                # Add a default result for failed analysis
                results.append(PredictResponse(
                    text=text,
                    sentiment=SentimentLabel(
                        label="UNKNOWN",
                        score=0.0
                    ),
                    confidence=0.0,
                    processing_time=0.0,
                    scores={}
                ))
        
        total_time = time.time() - start_time
        avg_time = total_time / len(texts) if texts else 0
        
        return BatchPredictResponse(
            results=results,
            total_processing_time=total_time,
            average_processing_time=avg_time
        )
    
    def get_model_info(self) -> ModelInfoResponse:
        """Get information about the loaded model"""
        device_info = "cuda" if torch.cuda.is_available() and self.device == "cuda" else "cpu"
        
        return ModelInfoResponse(
            name=self.model_name,
            framework="PyTorch/Transformers",
            device=device_info,
            quantized=False,
            version="1.0.0"
        )
    
    def get_health_status(self) -> HealthStatus:
        """Get service health status"""
        memory = psutil.virtual_memory()
        
        return HealthStatus(
            status="healthy" if self.is_model_loaded() else "unhealthy",
            service="sentiment-analysis-service",
            model_loaded=self.is_model_loaded(),
            memory_usage={
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used
            },
            uptime=time.time() - self.start_time,
            timestamp=datetime.utcnow().isoformat()
        )
    
    async def start(self):
        """Start the inference service"""
        self.is_running = True
        self.processing_task = asyncio.create_task(self._process_requests())
        logger.info("Inference service started")
    
    async def stop(self):
        """Stop the inference service"""
        self.is_running = False
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
        
        # Cancel any pending requests
        while self.request_queue:
            request = self.request_queue.popleft()
            if not request.future.done():
                request.future.cancel()
        
        logger.info("Inference service stopped")
    
    async def predict_async(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Submit texts for prediction"""
        if not self.is_running:
            raise RuntimeError("Inference service not running")
        
        # Create request
        request_id = f"req_{int(time.time() * 1000000)}"
        future = asyncio.Future()
        request = InferenceRequest(
            id=request_id,
            texts=texts,
            future=future,
            timestamp=time.time()
        )
        
        # Add to queue
        async with self._lock:
            self.request_queue.append(request)
        
        # Wait for result
        try:
            return await future
        except asyncio.CancelledError:
            logger.warning(f"Request {request_id} was cancelled")
            raise
    
    async def _process_requests(self):
        """Main processing loop"""
        while self.is_running:
            try:
                # Collect batch of requests
                batch = await self._collect_batch()
                
                if not batch:
                    await asyncio.sleep(0.01)  # Small delay to prevent busy waiting
                    continue
                
                # Process batch
                await self._process_batch(batch)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in inference processing: {str(e)}")
                await asyncio.sleep(0.1)  # Brief pause on error
    
    async def _collect_batch(self) -> List[InferenceRequest]:
        """Collect requests for batch processing"""
        batch = []
        current_time = time.time()
        
        async with self._lock:
            # Collect requests up to batch size or timeout
            while (len(batch) < settings.batch_size and 
                   self.request_queue and 
                   (len(batch) == 0 or 
                    current_time - batch[0].timestamp < settings.batch_timeout)):
                
                request = self.request_queue.popleft()
                
                # Check if request is too old (timeout)
                if current_time - request.timestamp > 30.0:  # 30 second timeout
                    if not request.future.done():
                        request.future.set_exception(TimeoutError("Request timeout"))
                    continue
                
                batch.append(request)
        
        return batch
    
    async def _process_batch(self, batch: List[InferenceRequest]):
        """Process a batch of requests"""
        if not batch:
            return
        
        try:
            # Flatten all texts from all requests
            all_texts = []
            request_text_counts = []
            
            for request in batch:
                all_texts.extend(request.texts)
                request_text_counts.append(len(request.texts))
            
            # Run inference on all texts
            results = self.analyze_batch(all_texts)
            
            # Distribute results back to requests
            result_index = 0
            for i, request in enumerate(batch):
                text_count = request_text_counts[i]
                request_results = results.results[result_index:result_index + text_count]
                result_index += text_count
                
                # Set result for this request
                if not request.future.done():
                    request.future.set_result(request_results)
            
            logger.debug(f"Processed batch of {len(batch)} requests with {len(all_texts)} texts")
            
        except Exception as e:
            logger.error(f"Batch processing failed: {str(e)}")
            
            # Set exception for all requests in batch
            for request in batch:
                if not request.future.done():
                    request.future.set_exception(e)

# Global inference service instance
inference_service = SentimentInferenceService()
