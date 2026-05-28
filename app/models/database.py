from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, JSON, Enum, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import enum
import os

Base = declarative_base()

class TicketStatus(str, enum.Enum):
    WAITING = "waiting"
    CALLING = "calling"
    SERVING = "serving"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    TERMINAL = "terminal"
    TV = "tv"

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    location = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, default=datetime.datetime.utcnow)

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    parent_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    code = Column(String(5))
    name_ru = Column(String)
    name_ky = Column(String)
    name_en = Column(String)
    priority = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_hidden = Column(Boolean, default=False)

    children = relationship("Service", backref="parent", remote_side=[id])

class Window(Base):
    __tablename__ = "windows"
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    number = Column(Integer)

    services = relationship("Service", secondary="window_services")

class WindowService(Base):
    __tablename__ = "window_services"
    window_id = Column(Integer, ForeignKey("windows.id"), primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id"), primary_key=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(Enum(UserRole), default=UserRole.OPERATOR)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey("branches.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    number = Column(String)
    status = Column(Enum(TicketStatus), default=TicketStatus.WAITING)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    called_at = Column(DateTime, nullable=True)
    served_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    window_id = Column(Integer, ForeignKey("windows.id"), nullable=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    priority_bonus = Column(Integer, default=0)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:Password123@localhost:5432/central_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
