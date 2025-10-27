from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Any
import socketio
import logging
from app.core.security_ws import get_current_user_ws
from app.core.security_ws import UserWithProjects

# Setup logging
logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio)

# Store active connections
active_connections: Dict[str, List[str]] = {}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    try:
        # Extract token from auth and validate user
        token = auth.get('token') if auth else None
        if not token:
            await sio.disconnect(sid)
            return
            
        # Validate token and get user
        user = await get_current_user_ws(token)
        if not user:
            await sio.disconnect(sid)
            return
            
        # Store connection with user info
        user_id = str(user.id)
        if user_id not in active_connections:
            active_connections[user_id] = []
        active_connections[user_id].append(sid)
        
        # Join user to their own room for targeted events
        await sio.enter_room(sid, f"user_{user_id}")
        
        # Join project rooms if user has project access
        for project in user.projects:
            await sio.enter_room(sid, f"project_{project.id}")
            
        logger.info(f"User {user_id} connected with sid {sid}")
    except Exception as e:
        logger.error(f"Error in connect handler: {str(e)}")
        await sio.disconnect(sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    # Remove connection from active_connections
    for user_id, sids in list(active_connections.items()):
        if sid in sids:
            sids.remove(sid)
            if not sids:  # If no more connections for this user
                del active_connections[user_id]
            logger.info(f"Client {sid} disconnected from user {user_id}")
            break

# Event emitters for different update types
async def emit_run_update(run_id: str, project_id: str, data: Dict[str, Any]):
    """Emit run status update to relevant clients"""
    room = f"project_{project_id}"
    await sio.emit('run_update', {'run_id': run_id, 'data': data}, room=room)
    logger.debug(f"Emitted run update for run {run_id} to project {project_id}")

async def emit_agent_health_update(agent_id: str, project_id: str, status: str):
    """Emit agent health status update to relevant clients"""
    room = f"project_{project_id}"
    await sio.emit('agent_health', {'agent_id': agent_id, 'status': status}, room=room)
    logger.debug(f"Emitted agent health update for agent {agent_id} to project {project_id}")

async def emit_activity_feed(project_id: str, activity: Dict[str, Any]):
    """Emit activity feed update to relevant clients"""
    room = f"project_{project_id}"
    await sio.emit('activity', activity, room=room)
    logger.debug(f"Emitted activity update to project {project_id}")

# Router to include in the main app
router = APIRouter()

# Mount the Socket.IO app
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # This is just a fallback for clients that don't use Socket.IO
        # Socket.IO clients will connect through the ASGI app
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        pass