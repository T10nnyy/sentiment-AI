"""
Inference Service with Async Support
"""

import asyncio
import logging
from typing import Dict, List, Union
from ..core.models import model_manager
from ..core.batch_processor import BatchProcessor

logger = logging.getLogger(__name__)

class InferenceService:
    """Handles inference requests with batching support"""
    
    def __init__(self):
        self.batch_processor = BatchProcessor(self._batch_predict)
    
    async def start(self):
        """Start the inference service"""
        await self.batch_processor.start()
    
    async def stop(self):
        """Stop the inference service"""
        await self.batch_processor.stop()
    
    async def predict_single(self, text: str, use_batch: bool = False) -> Dict[str, Union[str, float]]:
        """Predict sentiment for a single text"""
        if use_batch:
            return await self.batch_processor.add_request(text)
        else:
            return await model_manager.predict_single(text)
    
    async def predict_batch(self, texts: List[str]) -> List[Dict[str, Union[str, float]]]:
        """Predict sentiment for multiple texts"""
        return await model_manager.predict_batch(texts)
    
    async def _batch_predict(self, texts: List[str]) -> List[Dict[str, Union[str, float]]]:
        """Internal batch prediction method"""
        return await model_manager.predict_batch(texts)
    
    def get_model_info(self) -> Dict:
        """Get current model information"""
        return model_manager.get_model_info()

# Global inference service
inference_service = InferenceService()
