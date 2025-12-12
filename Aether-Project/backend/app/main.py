from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import db_models
from .routes import upload, story, analysis, report, ml, dataset, ai, project

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aether Analytics Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(story.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(dataset.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(project.router, prefix="/api")

@app.get("/")
async def read_root():
    return {"message": "Welcome to Aether Analytics Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
