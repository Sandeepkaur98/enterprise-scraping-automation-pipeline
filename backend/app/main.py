import sys
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / '.env')
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from .scraper import run_batch

app = FastAPI(title="Enterprise Scraping & Automation Pipeline", version="2.0.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)
jobs = {}

class RunRequest(BaseModel):
    urls: list[HttpUrl] = Field(min_length=1, max_length=20)
    concurrency: int = Field(default=3, ge=1, le=10)
    session_management: bool = Field(default=True)
    proxy_rotation: bool = Field(default=True)

@app.get("/api/health")
async def health():
    return {
        "status": "ok", 
        "service": "enterprise-scraping-automation",
        "engine": "Playwright Async + Chromium Stealth",
        "features": ["Cloudflare Turnstile Handling", "Proxy Rotation", "Session State Persistence", "Bounded Concurrency"]
    }

async def execute_job(job_id, urls, concurrency, session_management, proxy_rotation):
    jobs[job_id]["status"] = "running"
    try:
        result = await run_batch(
            urls=urls, 
            concurrency=concurrency, 
            enable_session=session_management, 
            enable_proxy_rotation=proxy_rotation
        )
        jobs[job_id].update(status="completed", result=result)
    except Exception as exc:
        jobs[job_id].update(status="failed", error=f"{type(exc).__name__}: {str(exc)[:500]}")
    jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()

@app.post("/api/run", status_code=202)
async def run(request: RunRequest):
    job_id = str(uuid.uuid4())
    urls = [str(u) for u in request.urls]
    jobs[job_id] = {
        "job_id": job_id, 
        "status": "queued", 
        "created_at": datetime.now(timezone.utc).isoformat(),
        "urls": urls, 
        "concurrency": request.concurrency,
        "session_management": request.session_management,
        "proxy_rotation": request.proxy_rotation
    }
    asyncio.create_task(execute_job(
        job_id, 
        urls, 
        request.concurrency, 
        request.session_management, 
        request.proxy_rotation
    ))
    return jobs[job_id]

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]
