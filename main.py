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
    # Wait for DB to be ready
    db_ready = False
    for i in range(20):
        try:
            db = next(get_db())
            db.execute(text("SELECT 1"))
            db.close()
            db_ready = True
            break
        except Exception as e:
            print(f"Waiting for database... {i}/20")
            await asyncio.sleep(2)

    if db_ready:
        Base.metadata.create_all(bind=engine)
        db = next(get_db())
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            hashed_password = get_password_hash("Password123")
            db_admin = User(username="admin", password_hash=hashed_password, role=UserRole.ADMIN)
            db.add(db_admin)
            db.commit()
        db.close()
    else:
        print("Could not connect to database. Starting in limited mode.")

# --- API ---
@app.get("/api/health")
def health():
    return {"mode": MODE, "status": "online", "time": datetime.datetime.utcnow()}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": create_access_token(data={"sub": user.username, "role": user.role}), "token_type": "bearer"}

@app.get("/api/services")
def get_services(db: Session = Depends(get_db)):
    try:
        services = db.query(Service).filter(Service.parent_id == None).all()
        return [{"id": s.id, "code": s.code, "name": {"ru": s.name_ru, "ky": s.name_ky, "en": s.name_en}} for s in services]
    except Exception:
        return []

# --- Static Files ---
STATIC_DIR = "static"

if os.path.exists(os.path.join(STATIC_DIR, "static")):
    app.mount("/static", StaticFiles(directory=os.path.join(STATIC_DIR, "static")), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Do not serve static files for API routes
    if full_path.startswith("api") or full_path == "token" or full_path == "docs" or full_path == "openapi.json":
        raise HTTPException(status_code=404)

    # Check if it's a direct file request (e.g. favicon.ico, logo.png)
    file_path = os.path.join(STATIC_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # For all other paths, serve index.html (React Router)
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return {"message": "Server is running, but Frontend assets were not found in /app/static. If you are developing locally, make sure to build the frontend."}
