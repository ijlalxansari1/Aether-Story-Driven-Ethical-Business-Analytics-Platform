import os
from sqlalchemy.orm import Session
from ..models import db_models
from datetime import datetime

def cleanup_expired_files(db: Session):
    now = datetime.utcnow()
    expired_datasets = db.query(db_models.Dataset).filter(db_models.Dataset.expiry_time < now).all()
    
    for dataset in expired_datasets:
        if os.path.exists(dataset.filepath):
            os.remove(dataset.filepath)
        
        # Log deletion
        audit = db_models.AuditLog(
            action="AUTO_DELETE",
            details=f"Deleted expired file: {dataset.filename}"
        )
        db.add(audit)
        
        # Remove from DB (or mark as deleted if soft delete preferred)
        db.delete(dataset)
    
    db.commit()
