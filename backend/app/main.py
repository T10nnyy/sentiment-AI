from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import logging
import uvicorn
from datetime import datetime
import csv
import io
from transformers import pipeline
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sentiment Analysis API",
    description="Advanced sentiment analysis using cardiffnlp/twitter-roberta-base-sentiment-latest",
    version="1.0.0"
)

# CORS middleware - Updated for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://your-sentiment-app.vercel.app",  # Replace with your actual domain
        "*"  # For development - remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model
sentiment_pipeline = None
model_info = {
    "name": "cardiffnlp/twitter-roberta-base-sentiment-latest",
    "framework": "transformers",
    "device": "cpu",
    "quantized": False,
    "version": "1.0.0"
}

# Pydantic models
class TextInput(BaseModel):
    text: str

class BatchTextInput(BaseModel):
    texts: List[str]

class SentimentResult(BaseModel):
    text: str
    sentiment: dict
    confidence: float
    processing_time: float
    scores: Optional[dict] = None

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

def load_model():
    """Load the sentiment analysis model - optimized for Vercel"""
    global sentiment_pipeline, model_info
    
    try:
        logger.info("Loading sentiment analysis model...")
        
        # Use smaller, faster model for Vercel deployment
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            device=-1,  # Force CPU for Vercel
            return_all_scores=True
        )
        
        model_info["device"] = "cpu"
        logger.info("Model loaded successfully on CPU")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        return False

def analyze_sentiment_text(text: str) -> SentimentResult:
    """Analyze sentiment of a single text"""
    if not sentiment_pipeline:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    start_time = time.time()
    
    try:
        # Get predictions
        results = sentiment_pipeline(text)
        processing_time = time.time() - start_time
        
        # Extract the highest confidence prediction
        best_result = max(results[0], key=lambda x: x['score'])
        
        # Create scores dictionary
        scores = {result['label'].lower(): result['score'] for result in results[0]}
        
        return SentimentResult(
            text=text,
            sentiment={
                "label": best_result['label'],
                "score": best_result['score']
            },
            confidence=best_result['score'],
            processing_time=processing_time,
            scores=scores
        )
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    success = load_model()
    if not success:
        logger.warning("Failed to load model on startup")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sentiment Analysis API",
        "model": model_info["name"],
        "status": "running",
        "deployment": "vercel"
    }

@app.get("/favicon.ico")
async def favicon():
    """Favicon endpoint to prevent 404 errors"""
    return {"message": "No favicon"}

@app.post("/predict", response_model=SentimentResult)
async def predict_sentiment(input_data: TextInput):
    """Analyze sentiment of a single text - Vercel optimized route"""
    if not input_data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    return analyze_sentiment_text(input_data.text)

@app.post("/api/predict", response_model=SentimentResult)
async def predict_sentiment_api(input_data: TextInput):
    """Analyze sentiment of a single text - API route"""
    return await predict_sentiment(input_data)

@app.post("/predict/batch", response_model=BatchSentimentResult)
async def predict_batch_sentiment(input_data: BatchTextInput):
    """Analyze sentiment of multiple texts - Vercel optimized"""
    if not input_data.texts:
        raise HTTPException(status_code=400, detail="Texts list cannot be empty")
    
    # Limit batch size for Vercel
    if len(input_data.texts) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 texts allowed for Vercel deployment")
    
    start_time = time.time()
    results = []
    
    for text in input_data.texts:
        if text.strip():  # Skip empty texts
            result = analyze_sentiment_text(text)
            results.append(result)
    
    total_time = time.time() - start_time
    avg_time = total_time / len(results) if results else 0
    
    return BatchSentimentResult(
        results=results,
        total_processing_time=total_time,
        average_processing_time=avg_time
    )

@app.post("/api/predict/batch", response_model=BatchSentimentResult)
async def predict_batch_sentiment_api(input_data: BatchTextInput):
    """Analyze sentiment of multiple texts - API route"""
    return await predict_batch_sentiment(input_data)

@app.post("/analyze/file", response_model=BatchSentimentResult)
async def analyze_file(file: UploadFile = File(...)):
    """Analyze sentiment from uploaded file - Vercel optimized"""
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Only CSV and TXT files are supported")
    
    try:
        content = await file.read()
        text_content = content.decode('utf-8')
        
        texts = []
        
        if file.filename.endswith('.csv'):
            # Parse CSV file
            csv_reader = csv.DictReader(io.StringIO(text_content))
            for row in csv_reader:
                # Look for common text column names
                text_col = None
                for col in ['text', 'Text', 'TEXT', 'content', 'Content', 'message', 'Message']:
                    if col in row:
                        text_col = col
                        break
                
                if text_col and row[text_col].strip():
                    texts.append(row[text_col].strip())
        else:
            # Parse TXT file (one text per line)
            texts = [line.strip() for line in text_content.split('\n') if line.strip()]
        
        if not texts:
            raise HTTPException(status_code=400, detail="No valid texts found in file")
        
        # Limit for Vercel deployment
        if len(texts) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 texts allowed for Vercel deployment")
        
        # Analyze all texts
        start_time = time.time()
        results = []
        
        for text in texts:
            result = analyze_sentiment_text(text)
            results.append(result)
        
        total_time = time.time() - start_time
        avg_time = total_time / len(results) if results else 0
        
        return BatchSentimentResult(
            results=results,
            total_processing_time=total_time,
            average_processing_time=avg_time
        )
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

@app.post("/api/analyze/file", response_model=BatchSentimentResult)
async def analyze_file_api(file: UploadFile = File(...)):
    """Analyze sentiment from uploaded file - API route"""
    return await analyze_file(file)

@app.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    """Get model information - Vercel optimized"""
    return ModelInfo(**model_info)

@app.get("/api/model/info", response_model=ModelInfo)
async def get_model_info_api():
    """Get model information - API route"""
    return await get_model_info()

@app.get("/health", response_model=HealthStatus)
async def health_check():
    """Health check endpoint - Vercel optimized"""
    return HealthStatus(
        status="healthy" if sentiment_pipeline else "unhealthy",
        service="sentiment-analysis-api",
        model_loaded=sentiment_pipeline is not None,
        timestamp=datetime.now().isoformat()
    )

@app.get("/api/health", response_model=HealthStatus)
async def health_check_api():
    """Health check endpoint - API route"""
    return await health_check()

# GraphQL endpoint placeholder (simplified for Vercel)
@app.post("/graphql")
async def graphql_endpoint(request: dict):
    """Simple GraphQL endpoint for basic queries"""
    query = request.get("query", "")
    variables = request.get("variables", {})
    
    if "predict" in query and "text" in variables:
        result = analyze_sentiment_text(variables["text"])
        return {
            "data": {
                "predict": {
                    "label": result.sentiment["label"],
                    "score": result.sentiment["score"]
                }
            }
        }
    elif "modelInfo" in query:
        return {
            "data": {
                "modelInfo": model_info
            }
        }
    else:
        return {"errors": [{"message": "Query not supported"}]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
