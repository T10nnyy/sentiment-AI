

# 💬 Sentiment Analysis Microservice

A **production-ready** sentiment analysis application with **dual API support** (REST + GraphQL), leveraging a **RoBERTa-based transformer** model for high-accuracy text classification.

---

## 🚀 Tech Stack

### 🔧 Backend

* **FastAPI** – Modern Python web framework
* **Strawberry GraphQL** – GraphQL implementation for Python
* **Transformers** – Hugging Face's state-of-the-art NLP library
* **PyTorch** – Deep learning framework
* **Pydantic** – Data validation
* **Uvicorn** – Lightning-fast ASGI server

### 🎨 Frontend

* **Next.js 14** – Full-stack React framework (App Router)
* **TypeScript** – Type-safe JavaScript
* **Apollo Client** – GraphQL data management
* **Axios** – REST API requests
* **Tailwind CSS** – Utility-first CSS framework
* **Shadcn/ui** – Beautiful UI components
* **Zustand** – Global state management

### 🛠 Infrastructure

* **Docker** – Containerization
* **Docker Compose** – Multi-service orchestration
* **Redis** – Optional caching layer
* **GitHub Actions** – CI/CD pipelines

### 🤖 AI Models

* `cardiffnlp/twitter-roberta-base-sentiment-latest` – Robust RoBERTa model (125M parameters)
* **Fallback**: `distilbert-base-uncased-finetuned-sst-2-english`

---

## 📁 Project Structure

```
sentiment-backend/
├── backend/
│   ├── app/
│   │   ├── api/                # REST & GraphQL routes
│   │   ├── core/               # Configs & Pydantic models
│   │   ├── services/           # Model inference logic
│   │   ├── utils/              # Utility functions
│   │   └── main.py             # App entrypoint
│   ├── tests/                  # Unit tests
│   ├── scripts/                # Model loading scripts
│   ├── Dockerfile(.gpu)       # Docker support
│   ├── docker-compose.yml     # Service orchestrator
│   └── requirements.txt
├── frontend/                  # Next.js Pages Router (legacy)
│   ├── components/
│   ├── pages/
│   └── package.json
├── app/                       # Next.js App Router (main UI)
├── components/                # Shared UI components
├── lib/                       # API utilities
├── hooks/                     # Custom hooks
└── package.json
```

---

## 🛠️ Setup Instructions

### 📋 Prerequisites

* **Python 3.11+**
* **Node.js 18+**
* **Docker + Docker Compose**
* **Git**

---

### 🔌 1. Clone the Repository

```bash
git clone https://github.com/T10nnyy/sentiment-AI.git
cd sentiment-backend
```

---

### 🧠 2. Backend Setup

#### ⚙️ Option A: Local Development

```bash
cd backend/
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Fill in your .env configs

uvicorn app.main:app --reload --port 8000
```

#### 🐳 Option B: Docker (Recommended)

```bash
cd backend/

# CPU version
docker-compose up backend

# GPU version (if supported)
docker-compose --profile gpu up backend-gpu
```

---

### 🌐 3. Frontend Setup

#### 📁 App Router (Next.js 14)

```bash
npm install

cp .env.local.example .env.local
# Update:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql

npm run dev
```

#### 🧾 Pages Router (Legacy)

```bash
cd frontend/
npm install
npm run dev
```

---

## 🌐 API Endpoints

### 📮 REST API

| Endpoint                  | Description              |
| ------------------------- | ------------------------ |
| `GET /`                   | API info                 |
| `POST /api/predict`       | Single text sentiment    |
| `POST /api/predict/batch` | Batch sentiment analysis |
| `GET /api/model/info`     | Model metadata           |
| `GET /api/health`         | Health check             |
| `POST /api/model/reload`  | Reload model (debug)     |

#### 🔍 Example REST Call

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'
```

---

### 📦 GraphQL API

**Endpoint**: `POST /graphql`

#### 📘 Example Queries

```graphql
query {
  predict(text: "I love this product!") {
    label
    score
  }
}

query {
  batchPredict(texts: ["Great!", "Awful!"]) {
    label
    score
  }
}
```

---

## ✅ Features

* 🔁 Realtime batch and single prediction
* 🧠 High-accuracy RoBERTa transformer
* 🪝 REST + GraphQL support
* 🧪 CI/CD with GitHub Actions
* 📦 Containerized & scalable

---

## 📽️ Demonstration

👉 **[Watch the Live Demo on Loom](https://www.loom.com/share/62a2122ba65f4658a1045d04557ed87c?sid=97b761ba-49c2-4c5c-88f5-8878d70bb5ce)**

---

