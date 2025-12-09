from sqlalchemy.orm import Session
from ..models import db_models
import json
from datetime import datetime

def create_project(title: str, objective: str, stakeholders: list, ethical_constraints: list, db: Session):
    """Creates a new project with ethical context."""
    new_project = db_models.Project(
        title=title,
        objective=objective,
        stakeholders=json.dumps(stakeholders),
        ethical_constraints=json.dumps(ethical_constraints)
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

def create_data_inventory(project_id: int, dataset_name: str, source: str, sensitivity: str, db: Session):
    """Creates a data inventory entry and performs initial risk assessment."""
    
    # Auto-Risk Assessment Logic
    risk_assessment = []
    if sensitivity == "Restricted":
        risk_assessment.append("High Risk: Strict Access Control Required")
        risk_assessment.append("Encryption at Rest Mandatory")
    elif sensitivity == "Internal":
        risk_assessment.append("Medium Risk: Internal Use Only")
    
    if "Social Media" in source or "Third Party" in source:
        risk_assessment.append("Consent Check Required: Verify Data Usage Rights")
        
    new_inventory = db_models.DataInventory(
        project_id=project_id,
        dataset_name=dataset_name,
        source=source,
        sensitivity=sensitivity,
        risk_assessment=json.dumps(risk_assessment)
    )
    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)
    
    return {
        "inventory": new_inventory,
        "risk_assessment": risk_assessment
    }

def get_project(project_id: int, db: Session):
    return db.query(db_models.Project).filter(db_models.Project.id == project_id).first()
