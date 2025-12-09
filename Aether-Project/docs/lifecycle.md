# Aether Lifecycle & User Stories

## Core Vision
Aether is an ethical, privacy-first, story-driven data analysis and AI insights platform. It empowers analysts to craft narrative-driven data stories with strict privacy governance.

## Core Principles
1.  **Ethical-by-Design**: Fairness checks, bias alerts, transparency.
2.  **Privacy & Data Governance**: Auto-deletion, no permanent storage of raw data.
3.  **Story-Driven Analysis**: User defines context to steer the AI.
4.  **User-Controlled Depth**: Three levels of analysis.

## Analysis Levels
-   **Level 1 — Quick Scan**: Light cleaning → Light EDA → Fast report.
-   **Level 2 — Deep Analysis**: Full cleaning → Full EDA → Feature Engineering → Pit-stop report.
-   **Level 3 — Advanced ML/DL**: PyTorch models → Explainability → Ethical assessment.

## Detailed Lifecycle Flow

### 1. Data Intake & Validation
-   **User**: Uploads CSV, Excel, JSON, or Parquet.
-   **System**: Validates structure, provides auto-corrections.

### 2. Story Definition & Level Selection
-   **User**: Defines objectives, hypotheses, and selects Level (1/2/3).
-   **System**: Stores metadata to steer downstream tasks.

### 3. Ethical & Privacy Activation
-   **System**: Scans for sensitive attributes and proxies. Intensity scales by Level.

### 4. Automated Cleaning
-   **System**: Handles missing values, types, outliers.

### 5. Exploratory Data Analysis (EDA)
-   **System**: Generates dynamic charts, correlations, patterns.
-   **Privacy**: Optional differential privacy.

### 6. Feature Engineering (Level 2+)
-   **System**: Creates derived features.
-   **Ethical Check**: Blocks proxy features.

### 7. Pit-Stop Report
-   **Output**: Professional visual report (PDF).
-   **Decision**: User can stop (Level 1/2) or continue to ML (Level 3).

### 8. ML/DL Modeling (Level 3 Only)
-   **System**: Trains PyTorch models.
-   **Features**: SHAP/LIME explainability, bias scoring.

### 9. Final Report & Deletion
-   **Output**: Executive summary + full breakdown.
-   **System**: Securely deletes all raw and processed data.
