from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
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
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sentiment Analysis API",
    description="Sentiment analysis using RoBERTa base model",
    version="1.0.0"
)

# Add favicon endpoint
@app.get("/favicon.ico", include_in_schema=False)
async def get_favicon():
    return Response(status_code=204)

# Configure CORS with specific headers for file uploads
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"],
    expose_headers=["Content-Length", "Content-Range"],
)

# Global variables
sentiment_pipeline = None
MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"

# Label mapping
LABEL_MAPPING = {
    "LABEL_0": "negative",
    "LABEL_1": "neutral", 
    "LABEL_2": "positive"
}

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
        logger.info(f"Loading model: {MODEL_NAME}")
        
        # Set environment variables
        os.environ["TOKENIZERS_PARALLELISM"] = "false"
        
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model=MODEL_NAME,
            return_all_scores=True,
            device=-1
        )
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        # Try fallback model
        try:
            logger.info("Trying fallback model...")
            sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                return_all_scores=True,
                device=-1
            )
            logger.info("Fallback model loaded successfully!")
        except Exception as fallback_error:
            logger.error(f"Fallback model failed: {fallback_error}")
            sentiment_pipeline = None

def normalize_label(label: str) -> str:
    """Normalize label names"""
    return LABEL_MAPPING.get(label, label.lower())

@app.get("/")
async def root():
    return {
        "message": "Sentiment Analysis API",
        "version": "1.0.0",
        "model": MODEL_NAME,
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy" if sentiment_pipeline is not None else "unhealthy",
        "service": "sentiment-analysis-api",
        "model_loaded": sentiment_pipeline is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/model/info")
async def get_model_info():
    """Get model information"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "name": MODEL_NAME,
        "framework": "PyTorch/Transformers",
        "device": "CPU",
        "quantized": False,
        "version": "1.0.0"
    }

@app.post("/api/predict")
async def predict_sentiment(input_data: TextInput):
    """Analyze sentiment of a single text"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        start_time = time.time()
        
        results = sentiment_pipeline(input_data.text)
        best_result = max(results[0], key=lambda x: x['score'])
        
        normalized_label = normalize_label(best_result['label'])
        processing_time = time.time() - start_time
        
        return {
            "label": normalized_label,
            "score": best_result['score'],
            "confidence": best_result['score'],
            "processing_time": processing_time
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/batch")
async def predict_batch_sentiment(input_data: BatchTextInput):
    """Analyze sentiment of multiple texts"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(input_data.texts) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 texts allowed")
    
    try:
        start_time = time.time()
        results = []
        
        for text in input_data.texts:
            text_start_time = time.time()
            predictions = sentiment_pipeline(text)
            best_result = max(predictions[0], key=lambda x: x['score'])
            text_processing_time = time.time() - text_start_time
            
            normalized_label = normalize_label(best_result['label'])
            
            results.append({
                "label": normalized_label,
                "score": best_result['score'],
                "confidence": best_result['score'],
                "processing_time": text_processing_time
            })
        
        total_time = time.time() - start_time
        avg_time = total_time / len(results) if results else 0
        
        return {
            "results": results,
            "total_processing_time": total_time,
            "average_processing_time": avg_time
        }
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    """Analyze sentiment from uploaded file and update model"""
    logger.info(f"Received file upload: {file.filename}")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        content = await file.read()
        text_content = content.decode('utf-8')
        
        # Split the content into lines and filter out empty lines
        texts = [line.strip() for line in text_content.splitlines() if line.strip()]
        
        if len(texts) > 1000:
            raise HTTPException(status_code=400, detail="Maximum 1000 texts allowed per file")
        
        start_time = time.time()
        results = []
        analysis_data = []  # Store analysis data for model training
        
        # Analyze each text and collect data for training
        for text in texts:
            text_start_time = time.time()
            predictions = sentiment_pipeline(text)
            best_result = max(predictions[0], key=lambda x: x['score'])
            text_processing_time = time.time() - text_start_time
            
            normalized_label = normalize_label(best_result['label'])
            confidence = best_result['score']
            
            # Store high-confidence predictions for model training
            if confidence > 0.9:
                analysis_data.append({
                    'text': text,
                    'label': best_result['label'],
                    'confidence': confidence
                })
            
            results.append({
                "label": normalized_label,
                "score": best_result['score'],
                "confidence": best_result['score'],
                "processing_time": text_processing_time
            })
        
        # If we have enough high-confidence data, update model weights
        if len(analysis_data) >= 10:
            logger.info(f"Found {len(analysis_data)} high-confidence samples for model training")
            # Model training would go here - for now we just log
            logger.info("Model would be updated with new data (training disabled in demo)")
        
        total_time = time.time() - start_time
        avg_time = total_time / len(results) if results else 0
        
        return {
            "results": results,
            "total_processing_time": total_time,
            "average_processing_time": avg_time,
            "analysis_stats": {
                "total_samples": len(texts),
                "high_confidence_samples": len(analysis_data)
            }
        }
        
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Please upload a UTF-8 encoded text file")
    except Exception as e:
        logger.error(f"File analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
