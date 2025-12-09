import pandas as pd
import numpy as np
from typing import List, Dict
import json

def generate_hypotheses(df: pd.DataFrame, story_context: str = "", story_type: str = "exploratory", target_audience: str = "general") -> List[Dict]:
    """Generate AI-powered hypotheses based on data structure, context, and user preferences"""
    hypotheses = []
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    date_cols = df.select_dtypes(include=['datetime64']).columns.tolist()
    
    # Helper to adjust language based on audience
    def adjust_language(text_tech, text_exec, text_gen):
        if target_audience == 'technical': return text_tech
        if target_audience == 'executive': return text_exec
        return text_gen

    # --- 1. Trend Analysis (Priority for 'trend') ---
    if len(date_cols) > 0 and len(numeric_cols) > 0:
        date_col = date_cols[0]
        num_col = numeric_cols[0]
        
        confidence = "high" if story_type == 'trend' else "medium"
        
        hypotheses.append({
            "type": "trend",
            "question": adjust_language(
                f"Is there a significant temporal trend in {num_col}?",
                f"How is {num_col} performing over time?",
                f"Is {num_col} going up or down over time?"
            ),
            "rationale": adjust_language(
                "Time series decomposition suggests potential seasonality.",
                "Historical trends often predict future performance.",
                "Looking at data over time helps spot patterns."
            ),
            "confidence": confidence,
            "variables": [date_col, num_col],
            "test": "Time Series Analysis"
        })

    # --- 2. Group Comparison (Priority for 'comparative') ---
    if len(categorical_cols) > 0 and len(numeric_cols) > 0:
        cat_col = categorical_cols[0]
        num_col = numeric_cols[0]
        unique_vals = df[cat_col].nunique()
        
        if 2 <= unique_vals <= 10:
            confidence = "high" if story_type == 'comparative' else "medium"
            
            hypotheses.append({
                "type": "comparison",
                "question": adjust_language(
                    f"Do {cat_col} groups exhibit statistically significant differences in {num_col}?",
                    f"Which {cat_col} drives the highest {num_col}?",
                    f"How does {num_col} compare across different {cat_col}?"
                ),
                "rationale": adjust_language(
                    f"ANOVA/T-test applicable for {unique_vals} groups.",
                    "Identifying top performers helps allocate resources.",
                    "Comparing groups shows what works best."
                ),
                "confidence": confidence,
                "variables": [cat_col, num_col],
                "test": "Group Comparison Test"
            })

    # --- 3. Correlation (Standard) ---
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr()
        np.fill_diagonal(corr_matrix.values, 0)
        if not corr_matrix.empty: # Check if matrix is not empty
            max_corr_idx = np.unravel_index(np.argmax(np.abs(corr_matrix.values)), corr_matrix.shape)
            col1 = numeric_cols[max_corr_idx[0]]
            col2 = numeric_cols[max_corr_idx[1]]
            corr_value = corr_matrix.iloc[max_corr_idx[0], max_corr_idx[1]]
            
            hypotheses.append({
                "type": "correlation",
                "question": adjust_language(
                    f"Is there a correlation between {col1} and {col2}?",
                    f"Does {col1} drive {col2}?",
                    f"Are {col1} and {col2} related?"
                ),
                "rationale": adjust_language(
                    f"Pearson correlation coefficient is {corr_value:.2f}.",
                    f"Strong relationship detected ({corr_value:.2f}).",
                    f"These two seem to move together."
                ),
                "confidence": "high" if abs(corr_value) > 0.5 else "medium",
                "variables": [col1, col2],
                "test": "Correlation Analysis"
            })

    # --- 4. Outliers/Root Cause (Priority for 'root_cause') ---
    if len(numeric_cols) > 0:
        col = numeric_cols[0]
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        outliers = ((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum()
        
        if outliers > 0:
            confidence = "high" if story_type == 'root_cause' else "medium"
            
            hypotheses.append({
                "type": "anomaly",
                "question": adjust_language(
                    f"What characterizes the anomalies in {col}?",
                    f"What is causing the extreme values in {col}?",
                    f"Why are some {col} values so different?"
                ),
                "rationale": adjust_language(
                    f"Detected {outliers} points beyond 1.5*IQR.",
                    "Outliers often indicate errors or opportunities.",
                    "Unusual values might be interesting."
                ),
                "confidence": confidence,
                "variables": [col],
                "test": "Outlier Analysis"
            })

    # --- 5. Predictive (Priority for 'predictive') ---
    if len(numeric_cols) >= 3:
        target = numeric_cols[0]
        features = numeric_cols[1:4]
        
        confidence = "high" if story_type == 'predictive' else "medium"
        
        hypotheses.append({
            "type": "prediction",
            "question": adjust_language(
                f"Can we model {target} as a function of other variables?",
                f"What factors predict {target}?",
                f"Can we guess {target} based on other data?"
            ),
            "rationale": adjust_language(
                "Multivariate regression feasibility confirmed.",
                "Predictive modeling can forecast future outcomes.",
                "We can use patterns to predict this."
            ),
            "confidence": confidence,
            "variables": [target] + features,
            "test": "Predictive Modeling"
        })

    # Sort by confidence (high first)
    return sorted(hypotheses, key=lambda x: 0 if x['confidence'] == 'high' else 1)


def generate_smart_questions(df: pd.DataFrame, story_title: str, context: str) -> List[str]:
    """Generate context-aware analysis questions"""
    questions = []
    
    # Analyze story keywords
    keywords = story_title.lower() + " " + context.lower()
    
    # Business context questions
    if any(word in keywords for word in ['sales', 'revenue', 'profit', 'customer']):
        questions.extend([
            "What are the key drivers of revenue growth?",
            "Which customer segments are most profitable?",
            "What patterns predict customer churn?",
            "How do seasonal trends affect sales performance?"
        ])
    
    if any(word in keywords for word in ['marketing', 'campaign', 'conversion']):
        questions.extend([
            "Which marketing channels have the highest ROI?",
            "What customer attributes predict conversion?",
            "How does engagement correlate with lifetime value?",
            "Which campaigns drive the most qualified leads?"
        ])
    
    if any(word in keywords for word in ['operations', 'efficiency', 'process']):
        questions.extend([
            "Where are the bottlenecks in the process?",
            "What factors contribute to delays or errors?",
            "How can we optimize resource allocation?",
            "What patterns predict operational failures?"
        ])
    
    if any(word in keywords for word in ['risk', 'fraud', 'compliance']):
        questions.extend([
            "What patterns indicate high-risk behavior?",
            "Which variables are strongest fraud indicators?",
            "How can we improve early warning systems?",
            "What compliance gaps exist in the data?"
        ])
    
    # Data-driven questions based on structure
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if len(numeric_cols) > 0:
        questions.append(f"What drives variation in {numeric_cols[0]}?")
    
    if len(categorical_cols) > 0 and len(numeric_cols) > 0:
        questions.append(f"How does {categorical_cols[0]} impact {numeric_cols[0]}?")
    
    return questions[:6]  # Limit to 6 questions


def discover_correlations(df: pd.DataFrame, threshold: float = 0.5) -> List[Dict]:
    """Discover interesting correlations in the data"""
    discoveries = []
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if len(numeric_cols) < 2:
        return discoveries
    
    corr_matrix = df[numeric_cols].corr()
    
    # Find strong correlations
    for i in range(len(numeric_cols)):
        for j in range(i + 1, len(numeric_cols)):
            corr_value = corr_matrix.iloc[i, j]
            
            if abs(corr_value) >= threshold:
                discoveries.append({
                    "var1": numeric_cols[i],
                    "var2": numeric_cols[j],
                    "correlation": round(corr_value, 3),
                    "strength": "strong" if abs(corr_value) > 0.7 else "moderate",
                    "direction": "positive" if corr_value > 0 else "negative",
                    "insight": f"{numeric_cols[i]} and {numeric_cols[j]} show a {abs(corr_value):.0%} {'positive' if corr_value > 0 else 'negative'} correlation"
                })
    
    return sorted(discoveries, key=lambda x: abs(x['correlation']), reverse=True)[:5]


def generate_recommendations(insights: List[Dict], health_scores: Dict, df: pd.DataFrame) -> List[Dict]:
    """Generate actionable recommendations based on analysis"""
    recommendations = []
    
    # Data quality recommendations
    if health_scores.get('completeness', 100) < 90:
        recommendations.append({
            "category": "Data Quality",
            "priority": "high",
            "action": "Address Missing Data",
            "description": "Consider imputation strategies or investigate root cause of missing values.",
            "impact": "Improves analysis accuracy and model performance"
        })
    
    if health_scores.get('uniqueness', 100) < 95:
        recommendations.append({
            "category": "Data Quality",
            "priority": "medium",
            "action": "Investigate Duplicates",
            "description": "Review duplicate records to ensure data integrity.",
            "impact": "Prevents biased analysis and incorrect conclusions"
        })
    
    # Analysis recommendations based on insights
    high_priority_insights = [i for i in insights if i.get('priority') == 'high']
    
    if len(high_priority_insights) > 0:
        recommendations.append({
            "category": "Analysis",
            "priority": "high",
            "action": "Investigate High-Priority Findings",
            "description": f"{len(high_priority_insights)} critical insights require immediate attention.",
            "impact": "Address key issues and opportunities"
        })
    
    # Advanced analytics recommendations
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if len(numeric_cols) >= 3:
        recommendations.append({
            "category": "Advanced Analytics",
            "priority": "medium",
            "action": "Build Predictive Model",
            "description": "Sufficient features available for machine learning.",
            "impact": "Enable forecasting and proactive decision-making"
        })
    
    # Visualization recommendations
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if len(categorical_cols) > 0 and len(numeric_cols) > 0:
        recommendations.append({
            "category": "Visualization",
            "priority": "low",
            "action": "Create Comparative Dashboards",
            "description": "Build interactive dashboards comparing groups.",
            "impact": "Better communicate insights to stakeholders"
        })
    
    return recommendations


def generate_narrative(story_title: str, insights: List[Dict], health_scores: Dict, 
                       dataset_info: Dict) -> str:
    """Generate AI-written narrative summary"""
    
    # Opening
    narrative = f"## {story_title}\n\n"
    narrative += f"**Dataset Overview:** This analysis examines {dataset_info['rows']:,} records across "
    narrative += f"{dataset_info['columns']} dimensions. "
    
    # Data quality summary
    narrative += f"The data demonstrates {health_scores['overall']:.0f}% overall health, with "
    narrative += f"{health_scores['completeness']:.0f}% completeness and "
    narrative += f"{health_scores['uniqueness']:.0f}% uniqueness.\n\n"
    
    # Key findings
    narrative += "### Key Findings\n\n"
    
    high_priority = [i for i in insights if i.get('priority') == 'high']
    medium_priority = [i for i in insights if i.get('priority') == 'medium']
    
    if high_priority:
        narrative += "**Critical Insights:**\n"
        for idx, insight in enumerate(high_priority[:3], 1):
            narrative += f"{idx}. {insight['title']}: {insight['finding']}\n"
        narrative += "\n"
    
    if medium_priority:
        narrative += "**Notable Patterns:**\n"
        for idx, insight in enumerate(medium_priority[:3], 1):
            narrative += f"{idx}. {insight['title']}: {insight['finding']}\n"
        narrative += "\n"
    
    # Data quality notes
    if dataset_info['duplicates_removed'] > 0:
        narrative += f"**Data Cleaning:** Removed {dataset_info['duplicates_removed']:,} duplicate records, "
        narrative += f"representing {(dataset_info['duplicates_removed']/dataset_info['initial_rows']*100):.1f}% of the original dataset.\n\n"
    
    # Conclusion
    narrative += "### Recommendations\n\n"
    narrative += "Based on this analysis, we recommend:\n"
    narrative += "- Further investigate high-priority findings\n"
    narrative += "- Address any data quality gaps\n"
    narrative += "- Consider advanced analytics for deeper insights\n"
    
    return narrative
