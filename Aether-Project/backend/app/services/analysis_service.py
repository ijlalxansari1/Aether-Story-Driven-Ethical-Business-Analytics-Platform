import pandas as pd
import numpy as np
import json
from sqlalchemy.orm import Session
from ..models import db_models
from fastapi import HTTPException
import os
import re

def detect_pii(df):
    """Detects Potential PII in the dataframe."""
    pii_cols = []
    # Simple regex patterns
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'^\+?1?\d{9,15}$' 
    
    for col in df.select_dtypes(include=['object']):
        # Check a sample for performance
        sample = df[col].dropna().astype(str).head(50)
        if len(sample) == 0:
            continue
            
        if any(sample.apply(lambda x: bool(re.search(email_pattern, x)))):
            pii_cols.append({"column": col, "type": "Email"})
        elif any(sample.apply(lambda x: bool(re.search(phone_pattern, re.sub(r'[\s\-\(\)]', '', x))))): # Strip formatting for phone check
            pii_cols.append({"column": col, "type": "Phone"})
            
    return pii_cols

def check_bias(df):
    """Checks for class imbalance in sensitive columns."""
    sensitive_keywords = ['gender', 'sex', 'race', 'ethnicity', 'age_group']
    bias_warnings = []
    
    for col in df.columns:
        if any(keyword in col.lower() for keyword in sensitive_keywords):
            if df[col].dtype == 'object' or df[col].dtype.name == 'category':
                counts = df[col].value_counts(normalize=True)
                if not counts.empty and counts.max() > 0.75: # > 75% dominance
                    bias_warnings.append({
                        "column": col,
                        "issue": "Potential Representation Bias",
                        "details": f"Group '{counts.idxmax()}' dominates {counts.max():.1%} of the data."
                    })
    return bias_warnings

def perform_analysis(story_id: int, db: Session):
    # 1. Fetch Story and Dataset
    story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == story.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    file_path = dataset.filepath
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found on server")

    try:
        # 2. Load Data
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")
        
        # 3. Automated Cleaning
        initial_shape = df.shape
        duplicates = df.duplicated().sum()
        df = df.drop_duplicates()
        
        # Simple imputation: fill numeric NaNs with median, categorical with mode
        missing_report = df.isnull().sum().to_dict()
        for col in df.columns:
            if df[col].dtype in [np.float64, np.int64]:
                df[col] = df[col].fillna(df[col].median())
            else:
                if len(df[col].mode()) > 0:
                    df[col] = df[col].fillna(df[col].mode()[0])
        
        # 4. Generate EDA (Exploratory Data Analysis)
        eda_results = {
            "dataset_info": {
                "rows": int(df.shape[0]),
                "columns": int(df.shape[1]),
                "initial_rows": int(initial_shape[0]),
                "duplicates_removed": int(duplicates),
                "missing_values": {k: int(v) for k, v in missing_report.items() if v > 0}
            },
            "columns": list(df.columns),
            "summary_stats": df.describe().to_dict(),
            "categorical_analysis": {},
            "advanced_stats": {},
            "correlations": {},
            "distributions": {}
        }
        
        # Analyze categorical columns (top 5 values)
        for col in df.select_dtypes(include=['object', 'category']).columns:
            eda_results["categorical_analysis"][col] = df[col].value_counts().head(5).to_dict()

        # Advanced Stats & Distributions for Numeric Columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) > 0:
            # Correlation Matrix
            corr_matrix = df[numeric_cols].corr(method='pearson').round(2)
            # Convert to format suitable for heatmap: { x: col1, y: col2, value: 0.8 }
            heatmap_data = []
            for i, row in enumerate(corr_matrix.index):
                for j, col in enumerate(corr_matrix.columns):
                    heatmap_data.append({
                        "x": col,
                        "y": row,
                        "value": float(corr_matrix.iloc[i, j])
                    })
            eda_results["correlations"] = {
                "matrix": heatmap_data,
                "variables": numeric_cols
            }

            # Skewness, Kurtosis, Histograms
            for col in numeric_cols:
                # Stats
                eda_results["advanced_stats"][col] = {
                    "skewness": round(float(df[col].skew()), 2),
                    "kurtosis": round(float(df[col].kurt()), 2),
                    "quantiles": {
                        "25%": float(df[col].quantile(0.25)),
                        "50%": float(df[col].quantile(0.50)),
                        "75%": float(df[col].quantile(0.75))
                    }
                }
                
                # Histogram (10 bins)
                try:
                    counts, bin_edges = np.histogram(df[col].dropna(), bins=10)
                    eda_results["distributions"][col] = [
                        {"range": f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}", "count": int(counts[i])}
                        for i in range(len(counts))
                    ]
                except:
                    pass

        # 5. Ethical Guardrails (Phase 10) & Fairness Score (Phase 4)
        eda_results["pii_warnings"] = detect_pii(df)
        eda_results["bias_warnings"] = check_bias(df)
        
        # Calculate Fairness Score for sensitive columns
        from .metric_service import calculate_fairness_score
        fairness_scores = {}
        sensitive_keywords = ['gender', 'sex', 'race', 'ethnicity', 'age']
        for col in df.columns:
            if any(k in col.lower() for k in sensitive_keywords):
                score = calculate_fairness_score(df, col)
                fairness_scores[col] = round(score * 100, 1) # 0-100 scale
        
        eda_results["fairness_scores"] = fairness_scores
        
        eda_results["data_card"] = {
            "source": os.path.basename(file_path),
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "pii_detected": len(eda_results["pii_warnings"]) > 0,
            "bias_detected": len(eda_results["bias_warnings"]) > 0,
            "cleaning_steps": ["Dropped Duplicates", "Imputed Missing Values"]
        }

        # Prepare simple data for charts (first 2 numeric cols vs first categorical if exists)
        # This is a heuristic for basic visualization
        chart_data = []
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        if len(categorical_cols) > 0 and len(numeric_cols) > 0:
            # Group by first categorical and mean of first numeric
            cat_col = categorical_cols[0]
            num_col = numeric_cols[0]
            grouped = df.groupby(cat_col)[num_col].mean().head(10).reset_index()
            chart_data = grouped.to_dict(orient='records')
            eda_results["visualization"] = {
                "type": "bar",
                "x_axis": cat_col,
                "y_axis": num_col,
                "data": chart_data
            }
        elif len(numeric_cols) >= 2:
            # Scatter plot data (sample 50 points)
            sample = df.head(50)
            chart_data = sample[[numeric_cols[0], numeric_cols[1]]].to_dict(orient='records')
            eda_results["visualization"] = {
                "type": "scatter",
                "x_axis": numeric_cols[0],
                "y_axis": numeric_cols[1],
                "data": chart_data
            }
            
        # Generate auto-insights
        from ..services.insights_service import generate_auto_insights, calculate_data_health_score
        eda_results["auto_insights"] = generate_auto_insights(df, eda_results)
        eda_results["health_scores"] = calculate_data_health_score(eda_results)
            
        return eda_results

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def apply_cleaning_operation(dataset_id: int, operation: str, params: dict, db: Session):
    """
    Apply a cleaning operation to the dataset and save the changes.
    """
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    file_path = dataset.filepath
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found")

    try:
        # Load Data
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")
            
        # Apply Operation
        if operation == 'drop_duplicates':
            df.drop_duplicates(inplace=True)
            
        elif operation == 'drop_column':
            col = params.get('column')
            if col in df.columns:
                df.drop(columns=[col], inplace=True)
                
        elif operation == 'rename_column':
            old_name = params.get('old_name')
            new_name = params.get('new_name')
            if old_name in df.columns:
                df.rename(columns={old_name: new_name}, inplace=True)
                
        elif operation == 'impute':
            col = params.get('column')
            method = params.get('method', 'mean') # mean, median, mode, constant
            value = params.get('value')
            
            if col in df.columns:
                if method == 'mean' and pd.api.types.is_numeric_dtype(df[col]):
                    df[col].fillna(df[col].mean(), inplace=True)
                elif method == 'median' and pd.api.types.is_numeric_dtype(df[col]):
                    df[col].fillna(df[col].median(), inplace=True)
                elif method == 'mode':
                    if len(df[col].mode()) > 0:
                        df[col].fillna(df[col].mode()[0], inplace=True)
                elif method == 'constant':
                    df[col].fillna(value, inplace=True)
                    
        elif operation == 'anonymize':
            col = params.get('column')
            if col in df.columns:
                # Simple hashing for anonymization
                df[col] = df[col].apply(lambda x: hash(str(x)) if pd.notnull(x) else x)
                    
        # Save changes back to file
        if file_path.endswith('.csv'):
            df.to_csv(file_path, index=False)
        else:
            df.to_excel(file_path, index=False)
            
        return {"status": "success", "message": f"Operation '{operation}' applied successfully"}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Cleaning failed: {str(e)}")
