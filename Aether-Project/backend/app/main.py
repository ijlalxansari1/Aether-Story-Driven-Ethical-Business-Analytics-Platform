from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import db_models
from .routes import upload, story, analysis, report, ml, dataset, ai, project

app = FastAPI(title="Aether Analytics Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
api_router.include_router(upload.router)
api_router.include_router(story.router)
api_router.include_router(analysis.router)
api_router.include_router(report.router)
api_router.include_router(ml.router)
api_router.include_router(dataset.router)
api_router.include_router(ai.router)
api_router.include_router(project.router)

app.include_router(api_router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to Aether Analytics Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
