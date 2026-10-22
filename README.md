# Enterprise Web Scraping & Automation Pipeline

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Async-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)

An enterprise-grade, asynchronous web scraping and browser automation system engineered for high-concurrency data extraction, Cloudflare Turnstile handling, dynamic residential proxy rotation, and session persistence.

Developed by **Sandeep Kaur**.

---

## 🚀 Key Architectural Features

- **🛡️ Anti-Bot & Cloudflare Handling**: Utilizes Playwright stealth arguments (`--disable-blink-features=AutomationControlled`), `navigator.webdriver` masking, realistic Chrome runtime injection, and automated Turnstile challenge detection to clear protected targets with HTTP 200.
- **⚡ Bounded Concurrency (`asyncio.Semaphore`)**: Manages multi-worker parallel execution, preventing memory leaks and avoiding aggressive target rate limits.
- **🔄 Residential Proxy Rotation**: Automatically rotates assigned proxy nodes across concurrent tasks to distribute IP footprint.
- **🍪 Session State Persistence (`storage_state`)**: Caches and reuses authentication cookies (`cf_clearance`, session tokens) across subsequent runs, cutting second-run latency by over 75%.
- **⏱️ Exponential Backoff Retries**: Handles transient timeouts and 429/503 status codes with randomized jitter (`2^attempt + random()`).
- **📊 Business Deliverables**: Delivers strongly-typed structured JSON for API/database ingestion and automated one-click CSV export for spreadsheet analytics.
- **💻 Full-Stack Architecture**: Asynchronous FastAPI backend connected to an interactive React dashboard with real-time telemetry.

---

## 🏗️ System Architecture

```text
React Dashboard (Vite)  ──>  FastAPI API (/api/run, /api/jobs/{id})
                                      │
                               Async Job Queue
                                      │
                         Bounded Semaphore Concurrency
                                      │
                          Playwright Browser Contexts
                                      │
                         Stealth + Turnstile Resolver
                                      │
                         Structured JSON & CSV Results
```

---

## 📁 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application & REST endpoints
│   │   └── scraper.py       # Playwright async scraper, stealth & proxy engine
│   ├── storage/             # Session state & cookie caching (git-ignored)
│   ├── run_demo.py          # Standalone terminal demo script
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Interactive React dashboard
│   │   ├── main.jsx         # Vite entry point
│   │   └── style.css        # Responsive styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── setup_backend_windows.bat
├── start_backend_windows.bat
├── start_frontend_windows.bat
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.11+
- Node.js 18+

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🛠️ API Reference

- `GET /api/health` — Health check and active engine features.
- `POST /api/run` — Dispatches asynchronous batch scraping jobs.
  ```json
  {
    "urls": ["https://nowsecure.nl"],
    "concurrency": 2,
    "session_management": true,
    "proxy_rotation": true
  }
  ```
- `GET /api/jobs/{job_id}` — Polls job execution telemetry and structured results.

---

## 📄 License
This project is licensed under the MIT License.
