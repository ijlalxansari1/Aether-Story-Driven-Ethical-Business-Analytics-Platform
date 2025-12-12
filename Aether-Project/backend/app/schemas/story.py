from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StoryBase(BaseModel):
    title: str
    business_objective: str
    level: int
    context: Optional[str] = None
    hypotheses: Optional[List[str]] = []
    story_type: Optional[str] = "exploratory"
    target_audience: Optional[str] = "executive"

class StoryCreate(StoryBase):
    dataset_id: int

class Story(StoryBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
