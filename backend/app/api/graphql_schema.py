"""
GraphQL Schema using Strawberry
"""

import strawberry
from typing import List
import logging
from ..services.inference import inference_service

logger = logging.getLogger(__name__)

@strawberry.type
class SentimentResult:
    label: str
    score: float

@strawberry.type
class ModelInfo:
    name: str
    framework: str
    quantized: bool
    device: str

@strawberry.type
class Query:
    @strawberry.field
    async def predict(self, text: str) -> SentimentResult:
        """Predict sentiment for a single text"""
        try:
            result = await inference_service.predict_single(text)
            return SentimentResult(
                label=result["label"],
                score=result["score"]
            )
        except Exception as e:
            logger.error(f"GraphQL prediction failed: {str(e)}")
            raise
    
    @strawberry.field
    async def batch_predict(self, texts: List[str]) -> List[SentimentResult]:
        """Predict sentiment for multiple texts"""
        try:
            results = await inference_service.predict_batch(texts)
            return [
                SentimentResult(label=result["label"], score=result["score"])
                for result in results
            ]
        except Exception as e:
            logger.error(f"GraphQL batch prediction failed: {str(e)}")
            raise
    
    @strawberry.field
    async def model_info(self) -> ModelInfo:
        """Get current model information"""
        try:
            info = inference_service.get_model_info()
            return ModelInfo(
                name=info.get("name", "unknown"),
                framework=info.get("framework", "unknown"),
                quantized=info.get("quantized", False),
                device=info.get("device", "cpu")
            )
        except Exception as e:
            logger.error(f"GraphQL model info failed: {str(e)}")
            raise

schema = strawberry.Schema(query=Query)
