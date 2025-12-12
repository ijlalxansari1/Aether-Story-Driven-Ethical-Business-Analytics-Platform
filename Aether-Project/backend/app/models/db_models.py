from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    upload_time = Column(DateTime, default=datetime.utcnow)
    expiry_time = Column(DateTime)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    stories = relationship("Story", back_populates="dataset")
    project = relationship("Project", back_populates="datasets")

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    business_objective = Column(String)
    level = Column(Integer)  # 1, 2, or 3
    context = Column(String)
    hypotheses = Column(String) # JSON string
    story_type = Column(String, default="exploratory")
    target_audience = Column(String, default="executive")
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="stories")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(String)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    objective = Column(String) # e.g., "Churn Prediction"
    stakeholders = Column(String) # JSON string
    ethical_constraints = Column(String) # JSON string: ["GDPR", "Bias"]
    created_at = Column(DateTime, default=datetime.utcnow)

    datasets = relationship("Dataset", back_populates="project")

class DataInventory(Base):
    __tablename__ = "data_inventories"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String)
    source = Column(String)
    sensitivity = Column(String) # Public, Internal, Restricted
    risk_assessment = Column(String) # JSON string
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Link to actual dataset if uploaded
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
