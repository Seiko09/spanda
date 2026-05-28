from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
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

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        hashed_password = get_password_hash("Password123")
        db_admin = User(username="admin", password_hash=hashed_password, role=UserRole.ADMIN)
        db.add(db_admin)
        db.commit()
    db.close()

# API Endpoints
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": create_access_token(data={"sub": user.username, "role": user.role}), "token_type": "bearer"}

@app.get("/api/services")
def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).filter(Service.parent_id == None).all()
    return [{"id": s.id, "code": s.code, "name": {"ru": s.name_ru, "ky": s.name_ky, "en": s.name_en}} for s in services]

@app.get("/api/health")
def health():
    return {"mode": MODE, "status": "online"}

# Static Files Serving
if os.path.exists("static"):
    # First priority: actual files in the static folder (manifest, icons, etc)
    @app.get("/{full_path:path}")
    async def serve_static(full_path: str):
        # Exclude API calls from static serving
        if full_path.startswith("api/") or full_path == "api":
             raise HTTPException(status_code=404)

        file_path = os.path.join("static", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html for React routing
        return FileResponse("static/index.html")
