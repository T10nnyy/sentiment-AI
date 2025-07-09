"""
API Tests for REST and GraphQL endpoints
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestRESTAPI:
    """Test REST API endpoints"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_predict_single(self):
        """Test single prediction endpoint"""
        response = client.post(
            "/api/predict",
            json={"text": "I love this product!", "batch": False}
        )
        assert response.status_code == 200
        data = response.json()
        assert "label" in data
        assert "score" in data
        assert data["label"] in ["positive", "negative"]
        assert 0 <= data["score"] <= 1
    
    def test_predict_batch(self):
        """Test batch prediction endpoint"""
        response = client.post(
            "/api/predict/batch",
            json={"texts": ["Great product!", "Terrible experience"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) == 2
        
        for result in data["results"]:
            assert "label" in result
            assert "score" in result
            assert result["label"] in ["positive", "negative"]
            assert 0 <= result["score"] <= 1
    
    def test_model_info(self):
        """Test model info endpoint"""
        response = client.get("/api/model/info")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "framework" in data
        assert "quantized" in data
        assert "device" in data

class TestGraphQLAPI:
    """Test GraphQL API endpoints"""
    
    def test_predict_query(self):
        """Test GraphQL predict query"""
        query = """
        query {
            predict(text: "I love this product!") {
                label
                score
            }
        }
        """
        response = client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "predict" in data["data"]
        
        result = data["data"]["predict"]
        assert "label" in result
        assert "score" in result
        assert result["label"] in ["positive", "negative"]
        assert 0 <= result["score"] <= 1
    
    def test_batch_predict_query(self):
        """Test GraphQL batch predict query"""
        query = """
        query {
            batchPredict(texts: ["Great product!", "Terrible experience"]) {
                label
                score
            }
        }
        """
        response = client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "batchPredict" in data["data"]
        
        results = data["data"]["batchPredict"]
        assert len(results) == 2
        
        for result in results:
            assert "label" in result
            assert "score" in result
            assert result["label"] in ["positive", "negative"]
            assert 0 <= result["score"] <= 1
    
    def test_model_info_query(self):
        """Test GraphQL model info query"""
        query = """
        query {
            modelInfo {
                name
                framework
                quantized
                device
            }
        }
        """
        response = client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "modelInfo" in data["data"]
        
        info = data["data"]["modelInfo"]
        assert "name" in info
        assert "framework" in info
        assert "quantized" in info
        assert "device" in info
