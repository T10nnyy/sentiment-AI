"""
REST API Endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
from ..services.inference import inference_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["sentiment"])

# Request/Response Models
class PredictRequest(BaseModel):
    text: str = Field(..., description="Text to analyze")
    batch: bool = Field(default=False, description="Use batch processing")

class BatchPredictRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to analyze")

class SentimentResult(BaseModel):
    label: str = Field(..., description="Sentiment label (positive/negative)")
    score: float = Field(..., description="Confidence score")

class BatchPredictResponse(BaseModel):
    results: List[SentimentResult]

class ModelInfo(BaseModel):
    name: str
    framework: str
    quantized: bool
    device: str

@router.post("/predict", response_model=SentimentResult)
async def predict(request: PredictRequest):
    """Predict sentiment for a single text"""
    try:
        result = await inference_service.predict_single(
            request.text, 
            use_batch=request.batch
        )
        return SentimentResult(**result)
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/batch", response_model=BatchPredictResponse)
async def predict_batch(request: BatchPredictRequest):
    """Predict sentiment for multiple texts"""
    try:
        results = await inference_service.predict_batch(request.texts)
        return BatchPredictResponse(
            results=[SentimentResult(**result) for result in results]
        )
    except Exception as e:
        logger.error(f"Batch prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get current model information"""
    try:
        info = inference_service.get_model_info()
        return ModelInfo(**info)
    except Exception as e:
        logger.error(f"Failed to get model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "sentiment-analysis"}
