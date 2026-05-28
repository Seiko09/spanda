from fastapi import FastAPI, Depends, HTTPException, status, Body, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Set
import os
import datetime
import httpx
import asyncio

from app.models.database import Base, engine, get_db, User, UserRole, Service, Branch, Ticket, TicketStatus, Window
from app.auth import get_password_hash, verify_password, create_access_token

app = FastAPI(title="Spanda E-Queue System")

MODE = os.getenv("MODE", "central")
CENTRAL_URL = os.getenv("CENTRAL_URL", "http://central-server:8000")

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

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

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- API ---
@app.get("/api/health")
def health():
    return {"mode": MODE, "status": "online", "ws_active": len(manager.active_connections)}

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
if os.path.exists(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "static")
    if os.path.exists(assets_dir):
        app.mount("/static", StaticFiles(directory=assets_dir), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path in ["token", "docs", "openapi.json", "ws"]:
            raise HTTPException(status_code=404)

        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)

        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend assets not found"}
