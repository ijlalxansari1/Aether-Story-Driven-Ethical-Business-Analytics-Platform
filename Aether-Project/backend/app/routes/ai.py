from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import db_models
import pandas as pd
import os

router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)

@router.get("/hypotheses/{dataset_id}")
def get_hypotheses(
    dataset_id: int, 
    story_type: str = "exploratory", 
    target_audience: str = "general", 
    db: Session = Depends(get_db)
):
    """Generate AI-powered hypotheses for the dataset"""
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Load data
        if dataset.filepath.endswith('.csv'):
            df = pd.read_csv(dataset.filepath)
        elif dataset.filepath.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(dataset.filepath)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        from ..services.ai_story_service import generate_hypotheses
        hypotheses = generate_hypotheses(df, story_type=story_type, target_audience=target_audience)
        
        return {"hypotheses": hypotheses}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/questions/{dataset_id}")
def get_smart_questions(dataset_id: int, story_title: str = "", context: str = "", db: Session = Depends(get_db)):
    """Generate smart analysis questions based on context"""
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        if dataset.filepath.endswith('.csv'):
            df = pd.read_csv(dataset.filepath)
        elif dataset.filepath.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(dataset.filepath)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        from ..services.ai_story_service import generate_smart_questions
        questions = generate_smart_questions(df, story_title, context)
        
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/correlations/{story_id}")
def discover_correlations(story_id: int, db: Session = Depends(get_db)):
    """Discover interesting correlations in the data"""
    story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == story.dataset_id).first()
    if not dataset or not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        if dataset.filepath.endswith('.csv'):
            df = pd.read_csv(dataset.filepath)
        elif dataset.filepath.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(dataset.filepath)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        from ..services.ai_story_service import discover_correlations
        correlations = discover_correlations(df)
        
        return {"correlations": correlations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{story_id}")
def get_recommendations(story_id: int, db: Session = Depends(get_db)):
    """Generate actionable recommendations"""
    # Fetch analysis results
    from ..services.analysis_service import perform_analysis
    analysis = perform_analysis(story_id, db)
    
    story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == story.dataset_id).first()
    
    if dataset.filepath.endswith('.csv'):
        df = pd.read_csv(dataset.filepath)
    else:
        df = pd.read_excel(dataset.filepath)
    
    from ..services.ai_story_service import generate_recommendations
    recommendations = generate_recommendations(
        analysis.get('auto_insights', []),
        analysis.get('health_scores', {}),
        df
    )
    
    return {"recommendations": recommendations}


@router.get("/narrative/{story_id}")
def generate_narrative(story_id: int, db: Session = Depends(get_db)):
    """Generate AI-written narrative summary"""
    story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    from ..services.analysis_service import perform_analysis
    analysis = perform_analysis(story_id, db)
    
    from ..services.ai_story_service import generate_narrative
    narrative = generate_narrative(
        story.title,
        analysis.get('auto_insights', []),
        analysis.get('health_scores', {}),
        analysis.get('dataset_info', {})
    )
    
    return {
        "narrative": narrative,
        "title": story.title
    }
