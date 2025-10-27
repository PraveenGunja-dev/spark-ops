"""WebSocket Service

This service provides methods to emit real-time updates to connected clients
via WebSocket connections.
"""

from typing import Dict, Any, Optional
import logging
from app.api.websocket import emit_run_update, emit_agent_health_update, emit_activity_feed

logger = logging.getLogger(__name__)

class WebSocketService:
    """Service for emitting WebSocket events"""
    
    @staticmethod
    async def emit_run_update(run_id: str, project_id: str, data: Dict[str, Any]) -> None:
        """Emit run status update to clients
        
        Args:
            run_id: ID of the run
            project_id: ID of the project
            data: Run data to emit
        """
        try:
            await emit_run_update(run_id, project_id, data)
            logger.debug(f"Emitted run update for run {run_id}")
        except Exception as e:
            logger.error(f"Error emitting run update: {str(e)}")
    
    @staticmethod
    async def emit_agent_health_update(agent_id: str, project_id: str, status: str) -> None:
        """Emit agent health status update to clients
        
        Args:
            agent_id: ID of the agent
            project_id: ID of the project
            status: Health status (healthy, degraded, unhealthy)
        """
        try:
            await emit_agent_health_update(agent_id, project_id, status)
            logger.debug(f"Emitted agent health update for agent {agent_id}")
        except Exception as e:
            logger.error(f"Error emitting agent health update: {str(e)}")
    
    @staticmethod
    async def emit_activity(project_id: str, activity_type: str, data: Dict[str, Any]) -> None:
        """Emit activity feed update to clients
        
        Args:
            project_id: ID of the project
            activity_type: Type of activity (e.g., run_created, agent_updated)
            data: Activity data to emit
        """
        try:
            activity = {
                "type": activity_type,
                "timestamp": data.get("timestamp"),
                "data": data
            }
            await emit_activity_feed(project_id, activity)
            logger.debug(f"Emitted {activity_type} activity for project {project_id}")
        except Exception as e:
            logger.error(f"Error emitting activity: {str(e)}")