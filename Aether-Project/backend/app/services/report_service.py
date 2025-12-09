from sqlalchemy.orm import Session
from .analysis_service import perform_analysis
from ..models import db_models

def generate_report(story_id: int, db: Session) -> str:
    # 1. Get Analysis Data
    analysis = perform_analysis(story_id, db)
    story = db.query(db_models.Story).filter(db_models.Story.id == story_id).first()
    
    # 2. Format HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Aether Insight Report</title>
        <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }}
            .header {{ text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }}
            .logo {{ color: #4F46E5; font-weight: bold; font-size: 24px; }}
            h1 {{ font-size: 32px; margin-bottom: 10px; }}
            h2 {{ color: #4F46E5; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; }}
            .metric-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }}
            .metric-card {{ background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }}
            .metric-val {{ font-size: 24px; font-weight: bold; color: #111; }}
            .metric-label {{ font-size: 14px; color: #666; }}
            .table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
            .table th, .table td {{ text-align: left; padding: 12px; border-bottom: 1px solid #eee; }}
            .footer {{ margin-top: 50px; text-align: center; font-size: 12px; color: #999; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">Aether Analytics</div>
            <h1>{story.title}</h1>
            <p>{story.business_objective}</p>
            <p style="color: #666; font-size: 14px;">Generated on {story.created_at.strftime('%Y-%m-%d')}</p>
        </div>

        <h2>1. Data Overview</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-val">{analysis['dataset_info']['rows']}</div>
                <div class="metric-label">Total Rows</div>
            </div>
            <div class="metric-card">
                <div class="metric-val">{analysis['dataset_info']['columns']}</div>
                <div class="metric-label">Columns</div>
            </div>
            <div class="metric-card">
                <div class="metric-val">{analysis['dataset_info']['duplicates_removed']}</div>
                <div class="metric-label">Duplicates Removed</div>
            </div>
        </div>

        <h2>2. Data Quality</h2>
        <p>Missing values detected and imputed:</p>
        <table class="table">
            <thead>
                <tr><th>Column</th><th>Missing Count</th></tr>
            </thead>
            <tbody>
    """
    
    if not analysis['dataset_info']['missing_values']:
        html_content += "<tr><td colspan='2'>No missing values found.</td></tr>"
    else:
        for col, count in analysis['dataset_info']['missing_values'].items():
            html_content += f"<tr><td>{col}</td><td>{count}</td></tr>"

    html_content += """
            </tbody>
        </table>

        <h2>3. Key Statistics</h2>
        <table class="table">
            <thead>
                <tr><th>Column</th><th>Mean</th><th>Min</th><th>Max</th></tr>
            </thead>
            <tbody>
    """
    
    stats = analysis['summary_stats']
    # Iterate over columns that have 'mean' in stats (numeric)
    for col in stats:
        if 'mean' in stats[col]:
            html_content += f"""
            <tr>
                <td>{col}</td>
                <td>{stats[col]['mean']:.2f}</td>
                <td>{stats[col]['min']:.2f}</td>
                <td>{stats[col]['max']:.2f}</td>
            </tr>
            """

    html_content += """
            </tbody>
        </table>

        <h2>4. Ethical Assessment & Recommendations</h2>
        <p>Based on the analysis of sensitive columns and fairness metrics:</p>
        
        <div class="metric-grid">
    """
    
    if 'fairness_scores' in analysis and analysis['fairness_scores']:
        for col, score in analysis['fairness_scores'].items():
            color = "#10B981" if score >= 80 else "#F59E0B" if score >= 50 else "#EF4444"
            html_content += f"""
            <div class="metric-card" style="border-top: 4px solid {color}">
                <div class="metric-val" style="color: {color}">{score}%</div>
                <div class="metric-label">Fairness Score: {col}</div>
            </div>
            """
    else:
        html_content += "<p>No sensitive columns detected for fairness analysis.</p>"
        
    html_content += """
        </div>
        
        <h3>Actionable Recommendations</h3>
        <ul>
    """
    
    # Recommendations Logic
    if analysis['dataset_info']['missing_values']:
        html_content += "<li><strong>Data Quality:</strong> High missing values detected. Consider investigating data collection pipeline.</li>"
    
    if 'fairness_scores' in analysis:
        for col, score in analysis['fairness_scores'].items():
            if score < 80:
                html_content += f"<li><strong>Bias Mitigation:</strong> The '{col}' column shows potential representation bias (Score: {score}%). Consider oversampling underrepresented groups or collecting more diverse data.</li>"
                
    if analysis.get('pii_warnings'):
        html_content += "<li><strong>Privacy:</strong> PII detected. Ensure all sensitive fields are anonymized before sharing this report.</li>"

    html_content += """
        </ul>

        <div class="footer">
            Generated by Aether Analytics Platform • Ethical AI • Privacy First
        </div>
    </body>
    </html>
    """
    
    return html_content
