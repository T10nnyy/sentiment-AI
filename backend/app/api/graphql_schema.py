"""
GraphQL Schema and Resolvers
"""

import logging
from typing import List, Optional
import strawberry
from strawberry.fastapi import GraphQLRouter

from ..services.inference import inference_service
from ..core.models import model_manager

logger = logging.getLogger(__name__)

# GraphQL Types
@strawberry.type
class SentimentScores:
    positive: float
    negative: float

@strawberry.type
class SentimentResult:
    text: str
    sentiment: str
    confidence: float
    scores: SentimentScores

@strawberry.type
class ModelInfo:
    name: str
    framework: str
    device: str
    load_time: float
    quantized: bool
    parameters: int
    model_size_mb: float

@strawberry.input
class SentimentInput:
    text: str

@strawberry.input
class BatchSentimentInput:
    texts: List[str]

# Resolvers
@strawberry.type
class Query:
    @strawberry.field
    async def model_info(self) -> ModelInfo:
        """Get model information"""
        try:
            if not model_manager.is_loaded():
                raise Exception("Model not loaded")
            
            info = model_manager.get_model_info()
            return ModelInfo(
                name=info['name'],
                framework=info['framework'],
                device=info['device'],
                load_time=info['load_time'],
                quantized=info['quantized'],
                parameters=info['parameters'],
                model_size_mb=info['model_size_mb']
            )
        except Exception as e:
            logger.error(f"GraphQL model info failed: {str(e)}")
            raise

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def analyze_sentiment(self, input: SentimentInput) -> SentimentResult:
        """Analyze sentiment of a single text"""
        try:
            results = await inference_service.predict([input.text])
            result = results[0]
            
            return SentimentResult(
                text=result['text'],
                sentiment=result['sentiment'],
                confidence=result['confidence'],
                scores=SentimentScores(
                    positive=result['scores'].get('positive', 0),
                    negative=result['scores'].get('negative', 0)
                )
            )
        except Exception as e:
            logger.error(f"GraphQL sentiment analysis failed: {str(e)}")
            raise
    
    @strawberry.mutation
    async def analyze_batch_sentiment(self, input: BatchSentimentInput) -> List[SentimentResult]:
        """Analyze sentiment of multiple texts"""
        try:
            if len(input.texts) > 100:
                raise Exception("Batch size too large (max 100)")
            
            results = await inference_service.predict(input.texts)
            
            return [
                SentimentResult(
                    text=result['text'],
                    sentiment=result['sentiment'],
                    confidence=result['confidence'],
                    scores=SentimentScores(
                        positive=result['scores'].get('positive', 0),
                        negative=result['scores'].get('negative', 0)
                    )
                )
                for result in results
            ]
        except Exception as e:
            logger.error(f"GraphQL batch sentiment analysis failed: {str(e)}")
            raise

# Create schema
schema = strawberry.Schema(query=Query, mutation=Mutation)

# Create GraphQL app
graphql_app = GraphQLRouter(schema)
