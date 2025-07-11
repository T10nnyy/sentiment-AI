from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from transformers import pipeline
import uvicorn
from typing import List, Optional
import logging
import time
import pandas as pd
import io
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sentiment Analysis API",
    description="Advanced sentiment analysis using siebert/sentiment-roberta-large-english",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
sentiment_pipeline = None

class TextInput(BaseModel):
    text: str

class BatchTextInput(BaseModel):
    texts: List[str]

class SentimentResult(BaseModel):
    label: str
    score: float
    confidence: float
    processing_time: float

class BatchSentimentResult(BaseModel):
    results: List[SentimentResult]
    total_processing_time: float
    average_processing_time: float

class ModelInfo(BaseModel):
    name: str
    framework: str
    device: str
    quantized: bool
    version: str

class HealthStatus(BaseModel):
    status: str
    service: str
    model_loaded: bool
    timestamp: str

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    global sentiment_pipeline
    try:
        logger.info("Loading sentiment analysis model...")
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="siebert/sentiment-roberta-large-english",
            return_all_scores=True
        )
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

# Add favicon route to prevent 404 errors
@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(status_code=204, content={})

# Add root route
@app.get("/")
async def root():
    return {
        "message": "Sentiment Analysis API",
        "version": "1.0.0",
        "model": "siebert/sentiment-roberta-large-english",
        "endpoints": {
            "health": "/api/health",
            "model_info": "/api/model/info",
            "predict": "/api/predict",
            "batch_predict": "/api/predict/batch",
            "file_analyze": "/api/analyze/file"
        }
    }

@app.get("/api/health", response_model=HealthStatus)
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return HealthStatus(
        status="healthy" if sentiment_pipeline is not None else "unhealthy",
        service="sentiment-analysis-api",
        model_loaded=sentiment_pipeline is not None,
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/api/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get model information"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return ModelInfo(
        name="siebert/sentiment-roberta-large-english",
        framework="PyTorch/Transformers",
        device="CPU",
        quantized=False,
        version="1.0.0"
    )

@app.post("/api/predict", response_model=SentimentResult)
async def predict_sentiment(input_data: TextInput):
    """Analyze sentiment of a single text"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        start_time = time.time()
        
        # Get predictions for all labels
        results = sentiment_pipeline(input_data.text)
        
        # Find the highest scoring result
        best_result = max(results[0], key=lambda x: x['score'])
        
        processing_time = time.time() - start_time
        
        return SentimentResult(
            label=best_result['label'],
            score=best_result['score'],
            confidence=best_result['score'],
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/api/predict/batch", response_model=BatchSentimentResult)
async def predict_batch_sentiment(input_data: BatchTextInput):
    """Analyze sentiment of multiple texts"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(input_data.texts) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 texts allowed per batch")
    
    try:
        start_time = time.time()
        results = []
        
        for text in input_data.texts:
            text_start_time = time.time()
            predictions = sentiment_pipeline(text)
            best_result = max(predictions[0], key=lambda x: x['score'])
            text_processing_time = time.time() - text_start_time
            
            results.append(SentimentResult(
                label=best_result['label'],
                score=best_result['score'],
                confidence=best_result['score'],
                processing_time=text_processing_time
            ))
        
        total_time = time.time() - start_time
        avg_time = total_time / len(results) if results else 0
        
        return BatchSentimentResult(
            results=results,
            total_processing_time=total_time,
            average_processing_time=avg_time
        )
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.post("/api/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    """Analyze sentiment from uploaded file"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file type
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Only CSV and TXT files are supported")
    
    try:
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            # Parse CSV file
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            
            # Look for text column (case insensitive)
            text_column = None
            for col in df.columns:
                if col.lower() in ['text', 'content', 'message', 'review', 'comment']:
                    text_column = col
                    break
            
            if text_column is None:
                raise HTTPException(
                    status_code=400, 
                    detail="CSV file must contain a column named 'text', 'content', 'message', 'review', or 'comment'"
                )
            
            texts = df[text_column].dropna().astype(str).tolist()
            
        else:  # TXT file
            # Split by lines
            texts = [line.strip() for line in content.decode('utf-8').split('\n') if line.strip()]
        
        if len(texts) > 1000:
            raise HTTPException(status_code=400, detail="Maximum 1000 texts allowed per file")
        
        if not texts:
            raise HTTPException(status_code=400, detail="No valid texts found in file")
        
        # Process the texts
        batch_input = BatchTextInput(texts=texts)
        result = await predict_batch_sentiment(batch_input)
        return result
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Empty or invalid CSV file")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding not supported. Please use UTF-8")
    except Exception as e:
        logger.error(f"File processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
