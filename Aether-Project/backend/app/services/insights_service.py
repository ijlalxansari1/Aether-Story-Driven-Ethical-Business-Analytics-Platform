import pandas as pd
import numpy as np
from typing import List, Dict

def generate_auto_insights(df: pd.DataFrame, eda_results: dict) -> List[Dict]:
    """Generate automatic insights from the data"""
    insights = []
    
    # Insight 1: Data Volume
    row_count = eda_results['dataset_info']['rows']
    col_count = eda_results['dataset_info']['columns']
    insights.append({
        "type": "volume",
        "icon": "📊",
        "title": "Dataset Scale",
        "finding": f"Your dataset contains {row_count:,} records across {col_count} dimensions.",
        "priority": "medium"
    })
    
    # Insight 2: Data Quality
    duplicates = eda_results['dataset_info']['duplicates_removed']
    if duplicates > 0:
        dup_pct = (duplicates / eda_results['dataset_info']['initial_rows']) * 100
        insights.append({
            "type": "quality",
            "icon": "⚠️",
            "title": "Duplicate Records Detected",
            "finding": f"Found and removed {duplicates:,} duplicate rows ({dup_pct:.1f}% of total).",
            "priority": "high" if dup_pct > 10 else "medium"
        })
    
    # Insight 3: Missing Data
    missing_vals = eda_results['dataset_info']['missing_values']
    if missing_vals:
        total_missing = sum(missing_vals.values())
        total_cells = row_count * col_count
        missing_pct = (total_missing / total_cells) * 100
        insights.append({
            "type": "quality",
            "icon": "🔍",
            "title": "Data Completeness",
            "finding": f"Missing data detected in {len(missing_vals)} columns ({missing_pct:.2f}% of all cells).",
            "priority": "high" if missing_pct > 5 else "low"
        })
    else:
        insights.append({
            "type": "quality",
            "icon": "✅",
            "title": "Perfect Completeness",
            "finding": "No missing values detected. Your dataset is 100% complete!",
            "priority": "low"
        })
    
    # Insight 4: Numeric Column Insights
    numeric_cols = [col for col in df.select_dtypes(include=[np.number]).columns]
    if numeric_cols:
        # Find column with highest variance
        variances = {col: df[col].var() for col in numeric_cols}
        high_var_col = max(variances, key=variances.get)
        
        insights.append({
            "type": "distribution",
            "icon": "📈",
            "title": "High Variance Column",
            "finding": f"'{high_var_col}' shows the highest variability, suggesting it may be a key differentiator.",
            "priority": "medium"
        })
    
    # Insight 5: Categorical Analysis
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    if len(categorical_cols) > 0:
        for col in categorical_cols[:2]:  # Top 2 categorical columns
            unique_count = df[col].nunique()
            total_count = len(df)
            cardinality_ratio = unique_count / total_count
            
            if cardinality_ratio < 0.1:
                top_value = df[col].mode()[0]
                top_freq = (df[col] == top_value).sum()
                top_pct = (top_freq / total_count) * 100
                
                insights.append({
                    "type": "pattern",
                    "icon": "🎯",
                    "title": f"Dominant Category in '{col}'",
                    "finding": f"'{top_value}' appears in {top_pct:.1f}% of records.",
                    "priority": "medium"
                })
    
    # Insight 6: Potential Outliers (for numeric columns)
    if numeric_cols:
        for col in numeric_cols[:3]:  # Check first 3 numeric columns
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum()
            
            if outliers > 0:
                outlier_pct = (outliers / len(df)) * 100
                if outlier_pct > 1:
                    insights.append({
                        "type": "outlier",
                        "icon": "⚡",
                        "title": f"Outliers in '{col}'",
                        "finding": f"{outliers} potential outliers detected ({outlier_pct:.1f}%).",
                        "priority": "medium"
                    })
    
    # Insight 7: Data Freshness (if timestamp columns exist)
    date_cols = df.select_dtypes(include=['datetime64']).columns
    if len(date_cols) > 0:
        col = date_cols[0]
        latest_date = df[col].max()
        insights.append({
            "type": "temporal",
            "icon": "📅",
            "title": "Data Recency",
            "finding": f"Most recent data point: {latest_date}",
            "priority": "low"
        })
    
    return insights


def calculate_data_health_score(eda_results: dict) -> dict:
    """Calculate overall data health score"""
    scores = {}
    
    # Completeness Score (0-100)
    total_cells = eda_results['dataset_info']['rows'] * eda_results['dataset_info']['columns']
    missing_cells = sum(eda_results['dataset_info']['missing_values'].values())
    completeness = ((total_cells - missing_cells) / total_cells) * 100 if total_cells > 0 else 100
    scores['completeness'] = round(completeness, 1)
    
    # Uniqueness Score (based on duplicates)
    initial_rows = eda_results['dataset_info']['initial_rows']
    duplicates = eda_results['dataset_info']['duplicates_removed']
    uniqueness = ((initial_rows - duplicates) / initial_rows) * 100 if initial_rows > 0 else 100
    scores['uniqueness'] = round(uniqueness, 1)
    
    # Validity Score (placeholder - would need domain rules)
    scores['validity'] = 85  # Simulated for now
    
    # Overall Health Score (weighted average)
    scores['overall'] = round((
        completeness * 0.4 + 
        uniqueness * 0.3 + 
        scores['validity'] * 0.3
    ), 1)
    
    return scores
