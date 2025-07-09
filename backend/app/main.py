"""
FastAPI + GraphQL Application Entry Point
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
import uvicorn

from .core.config import settings
from .core.models import model_manager
from .services.inference import inference_service
from .utils.file_watcher import FileWatcher
from .api.rest import router as rest_router
from .api.graphql_schema import schema

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global file watcher
file_watcher = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    global file_watcher
    
    # Startup
    logger.info("Starting Sentiment Analysis Microservice...")
    
    # Load model
    success = await model_manager.load_model()
    if not success:
        logger.error("Failed to load model on startup")
        raise RuntimeError("Model loading failed")
    
    # Start inference service
    await inference_service.start()
    
    # Start file watcher for hot reload
    if settings.enable_hot_reload:
        file_watcher = FileWatcher(model_manager.reload_model)
        file_watcher.start()
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    
    # Stop inference service
    await inference_service.stop()
    
    # Stop file watcher
    if file_watcher:
        file_watcher.stop()
    
    logger.info("Application shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Sentiment Analysis Microservice",
    description="Production-ready sentiment analysis with REST and GraphQL APIs",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add REST routes
app.include_router(rest_router)

# Add GraphQL route
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# Metrics endpoint (basic implementation)
@app.get("/metrics")
async def metrics():
    """Prometheus-style metrics endpoint"""
    model_info = model_manager.get_model_info()
    return {
        "model_loaded": 1 if model_manager.model else 0,
        "model_load_time": model_info.get("load_time", 0),
        "framework": model_info.get("framework", "unknown"),
        "device": model_info.get("device", "unknown"),
        "quantized": 1 if model_info.get("quantized", False) else 0
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
