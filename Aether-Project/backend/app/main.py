from fastapi import FastAPI, APIRouter, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, get_db
from .models import db_models
from .routes import upload, story, analysis, report, ml, dataset, ai, project
from sqlalchemy.orm import Session
from fastapi import Depends
from .services import project_service
from .routes.project import ProjectCreate

app = FastAPI(title="Aether Analytics Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global OPTIONS handler to fix 405 on preflight
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return Response(status_code=200)

# FORCE FIX: Direct route to bypass potential Router/Vercel prefix issues
@app.post("/api/projects")
@app.post("/projects") 
@app.post("/")
@app.post("/api")
def create_project_direct(project_in: ProjectCreate, db: Session = Depends(get_db)):
    return project_service.create_project(
        title=project_in.title,
        objective=project_in.objective,
        stakeholders=project_in.stakeholders,
        ethical_constraints=project_in.ethical_constraints,
        db=db
    )

api_router = APIRouter()
api_router.include_router(upload.router)
api_router.include_router(story.router)
api_router.include_router(analysis.router)
api_router.include_router(report.router)
api_router.include_router(ml.router)
api_router.include_router(dataset.router)
api_router.include_router(ai.router)
api_router.include_router(project.router)

# Double-mount to handle both Local and Vercel path stripping cases
app.include_router(api_router, prefix="/api")
app.include_router(api_router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to Aether Analytics Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
