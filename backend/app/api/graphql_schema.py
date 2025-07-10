"""
GraphQL schema for sentiment analysis
"""

import strawberry
from typing import List
import logging

from ..core.models import SentimentResult as SentimentResultModel, ModelInfo as ModelInfoModel
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
    device: str
    quantized: bool

@strawberry.type
class Query:
    @strawberry.field
    def predict(self, text: str) -> SentimentResult:
        """Predict sentiment for a single text"""
        try:
            result = inference_service.analyze_sentiment(text)
            return SentimentResult(label=result.label, score=result.score)
        except Exception as e:
            logger.error(f"GraphQL prediction failed: {str(e)}")
            raise Exception(f"Prediction failed: {str(e)}")
    
    @strawberry.field
    def batch_predict(self, texts: List[str]) -> List[SentimentResult]:
        """Predict sentiment for multiple texts"""
        try:
            results = inference_service.analyze_batch(texts)
            return [SentimentResult(label=r.label, score=r.score) for r in results]
        except Exception as e:
            logger.error(f"GraphQL batch prediction failed: {str(e)}")
            raise Exception(f"Batch prediction failed: {str(e)}")
    
    @strawberry.field
    def model_info(self) -> ModelInfo:
        """Get model information"""
        try:
            info = inference_service.get_model_info()
            return ModelInfo(
                name=info.name,
                framework=info.framework,
                device=info.device,
                quantized=info.quantized
            )
        except Exception as e:
            logger.error(f"GraphQL model info failed: {str(e)}")
            raise Exception(f"Failed to get model info: {str(e)}")

schema = strawberry.Schema(query=Query)
