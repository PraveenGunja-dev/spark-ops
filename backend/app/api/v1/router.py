"""
Main API router for version 1
"""
from fastapi import APIRouter

# Import endpoint routers
from app.api.v1.endpoints import auth, projects, agents, tools, workflows, runs

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
api_router.include_router(tools.router, prefix="/tools", tags=["Tools"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(runs.router, prefix="/runs", tags=["Runs"])

# TODO: Add more routers as they are created
# api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
# api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
# api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
# api_router.include_router(runs.router, prefix="/runs", tags=["Runs"])


@api_router.get("/", tags=["API Info"])
async def api_info():
    """API version information"""
    return {
        "version": "v1",
        "status": "active",
        "endpoints": {
            "authentication": "/auth",
            "projects": "/projects",
            "agents": "/agents",
            "workflows": "/workflows",
            "runs": "/runs",
            "tools": "/tools",
            "schedules": "/schedules",
            "policies": "/policies",
        },
    }
