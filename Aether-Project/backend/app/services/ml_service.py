from sqlalchemy.orm import Session
from ..models import db_models
import pandas as pd
import numpy as np
# from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import StandardScaler, LabelEncoder
# from sklearn.impute import SimpleImputer
# import shap
import joblib
import os
import json

# Directory to save models
MODEL_DIR = "backend/models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_model(story_id: int, db: Session):
    """
    Train a Random Forest model on the dataset associated with the story.
    Note: Disabled in this deployment to reduce package size.
    """
    return {
        "status": "success",
        "model_id": "model_disabled",
        "accuracy": 0.0,
        "message": "Model training is currently disabled to optimize deployment size (Vercel Limit)."
    }

def get_explanations(story_id: int, db: Session):
    """
    Generate SHAP explanations for the trained model.
    Note: Disabled in this deployment to reduce package size.
    """
    return {
        "feature_importance": [],
        "summary": "AI Explanations (SHAP) are currently disabled to optimize deployment size."
    }

def perform_clustering(story_id: int, db: Session):
    """
    Perform K-Means clustering.
    Note: Disabled in this deployment to reduce package size.
    """
    return {
        "status": "success",
        "clusters": [],
        "plot_data": [],
        "x_label": "N/A",
        "y_label": "N/A",
        "message": "Clustering is disabled in this deployment."
    }

def detect_anomalies(story_id: int, db: Session):
    """
    Detect anomalies using Isolation Forest.
    Note: Disabled in this deployment to reduce package size.
    """
    return {
        "status": "success",
        "anomaly_count": 0,
        "anomaly_percentage": 0.0,
        "top_anomalies": [],
        "message": "Anomaly detection is disabled in this deployment."
    }
