"""
Inference Service for Batch Processing and Optimization
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from collections import deque
import time

from ..core.config import settings
from ..core.models import model_manager

logger = logging.getLogger(__name__)

@dataclass
class InferenceRequest:
    """Represents a single inference request"""
    id: str
    texts: List[str]
    future: asyncio.Future
    timestamp: float

class InferenceService:
    """Handles batched inference requests for optimal performance"""
    
    def __init__(self):
        self.request_queue = deque()
        self.processing_task: Optional[asyncio.Task] = None
        self.is_running = False
        self._lock = asyncio.Lock()
    
    async def start(self):
        """Start the inference service"""
        if self.is_running:
            return
        
        self.is_running = True
        self.processing_task = asyncio.create_task(self._process_requests())
        logger.info("Inference service started")
    
    async def stop(self):
        """Stop the inference service"""
        if not self.is_running:
            return
        
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
    
    async def predict(self, texts: List[str]) -> List[Dict[str, Any]]:
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
            results = await model_manager.predict(all_texts)
            
            # Distribute results back to requests
            result_index = 0
            for i, request in enumerate(batch):
                text_count = request_text_counts[i]
                request_results = results[result_index:result_index + text_count]
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
inference_service = InferenceService()
