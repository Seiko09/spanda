from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import os
import datetime
import httpx
import asyncio

from app.models.database import Base, engine, get_db, User, UserRole, Service, Branch, Ticket, TicketStatus, Window
from app.auth import get_password_hash, verify_password, create_access_token

app = FastAPI(title="Spanda E-Queue System")

MODE = os.getenv("MODE", "central")
CENTRAL_URL = os.getenv("CENTRAL_URL", "http://central-server:8000")

@app.on_event("startup")
async def startup_event():
    # Wait for DB
    db_ready = False
    for i in range(20):
        try:
            db = next(get_db())
            db.execute(text("SELECT 1"))
            db.close()
            db_ready = True
            break
        except Exception:
            await asyncio.sleep(2)

    if db_ready:
        Base.metadata.create_all(bind=engine)
        db = next(get_db())
        if not db.query(User).filter(User.username == "admin").first():
            db.add(User(username="admin", password_hash=get_password_hash("Password123"), role=UserRole.ADMIN))
            db.commit()
        db.close()

# --- API ROUTES FIRST ---
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": create_access_token(data={"sub": user.username, "role": user.role}), "token_type": "bearer"}

@app.get("/api/health")
def health():
    return {"mode": MODE, "status": "online"}

@app.get("/api/services")
def get_services(db: Session = Depends(get_db)):
    return [{"id": 1, "code": "A", "name": {"ru": "Кредиты", "ky": "Кредиттер", "en": "Loans"}}]

# --- STATIC FILES SERVING LAST ---
STATIC_DIR = "static"
if os.path.exists(STATIC_DIR):
    # Mount the 'static' folder for assets like /static/js/...
    assets_dir = os.path.join(STATIC_DIR, "static")
    if os.path.exists(assets_dir):
        app.mount("/static", StaticFiles(directory=assets_dir), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API or docs
        if full_path.startswith("api") or full_path in ["token", "docs", "openapi.json", "redoc"]:
            raise HTTPException(status_code=404)

        # Check for files in static root (favicon, manifest etc)
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/")
    def no_static():
        return {"error": "Frontend not found. Make sure 'static' directory exists."}
