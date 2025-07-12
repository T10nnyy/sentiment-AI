# Multi-stage optimized Dockerfile for CPU deployment
FROM python:3.11-slim as builder

# Install system dependencies with retry logic and better error handling
RUN for i in 1 2 3; do \
        apt-get update && \
        apt-get install -y --fix-missing --no-install-recommends \
            build-essential \
            curl \
            wget \
            git \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/* \
        && break || sleep 5; \
    done

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with retry logic
RUN for i in 1 2 3; do \
        pip install --no-cache-dir --user --upgrade pip && \
        pip install --no-cache-dir --user -r requirements.txt \
        && break || (echo "Attempt $i failed, retrying..." && sleep 10); \
    done

# Create Python script for model download
RUN echo '#!/usr/bin/env python3\n\
import os\n\
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"\n\
os.environ["TRANSFORMERS_OFFLINE"] = "0"\n\
from transformers import pipeline\n\
import time\n\
import sys\n\
\n\
def download_model_with_retry(model_name, max_retries=3):\n\
    for attempt in range(max_retries):\n\
        try:\n\
            print(f"Downloading model {model_name}, attempt {attempt + 1}...")\n\
            pipeline("sentiment-analysis", model=model_name, return_all_scores=True)\n\
            print(f"Successfully downloaded {model_name}")\n\
            return True\n\
        except Exception as e:\n\
            print(f"Attempt {attempt + 1} failed: {e}")\n\
            if attempt < max_retries - 1:\n\
                time.sleep(10)\n\
            else:\n\
                print("All attempts failed, trying fallback model...")\n\
                try:\n\
                    pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")\n\
                    print("Fallback model downloaded successfully")\n\
                    return True\n\
                except Exception as fallback_error:\n\
                    print(f"Fallback model also failed: {fallback_error}")\n\
                    return False\n\
    return False\n\
\n\
if not download_model_with_retry("cardiffnlp/twitter-roberta-base-sentiment-latest"):\n\
    print("Model download failed, but continuing build...")\n\
    sys.exit(0)\n\
' > /tmp/download_model.py && python /tmp/download_model.py && rm /tmp/download_model.py

# Runtime stage
FROM python:3.11-slim as runtime

# Install runtime dependencies with retry logic
RUN for i in 1 2 3; do \
        apt-get update && \
        apt-get install -y --fix-missing --no-install-recommends \
            curl \
            wget \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/* \
        && break || sleep 5; \
    done

# Create non-root user
RUN useradd --create-home --shell /bin/bash --uid 1000 app

# Set working directory
WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /home/app/.local
COPY --from=builder /root/.cache /home/app/.cache

# Copy application code
COPY --chown=app:app . .

# Switch to non-root user
USER app

# Add local packages to PATH
ENV PATH=/home/app/.local/bin:$PATH
ENV HF_HOME=/home/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/home/app/.cache/huggingface/transformers
ENV HF_HUB_CACHE=/home/app/.cache/huggingface/hub

# Expose port
EXPOSE 8000

# Health check with longer timeout for model loading
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run application with retry logic
CMD ["sh", "-c", "for i in 1 2 3; do python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 && break || sleep 10; done"]