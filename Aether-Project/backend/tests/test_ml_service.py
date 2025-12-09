import pytest
import pandas as pd
import numpy as np
import os
import sys
from unittest.mock import MagicMock, patch

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services import ml_service
from app.models import db_models

# Mock Database Session
class MockSession:
    def query(self, model):
        return self
    
    def filter(self, condition):
        return self
    
    def first(self):
        return None

@pytest.fixture
def mock_db():
    return MockSession()

def test_train_model_success(mock_db):
    # Create a dummy CSV
    df = pd.DataFrame({
        'feature1': np.random.rand(100),
        'feature2': np.random.randint(0, 2, 100),
        'target': np.random.rand(100)
    })
    csv_path = "test_dataset.csv"
    df.to_csv(csv_path, index=False)
    
    try:
        # Mock DB returns
        with patch.object(MockSession, 'first') as mock_first:
            mock_story = MagicMock()
            mock_story.dataset_id = 1
            
            mock_dataset = MagicMock()
            mock_dataset.filepath = csv_path
            
            # First call returns story, second returns dataset
            mock_first.side_effect = [mock_story, mock_dataset]
            
            result = ml_service.train_model(1, mock_db)
            
            assert result['status'] == 'success'
            assert 'accuracy' in result
            assert 'model_id' in result
            assert os.path.exists(os.path.join(ml_service.MODEL_DIR, result['model_id']))
            
    finally:
        if os.path.exists(csv_path):
            os.remove(csv_path)

def test_get_explanations_success(mock_db):
    # Create a dummy trained model first
    df = pd.DataFrame({
        'feature1': np.random.rand(100),
        'feature2': np.random.randint(0, 2, 100),
        'target': np.random.rand(100)
    })
    csv_path = "test_dataset_expl.csv"
    df.to_csv(csv_path, index=False)
    
    try:
        with patch.object(MockSession, 'first') as mock_first:
            mock_story = MagicMock()
            mock_story.dataset_id = 1
            mock_dataset = MagicMock()
            mock_dataset.filepath = csv_path
            mock_first.side_effect = [mock_story, mock_dataset]
            
            # Train model
            train_result = ml_service.train_model(1, mock_db)
            assert train_result['status'] == 'success'
            
            # Get explanations
            expl_result = ml_service.get_explanations(1, mock_db)
            
            assert 'feature_importance' in expl_result
            assert len(expl_result['feature_importance']) > 0
            assert 'summary' in expl_result
            
    finally:
        if os.path.exists(csv_path):
            os.remove(csv_path)
