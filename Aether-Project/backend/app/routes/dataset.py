from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import db_models
import pandas as pd
import os
import numpy as np

router = APIRouter(
    prefix="/datasets",
    tags=["datasets"]
)

@router.get("/{dataset_id}/preview")
def preview_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        # Read a sample for PII detection (50 rows)
        if dataset.filepath.endswith('.csv'):
            df = pd.read_csv(dataset.filepath, nrows=50)
        elif dataset.filepath.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(dataset.filepath, nrows=50)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        # Detect PII
        from ..services.analysis_service import detect_pii
        pii_warnings = detect_pii(df)
            
        # Replace NaN with None for JSON serialization (use only top 5 for display)
        preview_df = df.head(5).replace({np.nan: None})
        
        return {
            "columns": list(preview_df.columns),
            "rows": preview_df.to_dict(orient='records'),
            "pii_warnings": pii_warnings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class CleaningOperation(BaseModel):
    operation: str
    params: dict = {}

@router.post("/{dataset_id}/clean")
def clean_dataset(dataset_id: int, op: CleaningOperation, db: Session = Depends(get_db)):
    from ..services.analysis_service import apply_cleaning_operation
    return apply_cleaning_operation(dataset_id, op.operation, op.params, db)
