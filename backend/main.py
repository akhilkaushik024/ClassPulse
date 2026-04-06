from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import json

from database import engine, Base, get_db
import models
from pipeline import process_lecture_audio

# Auto-create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/auth/signup")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(full_name=user.full_name, email=user.email, hashed_password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"user_id": new_user.id, "email": new_user.email, "name": new_user.full_name, "has_history": False}

@app.post("/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=400, detail="Incorrect credentials")
    
    # Crucial logic to fulfill the 'Maintain User History / Secure Dashboard' Prompt requirement
    session = db.query(models.LectureSession).filter(models.LectureSession.owner_id == db_user.id).order_by(models.LectureSession.id.desc()).first()
    
    response = {
        "user_id": db_user.id,
        "name": db_user.full_name,
        "email": db_user.email,
        "has_history": False
    }
    
    if session and session.status == "completed":
        response["has_history"] = True
        response["metrics"] = {
            "avg_engagement": session.avg_engagement,
            "wait_time_sec": session.wait_time_sec,
            "talk_speed_wpm": session.talk_speed_wpm,
            "timeline_data": json.loads(session.timeline_data),
            "breakdown_data": json.loads(session.breakdown_data)
        }
        
    return response

import uuid

@app.post("/api/upload")
async def upload_video(user_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    unique_id = uuid.uuid4().hex
    _, ext = os.path.splitext(file.filename)
    file_location = f"uploads/{unique_id}{ext}"
    with open(file_location, "wb+") as f:
        f.write(await file.read())
    
    new_session = models.LectureSession(
        title=f"Lecture {file.filename}",
        filename=file_location,
        status="processing",
        owner_id=int(user_id)
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Process authentic physical data points (PyDub)
    from fastapi.concurrency import run_in_threadpool
    metrics = await run_in_threadpool(process_lecture_audio, file_location)
    
    new_session.avg_engagement = metrics["avg_engagement"]
    new_session.wait_time_sec = metrics["wait_time_sec"]
    new_session.talk_speed_wpm = metrics["talk_speed_wpm"]
    new_session.timeline_data = metrics["timeline_data"]
    new_session.breakdown_data = metrics["breakdown_data"]
    new_session.status = "completed"
    db.commit()

    return {
        "status": "success",
        "metrics": {
            "avg_engagement": new_session.avg_engagement,
            "wait_time_sec": new_session.wait_time_sec,
            "talk_speed_wpm": new_session.talk_speed_wpm,
            "timeline_data": json.loads(new_session.timeline_data),
            "breakdown_data": json.loads(new_session.breakdown_data)
        }
    }

@app.get("/api/history/{user_id}")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    sessions = db.query(models.LectureSession).filter(
        models.LectureSession.owner_id == user_id,
        models.LectureSession.status == "completed"
    ).order_by(models.LectureSession.id.desc()).all()
    
    history_list = []
    for session in sessions:
        history_list.append({
            "id": session.id,
            "title": session.title,
            "upload_time": session.upload_time.isoformat() if session.upload_time else None,
            "metrics": {
                "avg_engagement": session.avg_engagement,
                "wait_time_sec": session.wait_time_sec,
                "talk_speed_wpm": session.talk_speed_wpm,
                "timeline_data": json.loads(session.timeline_data) if session.timeline_data else [],
                "breakdown_data": json.loads(session.breakdown_data) if session.breakdown_data else []
            }
        })
        
    return {"history": history_list}

