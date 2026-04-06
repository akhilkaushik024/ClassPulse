from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    sessions = relationship("LectureSession", back_populates="owner")

class LectureSession(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    filename = Column(String)
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="processing")
    
    # Flat Metrics
    avg_engagement = Column(Float, default=0.0)
    wait_time_sec = Column(Float, default=0.0)
    talk_speed_wpm = Column(Float, default=0.0)
    
    # Graph Payload Arrays stored natively as JSON Strings
    timeline_data = Column(Text, default="[]")
    breakdown_data = Column(Text, default="[]")
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="sessions")
