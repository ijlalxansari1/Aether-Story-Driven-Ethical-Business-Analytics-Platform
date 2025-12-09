from sqlalchemy.orm import Session
from ..models import db_models
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
import shap
import joblib
import os
import json

# Directory to save models
MODEL_DIR = "backend/models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_model(story_id: int, db: Session):
    """
    Train a Random Forest model on the dataset associated with the story.
    Automatically detects target variable (last column) and problem type (regression/classification).
    """
    try:
        # 1. Fetch Data
        story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
        if not story:
            return {"status": "error", "message": "Story not found"}
        
        dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == story.dataset_id).first()
        if not dataset or not os.path.exists(dataset.filepath):
            return {"status": "error", "message": "Dataset not found"}

        if dataset.filepath.endswith('.csv'):
            df = pd.read_csv(dataset.filepath)
        else:
            df = pd.read_excel(dataset.filepath)

        # 2. Preprocessing
        # Assume last column is the target
        target_col = df.columns[-1]
        feature_cols = df.columns[:-1]
        
        X = df[feature_cols]
        y = df[target_col]

        # Handle missing values
        num_imputer = SimpleImputer(strategy='mean')
        cat_imputer = SimpleImputer(strategy='most_frequent')
        
        # Separate numeric and categorical columns
        numeric_cols = X.select_dtypes(include=[np.number]).columns
        categorical_cols = X.select_dtypes(exclude=[np.number]).columns
        
        # Process numeric features
        if len(numeric_cols) > 0:
            X_num = pd.DataFrame(num_imputer.fit_transform(X[numeric_cols]), columns=numeric_cols)
        else:
            X_num = pd.DataFrame()

        # Process categorical features
        if len(categorical_cols) > 0:
            X_cat = pd.DataFrame(cat_imputer.fit_transform(X[categorical_cols]), columns=categorical_cols)
            # One-hot encode
            X_cat = pd.get_dummies(X_cat, drop_first=True)
        else:
            X_cat = pd.DataFrame()

        X_processed = pd.concat([X_num, X_cat], axis=1)
        
        # Handle target variable
        is_classification = False
        if y.dtype == 'object' or y.nunique() < 10:
            is_classification = True
            le = LabelEncoder()
            y_processed = le.fit_transform(y.astype(str))
        else:
            y_processed = y

        # 3. Train Model
        X_train, X_test, y_train, y_test = train_test_split(X_processed, y_processed, test_size=0.2, random_state=42)
        
        if is_classification:
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            
        model.fit(X_train, y_train)
        score = model.score(X_test, y_test)

        # 4. Save Model & Metadata
        model_filename = f"model_{story_id}.joblib"
        model_path = os.path.join(MODEL_DIR, model_filename)
        
        # Save model and training data (for SHAP)
        joblib.dump({
            'model': model,
            'X_train': X_train,
            'feature_names': X_processed.columns.tolist(),
            'is_classification': is_classification,
            'target_col': target_col
        }, model_path)

        return {
            "status": "success",
            "model_id": model_filename,
            "accuracy": round(score, 4),
            "message": f"Successfully trained {'Classification' if is_classification else 'Regression'} model on target '{target_col}'"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

def get_explanations(story_id: int, db: Session):
    """
    Generate SHAP explanations for the trained model.
    """
    try:
        model_path = os.path.join(MODEL_DIR, f"model_{story_id}.joblib")
        if not os.path.exists(model_path):
            return {"status": "error", "message": "Model not trained yet"}
            
        data = joblib.load(model_path)
        model = data['model']
        X_train = data['X_train']
        feature_names = data['feature_names']
        
        # Calculate SHAP values
        # Use a sample of background data for speed
        background = shap.sample(X_train, 100)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(background)
        
        # Handle classification output (SHAP returns list of arrays)
        if isinstance(shap_values, list):
            shap_values = shap_values[1] # Positive class
            
        # Calculate mean absolute SHAP value for global importance
        feature_importance = np.abs(shap_values).mean(axis=0)
        
        # Create importance list
        importance_list = []
        for name, imp in zip(feature_names, feature_importance):
            importance_list.append({
                "feature": name,
                "importance": float(imp)
            })
            
        # Sort by importance
        importance_list.sort(key=lambda x: x['importance'], reverse=True)
        
        # Normalize importance to percentage
        total_importance = sum(x['importance'] for x in importance_list)
        if total_importance > 0:
            for item in importance_list:
                item['importance'] = round((item['importance'] / total_importance) * 100, 1)
        
        return {
            "feature_importance": importance_list[:10], # Top 10 features
            "summary": f"The model's top predictor is '{importance_list[0]['feature']}', followed by '{importance_list[1]['feature']}'."
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

def perform_clustering(story_id: int, db: Session):
    """
    Perform K-Means clustering to identify natural segments in the data.
    """
    try:
        # Fetch Data
        story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
        dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == story.dataset_id).first()
        
        if dataset.filepath.endswith('.csv'):
            df = pd.read_csv(dataset.filepath)
        else:
            df = pd.read_excel(dataset.filepath)

        # Preprocessing (Numerics only for clustering)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) < 2:
            return {"status": "error", "message": "Not enough numeric columns for clustering"}
            
        X = df[numeric_cols].dropna()
        
        # Scale data
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # K-Means
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        
        # Add cluster labels to data
        X['Cluster'] = clusters
        
        # Analyze clusters
        cluster_summary = []
        for i in range(3):
            cluster_data = X[X['Cluster'] == i]
            summary = {
                "cluster_id": i,
                "size": int(len(cluster_data)),
                "percentage": round(len(cluster_data) / len(X) * 100, 1),
                "characteristics": {}
            }
            # Calculate mean of top features
            for col in numeric_cols[:3]: # Top 3 numeric cols
                summary["characteristics"][col] = round(cluster_data[col].mean(), 2)
            cluster_summary.append(summary)
            
        return {
            "status": "success",
            "clusters": cluster_summary,
            "plot_data": [
                {"x": float(row[numeric_cols[0]]), "y": float(row[numeric_cols[1]]), "cluster": int(cluster)}
                for row, cluster in zip(X.to_dict('records')[:200], clusters[:200]) # Sample for plotting
            ],
            "x_label": numeric_cols[0],
            "y_label": numeric_cols[1]
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

def detect_anomalies(story_id: int, db: Session):
    """
    Detect anomalies using Isolation Forest.
    """
    try:
        # Fetch Data
        story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
        dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == story.dataset_id).first()
        
        if dataset.filepath.endswith('.csv'):
            df = pd.read_csv(dataset.filepath)
        else:
            df = pd.read_excel(dataset.filepath)

        # Preprocessing
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            return {"status": "error", "message": "No numeric columns for anomaly detection"}
            
        X = df[numeric_cols].dropna()
        
        # Isolation Forest
        from sklearn.ensemble import IsolationForest
        iso = IsolationForest(contamination=0.05, random_state=42)
        anomalies = iso.fit_predict(X)
        
        # -1 is anomaly, 1 is normal
        anomaly_indices = [i for i, x in enumerate(anomalies) if x == -1]
        
        anomaly_data = []
        for idx in anomaly_indices[:10]: # Top 10 anomalies
            record = df.iloc[idx].to_dict()
            # Convert NaN to None for JSON serialization
            clean_record = {k: (None if pd.isna(v) else v) for k, v in record.items()}
            anomaly_data.append(clean_record)
            
        return {
            "status": "success",
            "anomaly_count": len(anomaly_indices),
            "anomaly_percentage": round(len(anomaly_indices) / len(df) * 100, 1),
            "top_anomalies": anomaly_data
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
