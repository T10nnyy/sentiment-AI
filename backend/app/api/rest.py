"""
REST API Endpoints
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
import csv
import io

from ..services.inference import inference_service
from ..core.models import model_manager

logger = logging.getLogger(__name__)

router = APIRouter()

# Request/Response Models
class SentimentRequest(BaseModel):
    text: str = Field(..., description="Text to analyze")

class BatchSentimentRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to analyze")

class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float
    scores: dict

class BatchSentimentResponse(BaseModel):
    results: List[SentimentResponse]

class ModelInfoResponse(BaseModel):
    name: str
    framework: str
    device: str
    load_time: float
    quantized: bool
    parameters: int
    model_size_mb: float

# Endpoints
@router.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of a single text"""
    try:
        results = await inference_service.predict([request.text])
        result = results[0]
        
        return SentimentResponse(
            text=result['text'],
            sentiment=result['sentiment'],
            confidence=result['confidence'],
            scores=result['scores']
        )
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/batch", response_model=BatchSentimentResponse)
async def analyze_batch_sentiment(request: BatchSentimentRequest):
    """Analyze sentiment of multiple texts"""
    try:
        if len(request.texts) > 100:  # Limit batch size
            raise HTTPException(status_code=400, detail="Batch size too large (max 100)")
        
        results = await inference_service.predict(request.texts)
        
        response_results = [
            SentimentResponse(
                text=result['text'],
                sentiment=result['sentiment'],
                confidence=result['confidence'],
                scores=result['scores']
            )
            for result in results
        ]
        
        return BatchSentimentResponse(results=response_results)
    except Exception as e:
        logger.error(f"Batch sentiment analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    """Analyze sentiment of texts from uploaded file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        # Read CSV file
        content = await file.read()
        csv_content = content.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        texts = []
        
        # Look for common text column names
        fieldnames = csv_reader.fieldnames
        text_column = None
        
        for field in ['text', 'content', 'message', 'review', 'comment']:
            if field in fieldnames:
                text_column = field
                break
        
        if not text_column:
            text_column = fieldnames[0]  # Use first column as fallback
        
        for row in csv_reader:
            if text_column in row and row[text_column].strip():
                texts.append(row[text_column].strip())
        
        if not texts:
            raise HTTPException(status_code=400, detail="No valid texts found in file")
        
        if len(texts) > 1000:  # Limit file processing
            raise HTTPException(status_code=400, detail="File too large (max 1000 rows)")
        
        # Analyze texts
        results = await inference_service.predict(texts)
        
        # Prepare CSV response
        output = io.StringIO()
        fieldnames = ['text', 'sentiment', 'confidence', 'positive_score', 'negative_score']
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for result in results:
            writer.writerow({
                'text': result['text'],
                'sentiment': result['sentiment'],
                'confidence': result['confidence'],
                'positive_score': result['scores'].get('positive', 0),
                'negative_score': result['scores'].get('negative', 0)
            })
        
        return {
            "message": f"Analyzed {len(results)} texts",
            "csv_data": output.getvalue(),
            "results": [
                {
                    "text": result['text'],
                    "sentiment": result['sentiment'],
                    "confidence": result['confidence'],
                    "scores": result['scores']
                }
                for result in results
            ]
        }
        
    except Exception as e:
        logger.error(f"File analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    """Get information about the loaded model"""
    try:
        if not model_manager.is_loaded():
            raise HTTPException(status_code=503, detail="Model not loaded")
        
        info = model_manager.get_model_info()
        return ModelInfoResponse(**info)
    except Exception as e:
        logger.error(f"Failed to get model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/model/reload")
async def reload_model():
    """Reload the model"""
    try:
        await model_manager.reload_model()
        return {"message": "Model reloaded successfully"}
    except Exception as e:
        logger.error(f"Model reload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
