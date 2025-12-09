from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import ml_service

router = APIRouter(
    prefix="/ml",
    tags=["ml"]
)

@router.post("/train/{story_id}")
def train_model(story_id: int, db: Session = Depends(get_db)):
    return ml_service.train_model(story_id, db)

@router.get("/explain/{story_id}")
def explain_model(story_id: int, db: Session = Depends(get_db)):
    return ml_service.get_explanations(story_id, db)

@router.get("/cluster/{story_id}")
def cluster_data(story_id: int, db: Session = Depends(get_db)):
    return ml_service.perform_clustering(story_id, db)

@router.get("/anomalies/{story_id}")
def detect_anomalies(story_id: int, db: Session = Depends(get_db)):
    return ml_service.detect_anomalies(story_id, db)
