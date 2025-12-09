from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import report_service

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)

@router.get("/{story_id}", response_class=HTMLResponse)
def get_report(story_id: int, db: Session = Depends(get_db)):
    try:
        return report_service.generate_report(story_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
