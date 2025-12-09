from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from ..database import get_db
from ..models import db_models
from ..schemas import story as story_schema

router = APIRouter(
    prefix="/stories",
    tags=["stories"]
)

@router.post("/", response_model=story_schema.Story)
def create_story(story: story_schema.StoryCreate, db: Session = Depends(get_db)):
    try:
        # Check if dataset exists
        dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == story.dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        db_story = db_models.Story(
            title=story.title,
            business_objective=story.business_objective,
            level=story.level,
            context=story.context,
            hypotheses=json.dumps(story.hypotheses),
            dataset_id=story.dataset_id
        )
        db.add(db_story)
        db.commit()
        db.refresh(db_story)
        
        # Convert to dict and parse hypotheses
        story_dict = {
            "id": db_story.id,
            "title": db_story.title,
            "business_objective": db_story.business_objective,
            "level": db_story.level,
            "context": db_story.context,
            "dataset_id": db_story.dataset_id,
            "created_at": db_story.created_at,
            "hypotheses": json.loads(db_story.hypotheses) if db_story.hypotheses else []
        }
        return story_dict
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{story_id}")
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story

@router.post("/suggest/{dataset_id}")
def suggest_story(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Simulate AI analysis based on filename
    filename = dataset.filename.lower()
    suggestions = []
    
    if "sales" in filename or "revenue" in filename:
        suggestions = [
            {"title": "Revenue Growth Analysis", "context": "Analyze sales trends over time to identify growth drivers."},
            {"title": "Regional Performance", "context": "Compare performance across different regions to optimize allocation."},
            {"title": "Product Mix Optimization", "context": "Identify top-selling products and underperformers."}
        ]
    elif "customer" in filename or "churn" in filename:
        suggestions = [
            {"title": "Churn Risk Assessment", "context": "Identify customers at risk of leaving and understanding why."},
            {"title": "Customer Segmentation", "context": "Group customers by behavior to tailor marketing strategies."},
            {"title": "Lifetime Value Analysis", "context": "Calculate CLV to focus on high-value segments."}
        ]
    else:
        suggestions = [
            {"title": "Exploratory Deep Dive", "context": "Uncover hidden patterns and anomalies in the data."},
            {"title": "Key Driver Analysis", "context": "Determine which factors most strongly influence your key metrics."},
            {"title": "Trend Forecasting", "context": "Predict future values based on historical data patterns."}
        ]
        
    return suggestions
