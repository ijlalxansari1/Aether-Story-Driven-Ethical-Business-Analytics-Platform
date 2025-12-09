from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import analysis_service

router = APIRouter(
    prefix="/analysis",
    tags=["analysis"]
)

@router.get("/{story_id}")
def get_analysis(story_id: int, db: Session = Depends(get_db)):
    return analysis_service.perform_analysis(story_id, db)
