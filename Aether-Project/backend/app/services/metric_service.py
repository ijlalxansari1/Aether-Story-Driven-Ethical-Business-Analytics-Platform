from typing import List, Dict

def suggest_metrics(objective: str) -> List[Dict[str, str]]:
    """Suggests success metrics based on the project objective."""
    
    metrics = []
    
    if "Churn" in objective or "Classification" in objective:
        metrics.extend([
            {"name": "Accuracy", "description": "Overall correctness of predictions."},
            {"name": "Recall", "description": "Ability to find all positive instances (critical for Churn)."},
            {"name": "F1-Score", "description": "Balance between precision and recall."},
            {"name": "Disparate Impact", "description": "Ratio of positive outcomes for different groups (Fairness)."}
        ])
    elif "Regression" in objective or "Forecasting" in objective:
        metrics.extend([
            {"name": "RMSE", "description": "Root Mean Squared Error."},
            {"name": "MAE", "description": "Mean Absolute Error."},
            {"name": "R-Squared", "description": "Proportion of variance explained by the model."}
        ])
    elif "Cluster" in objective or "Segmentation" in objective:
        metrics.extend([
            {"name": "Silhouette Score", "description": "How similar an object is to its own cluster compared to other clusters."},
            {"name": "Davies-Bouldin Index", "description": "Average similarity measure of each cluster with its most similar cluster."}
        ])
    else:
        # Default metrics
        metrics.extend([
            {"name": "Data Quality Score", "description": "Overall health of the dataset (missing values, duplicates)."},
            {"name": "Fairness Score", "description": "Measure of bias in sensitive columns."}
        ])
        
    return metrics

def calculate_fairness_score(df, sensitive_col: str, target_col: str = None) -> float:
    """
    Calculates a simple fairness score (Disparate Impact Ratio).
    If target_col is None, it checks for representation balance.
    """
    if sensitive_col not in df.columns:
        return 1.0 # Perfect score if col doesn't exist
        
    if target_col and target_col in df.columns:
        # Disparate Impact: P(Outcome=1 | Group A) / P(Outcome=1 | Group B)
        # Simplified for this demo: Max deviation from global mean
        global_rate = df[target_col].mean()
        groups = df.groupby(sensitive_col)[target_col].mean()
        if groups.empty:
            return 1.0
        
        # Calculate max deviation
        max_dev = (groups - global_rate).abs().max()
        # Score: 1.0 is perfect, 0.0 is worst. 
        # If max_dev is 0.5 (e.g., 50% vs 100%), score is 0.5.
        return max(0.0, 1.0 - max_dev)
        
    else:
        # Representation Balance
        counts = df[sensitive_col].value_counts(normalize=True)
        if counts.empty:
            return 1.0
        
        # Ideal is 1/N
        n_groups = len(counts)
        ideal = 1.0 / n_groups
        
        # Max deviation from ideal
        max_dev = (counts - ideal).abs().max()
        return max(0.0, 1.0 - max_dev)
