"""
Tests for model management functionality
"""

import pytest
import asyncio
from app.core.models import ModelManager

class TestModelManager:
    """Test model management functionality"""
    
    @pytest.fixture
    async def model_manager(self):
        """Create model manager instance"""
        manager = ModelManager()
        await manager.load_model()
        return manager
    
    @pytest.mark.asyncio
    async def test_model_loading(self):
        """Test model loading"""
        manager = ModelManager()
        success = await manager.load_model()
        assert success is True
        assert manager.model is not None
        assert manager.tokenizer is not None
        assert manager.pipeline is not None
    
    @pytest.mark.asyncio
    async def test_single_prediction(self, model_manager):
        """Test single text prediction"""
        result = await model_manager.predict_single("I love this product!")
        assert "label" in result
        assert "score" in result
        assert result["label"] in ["positive", "negative"]
        assert 0 <= result["score"] <= 1
    
    @pytest.mark.asyncio
    async def test_batch_prediction(self, model_manager):
        """Test batch prediction"""
        texts = ["Great product!", "Terrible experience", "It's okay"]
        results = await model_manager.predict_batch(texts)
        
        assert len(results) == len(texts)
        for result in results:
            assert "label" in result
            assert "score" in result
            assert result["label"] in ["positive", "negative"]
            assert 0 <= result["score"] <= 1
    
    def test_model_info(self, model_manager):
        """Test model info retrieval"""
        info = model_manager.get_model_info()
        assert "name" in info
        assert "framework" in info
        assert "quantized" in info
        assert "device" in info
