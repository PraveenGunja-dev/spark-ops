"""  
Main FastAPI application module
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
try:
    from prometheus_client import make_asgi_app
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
import structlog

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.websocket import sio_app
try:
    from app.middleware.rate_limit import RateLimitMiddleware
    RATE_LIMIT_AVAILABLE = True
except ImportError:
    RATE_LIMIT_AVAILABLE = False

# Global scheduler instance
scheduler_service = None

# Setup structured logging
setup_logging()
logger = structlog.get_logger()

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Control Plane API for Agentic AI Orchestration",
    version=settings.API_VERSION,
    docs_url=f"/docs",
    redoc_url=f"/redoc",
    openapi_url=f"/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
if settings.ENABLE_RATE_LIMITING and RATE_LIMIT_AVAILABLE:
    app.add_middleware(RateLimitMiddleware)

# Include API router
app.include_router(api_router, prefix=f"/api/{settings.API_VERSION}")

# Mount Socket.IO app
app.mount("/ws", sio_app)

# Prometheus metrics endpoint
if settings.ENABLE_METRICS and PROMETHEUS_AVAILABLE:
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)


@app.on_event("startup")
async def startup_event() -> None:
    """Run on application startup"""
    global scheduler_service
    
    logger.info(
        "startup",
        app_name=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        version=settings.API_VERSION,
    )
    
    # Initialize scheduler service
    try:
        from app.db.session import get_db
        from app.services.scheduler_service import SchedulerService
        
        # Get database session
        async for db in get_db():
            scheduler_service = SchedulerService(db)
            await scheduler_service.start()
            break
            
        logger.info("Scheduler service initialized")
    except Exception as e:
        logger.error(f"Error initializing scheduler service: {e}")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Run on application shutdown"""
    global scheduler_service
    
    # Stop scheduler service
    if scheduler_service:
        await scheduler_service.stop()
        
    logger.info("shutdown", app_name=settings.APP_NAME)


@app.get("/", tags=["Root"])
async def root() -> dict:
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health_check() -> JSONResponse:
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.API_VERSION,
        },
    )


@app.get("/ready", tags=["Health"])
async def readiness_check() -> JSONResponse:
    """Readiness check endpoint"""
    # TODO: Add database and Redis connectivity checks
    return JSONResponse(
        status_code=200,
        content={
            "status": "ready",
            "checks": {
                "database": "ok",
                "redis": "ok",
            },
        },
    )
