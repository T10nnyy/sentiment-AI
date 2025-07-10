"""
REST API endpoints for sentiment analysis
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from typing import List
import logging
import json
import csv
import io

from ..core.models import (
    SentimentRequest, 
    BatchSentimentRequest, 
    SentimentResult, 
    BatchSentimentResult,
    ModelInfo,
    HealthStatus
)
from ..services.inference import inference_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict", response_model=SentimentResult)
async def predict_sentiment(request: SentimentRequest):
    """Analyze sentiment of a single text"""
    try:
        logger.info(f"Analyzing text: {request.text[:50]}...")
        result = inference_service.analyze_sentiment(request.text)
        logger.info(f"Analysis result: {result.label} ({result.score})")
        return result
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/batch", response_model=BatchSentimentResult)
async def predict_batch_sentiment(request: BatchSentimentRequest):
    """Analyze sentiment of multiple texts"""
    try:
        logger.info(f"Analyzing batch of {len(request.texts)} texts")
        
        import time
        start_time = time.time()
        
        results = inference_service.analyze_batch(request.texts)
        
        total_time = time.time() - start_time
        avg_time = total_time / len(results) if results else 0
        
        logger.info(f"Batch analysis completed in {total_time:.2f}s")
        
        return BatchSentimentResult(
            results=results,
            total_processing_time=total_time,
            average_processing_time=avg_time
        )
    except Exception as e:
        logger.error(f"Batch prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get model information"""
    try:
        return inference_service.get_model_info()
    except Exception as e:
        logger.error(f"Failed to get model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", response_model=HealthStatus)
async def health_check():
    """Health check endpoint"""
    try:
        return inference_service.get_health_status()
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Service unhealthy")
