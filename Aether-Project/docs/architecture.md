# Aether Architecture

## Tech Stack
-   **Frontend**: Next.js, Tailwind, Shadcn UI, Chart.js/Plotly, Framer Motion.
-   **Backend**: FastAPI, PyTorch, Pandas/Polars, Scikit-Learn, LangChain.
-   **Database**: SQLite (MVP) / PostgreSQL (Prod).
-   **Storage**: Local Temp (MVP) / S3 (Prod).

## Components

### Frontend (Next.js)
-   **Upload Module**: Secure file dropzone.
-   **Story Interface**: Wizard for defining objectives and selecting Levels (1/2/3).
-   **EDA Dashboard**: Animated, interactive visualizations.
-   **Report Viewer**: "Pit-Stop" and Final reports.
-   **Ethical Alerts**: Real-time warnings for bias/privacy.

### Backend (FastAPI)
-   **Orchestrator**: Manages the lifecycle state (Upload -> Story -> EDA -> Report).
-   **Data Engine**: Pandas/Polars for cleaning and transformation.
-   **ML Engine**: PyTorch for Level 3 modeling.
-   **Guardrails**: Modules for bias detection and privacy checks.
-   **Agentic AI (Antigravity)**: Logic for story suggestions and insight generation.

### Data Flow
1.  **Upload**: File -> Temp Storage (Auto-delete scheduled).
2.  **Story**: User Input -> Metadata DB.
3.  **Processing**: Temp File -> Data Engine -> In-Memory/Temp Results.
4.  **Reporting**: Results -> JSON/PDF Generator -> Frontend.
5.  **Cleanup**: End of Session -> Wipe Temp Files.

## Security & Ethics
-   **Lifecycle Governance**: Strict deletion policies.
-   **Audit Logging**: Metadata only, no raw data logs.
