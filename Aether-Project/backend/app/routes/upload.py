from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import Optional
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import db_models
from ..services import privacy_scanner
import shutil
import os
from datetime import datetime, timedelta

router = APIRouter()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    project_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # Handle project_id conversion manually to be safe
        pid = None
        if project_id and project_id.lower() not in ('null', 'undefined', 'none', ''):
            try:
                pid = int(project_id)
            except ValueError:
                pid = None

        file_location = f"{UPLOAD_DIR}/{file.filename}"
        
        # Save file locally
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        # Scan for PII
        warnings = privacy_scanner.scan_dataset(file_location)
        
        # Create Dataset record
        expiry = datetime.utcnow() + timedelta(hours=24)
        dataset = db_models.Dataset(
            filename=file.filename,
            filepath=file_location,
            expiry_time=expiry,
            project_id=pid
        )
        db.add(dataset)
        
        # Create Audit Log
        audit = db_models.AuditLog(
            action="UPLOAD",
            details=f"Uploaded file: {file.filename}. Warnings: {len(warnings)}"
        )
        db.add(audit)
        
        db.commit()
        db.refresh(dataset)
        
        return {
            "info": f"file '{file.filename}' saved at '{file_location}'", 
            "dataset_id": dataset.id,
            "warnings": warnings
        }
    except Exception as e:
        import traceback
        error_msg = f"Upload failed: {str(e)}\n{traceback.format_exc()}"
        with open("backend_error.log", "a") as f:
            f.write(f"[{datetime.utcnow()}] {error_msg}\n")
        print(error_msg) # Still print to stdout
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
