"""
Async Batch Processing for Higher Throughput
"""

import asyncio
import logging
import time
from typing import List, Dict, Any, Callable
from dataclasses import dataclass
from .config import settings

logger = logging.getLogger(__name__)

@dataclass
class BatchRequest:
    """Individual request in a batch"""
    text: str
    future: asyncio.Future
    timestamp: float

class BatchProcessor:
    """Handles batching of inference requests for optimal throughput"""
    
    def __init__(self, process_func: Callable):
        self.process_func = process_func
        self.queue: List[BatchRequest] = []
        self.lock = asyncio.Lock()
        self.processing = False
        self.batch_task = None
        
    async def start(self):
        """Start the batch processing loop"""
        if not self.batch_task:
            self.batch_task = asyncio.create_task(self._batch_loop())
    
    async def stop(self):
        """Stop the batch processing loop"""
        if self.batch_task:
            self.batch_task.cancel()
            try:
                await self.batch_task
            except asyncio.CancelledError:
                pass
    
    async def add_request(self, text: str) -> Dict[str, Any]:
        """Add a request to the batch queue"""
        future = asyncio.Future()
        request = BatchRequest(
            text=text,
            future=future,
            timestamp=time.time()
        )
        
        async with self.lock:
            self.queue.append(request)
        
        # Wait for result
        return await future
    
    async def _batch_loop(self):
        """Main batch processing loop"""
        while True:
            try:
                await asyncio.sleep(settings.batch_timeout)
                await self._process_batch()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Batch processing error: {str(e)}")
    
    async def _process_batch(self):
        """Process current batch of requests"""
        if self.processing:
            return
        
        async with self.lock:
            if not self.queue:
                return
            
            # Get batch
            batch = self.queue[:settings.batch_size]
            self.queue = self.queue[settings.batch_size:]
        
        if not batch:
            return
        
        self.processing = True
        
        try:
            # Extract texts
            texts = [req.text for req in batch]
            
            # Process batch
            results = await self.process_func(texts)
            
            # Set results
            for request, result in zip(batch, results):
                if not request.future.done():
                    request.future.set_result(result)
        
        except Exception as e:
            # Set error for all requests
            for request in batch:
                if not request.future.done():
                    request.future.set_exception(e)
        
        finally:
            self.processing = False
