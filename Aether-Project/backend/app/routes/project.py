from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from pydantic import BaseModel
from typing import List, Optional
from ..services import project_service

router = APIRouter(
    prefix="/projects",
    tags=["projects"]
)

class ProjectCreate(BaseModel):
    title: str
    objective: str
    stakeholders: List[str]
    ethical_constraints: List[str]

class InventoryCreate(BaseModel):
    dataset_name: str
    source: str
    sensitivity: str

@router.post("/")
@router.post("")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    return project_service.create_project(
        title=project.title,
        objective=project.objective,
        stakeholders=project.stakeholders,
        ethical_constraints=project.ethical_constraints,
        db=db
    )

@router.post("/{project_id}/inventory")
def create_inventory(project_id: int, inventory: InventoryCreate, db: Session = Depends(get_db)):
    return project_service.create_data_inventory(
        project_id=project_id,
        dataset_name=inventory.dataset_name,
        source=inventory.source,
        sensitivity=inventory.sensitivity,
        db=db
    )

@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = project_service.get_project(project_id, db)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
