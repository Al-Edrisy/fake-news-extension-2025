
# VeriNews – AI-Powered Fake News Detection

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![HuggingFace](https://img.shields.io/badge/Models-HuggingFace-yellow)
![Build](https://img.shields.io/github/actions/workflow/status/Al-Edrisy/fake-news-extension-2025/ci.yml?label=build)

VeriNews is a **multi-platform AI solution** for detecting and flagging misinformation in real-time.  
It includes:
- **Backend Fake News Checker** (Python + Flask + Hugging Face Transformers)
- **Web & PWA** (React + Vite + TailwindCSS)
- **Browser Extension & Desktop App** (Electron + Chrome Extension Manifest V3)

---

## 📑 Table of Contents
1. [Overview + Structure](#overview--structure)
2. [Frontend](#frontend)
   - [Requirements](#frontend-requirements)
   - [Setup](#frontend-setup)
   - [Features](#frontend-features)
3. [Backend](#backend)
   - [Requirements](#backend-requirements)
   - [Setup](#backend-setup)
   - [Endpoints](#backend-endpoints)
   - [Response Format](#backend-response-format)
   - [Features](#backend-features)
   - [Structure + Architecture](#backend-structure--architecture)

---

## 1. Overview + Structure

VeriNews is built as a **monorepo** with multiple apps and shared packages.

**Repository Structure:**
```

.
├── apps/
│   └── fake-news-cheeker/   # Backend API & AI model logic
├── fake-news-extension/     # Web, PWA, and Extension code
├── data/                    # Datasets & model files
├── packages/                # Shared utilities
├── docker-compose.yml       # Multi-service deployment
├── turbo.json               # Monorepo build config
└── render.yaml              # Deployment config

````

---

## 2. Frontend

### Frontend Requirements
- Node.js ≥ 18
- npm or bun
- Modern browser (for PWA support)

### Frontend Setup
```bash
cd fake-news-extension
npm install
npm run dev
````

To build the PWA:

```bash
npm run build
npm run pwa:copy
```

### Frontend Features

* Responsive UI with **shadcn/ui** & **Radix UI**
* Dark/Light mode support (`next-themes`)
* Offline PWA (Service Worker + Manifest)
* API integration with backend checker
* Probability-based results display
* Charts via **Recharts**

---

## 3. Backend

### Backend Requirements

* Python ≥ 3.9
* PostgreSQL
* Hugging Face account (if required for model download)

**Dependencies (`requirements.txt`):**

```txt
huggingface_hub==0.25.2
transformers>=4.40.0
pandas>=2.2.0
gradio>=4.29.0
sentencepiece
accelerate
scipy
numpy
flask
httpx[http2]==0.24.1
selectolax==0.3.12
beautifulsoup4==4.12.2
readability-lxml==0.8.1
python-dotenv==1.0.0
psycopg2-binary
requests
sqlalchemy
playwright
flask[reload]
langdetect
```

### Backend Setup

```bash
cd apps/fake-news-cheeker
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run --reload
```

**Environment variables (`.env`):**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/verinews
HF_TOKEN=your_huggingface_token
```

---

### Backend Endpoints

#### **1. Check News Content**

**POST** `/check`

```json
{
  "text": "Example news content..."
}
```

Response:

```json
{
  "label": "FAKE",
  "confidence": 0.92,
  "details": {
    "source": "AI Model XYZ",
    "timestamp": "2025-08-15T12:00:00Z"
  }
}
```

#### **2. Check URL**

**POST** `/check-url`

```json
{
  "url": "https://newswebsite.com/article"
}
```

Response:

```json
{
  "label": "REAL",
  "confidence": 0.88,
  "content_snippet": "Extracted article text..."
}
```

---

### Backend Response Format

* **label** → `"REAL"` or `"FAKE"`
* **confidence** → Float (0 to 1)
* **details** → Classification metadata
* **content\_snippet** → Optional, article preview

---

### Backend Features

* Hugging Face Transformer model integration
* Multi-language detection with `langdetect`
* Web scraping via Playwright, BeautifulSoup, Selectolax
* PostgreSQL result logging
* Docker-ready deployment

---

### Backend Structure + Architecture

```
apps/fake-news-cheeker/
├── main.py          # Flask entry point
├── models/          # Model loading & inference logic
├── utils/           # Helper functions (scraping, cleaning, etc.)
├── services/        # DB & external integrations
├── requirements.txt
├── tests/           # Unit tests
└── Dockerfile
```

**Flow:**

1. Client sends request → Backend receives input
2. Text cleaning → Language detection
3. AI model inference → Confidence calculation
4. Result stored in database
5. Response returned to client

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 📧 Contact

**Author:** Al-Edrisy
**GitHub:** [Al-Edrisy](https://github.com/Al-Edrisy)
**Website:** [verinews.space](https://verinews.space)

```
