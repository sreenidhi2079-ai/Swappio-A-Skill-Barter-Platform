"""
main.py
-------
Entry point for the Skill Barter FastAPI application.
Professional Mode with JSON Shim.
"""
# Change these:
from routes.skills import router as skills_router
from routes.collaboration import router as collab_router
from routes.auth import router as auth_router

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os


from database import DB_MODE

app = FastAPI(
    title="Swaaaappio — Skill Barter Platform",
    description="Professional Skills Exchange Marketplace",
    version="1.2.1",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    # Optional logging for professional mode debugging
    response = await call_next(request)
    return response

# Include API routes TWICE (with and without /api) for universal compatibility
# This ensures it works whether VITE_API_URL includes /api or not
app.include_router(auth_router, prefix="")
app.include_router(auth_router, prefix="/api")

app.include_router(skills_router, prefix="")
app.include_router(skills_router, prefix="/api")

app.include_router(collab_router, prefix="")
app.include_router(collab_router, prefix="/api")

# Static files for project exchange
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/projects", StaticFiles(directory=UPLOAD_DIR), name="projects")

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok", 
        "mode": "Professional (Cloud)" if DB_MODE == "CLOUD" else "Professional (JSON Shim)",
        "db": DB_MODE,
        "version": "1.2.1"
    }
