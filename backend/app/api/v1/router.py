"""
Main API router for version 1
"""
from fastapi import APIRouter

# Import endpoint routers
from app.api.v1.endpoints import auth, projects, agents, tools, workflows, runs, apa, hitl, workflow_execution, analytics, templates, schedules, policies, collaborations

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
api_router.include_router(tools.router, prefix="/tools", tags=["Tools"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(runs.router, prefix="/runs", tags=["Runs"])

# APA (Agentic Process Automation) endpoints
api_router.include_router(apa.router, prefix="/apa", tags=["APA - Agent Reasoning"])
api_router.include_router(hitl.router, prefix="/apa", tags=["APA - Human-in-the-Loop"])
api_router.include_router(workflow_execution.router, prefix="", tags=["Workflow Execution"])

# Collaboration endpoints
api_router.include_router(collaborations.router, prefix="/apa", tags=["APA - Multi-Agent Collaboration"])

# Analytics endpoints
api_router.include_router(analytics.router, prefix="", tags=["Analytics"])

# Templates endpoints
api_router.include_router(templates.router, prefix="", tags=["Templates"])

# Schedules endpoints
api_router.include_router(schedules.router, prefix="/schedules", tags=["Schedules"])

# Policies endpoints
api_router.include_router(policies.router, prefix="/policies", tags=["Policies"])

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
            "tools": "/tools",
            "workflows": "/workflows",
            "runs": "/runs",
            "apa": "/apa",
            "schedules": "/schedules",
            "policies": "/policies",
        },
    }
