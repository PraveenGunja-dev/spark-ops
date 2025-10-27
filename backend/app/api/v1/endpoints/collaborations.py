"""
Multi-Agent Collaboration API Endpoints
Manages collaboration sessions between agents
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.collaboration import MultiAgentCollaboration
from app.services.apa.collaboration_manager import CollaborationManager
from app.services.apa.context_manager import ContextManager
from app.services.apa.vector_store import VectorStore

router = APIRouter()


# Request/Response Models
class CollaborationCreate(BaseModel):
    """Request model for creating a collaboration session"""
    run_id: UUID = Field(..., description="Workflow execution ID")
    coordinator_agent_id: UUID = Field(..., description="Agent coordinating the collaboration")
    participant_agent_ids: List[UUID] = Field(..., description="List of participating agent IDs")
    collaboration_type: str = Field(..., description="Type of collaboration: sequential, parallel, hierarchical")
    initial_context: Optional[Dict[str, Any]] = Field(None, description="Initial shared context")


class SimilaritySearch(BaseModel):
    """Request model for finding similar collaborations"""
    context_query: str = Field(..., description="Query text to match against collaboration contexts")
    limit: int = Field(5, description="Maximum number of results to return")
    filter_metadata: Optional[Dict[str, Any]] = Field(None, description="Optional metadata filters")


class MessageCreate(BaseModel):
    """Request model for adding a message to collaboration"""
    from_agent_id: UUID = Field(..., description="Agent sending the message")
    content: str = Field(..., description="Message content")
    to_agent_id: Optional[UUID] = Field(None, description="Recipient agent (None for broadcast)")
    message_type: str = Field("message", description="Type of message: message, question, response, etc.")


class ContextUpdate(BaseModel):
    """Request model for updating shared context"""
    context_updates: Dict[str, Any] = Field(..., description="Context updates to merge")
    agent_id: Optional[UUID] = Field(None, description="Agent making the update")


class CollaborationComplete(BaseModel):
    """Request model for completing a collaboration"""
    status: str = Field("completed", description="Final status: completed, failed")
    output: Optional[Dict[str, Any]] = Field(None, description="Output data to store")
    summary: Optional[str] = Field(None, description="Summary of the collaboration for memory storage")


class CollaborationResponse(BaseModel):
    """Response model for collaboration operations"""
    id: UUID
    run_id: UUID
    coordinator_agent_id: UUID
    participant_agent_ids: List[UUID]
    collaboration_type: str
    status: str
    shared_context: Dict[str, Any]
    created_at: str
    completed_at: Optional[str] = None


class SimilarCollaborationResponse(BaseModel):
    """Response model for similar collaborations"""
    collaboration: CollaborationResponse
    similarity_score: float
    summary: Optional[str] = None


class MessageResponse(BaseModel):
    """Response model for messages"""
    timestamp: str
    type: str
    from_agent_id: str
    from_agent_name: Optional[str] = None
    to_agent_id: Optional[str] = None
    to_agent_name: Optional[str] = None
    content: str


# Helper function to get collaboration manager
def get_collaboration_manager(db: Session = Depends(get_db)) -> CollaborationManager:
    """Get collaboration manager instance with dependencies"""
    # Use pgvector if available, fall back to chromadb
    store_type = "pgvector" if db else "chromadb"
    vector_store = VectorStore(store_type=store_type, db_session=db)
    context_manager = ContextManager(db, vector_store=vector_store)
    
    return CollaborationManager(
        db=db,
        context_manager=context_manager,
        vector_store=vector_store,
    )


@router.post("/collaborations", response_model=CollaborationResponse)
async def create_collaboration(
    request: CollaborationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> CollaborationResponse:
    """Create a new multi-agent collaboration session"""
    try:
        collaboration = await collaboration_manager.create_collaboration(
            run_id=request.run_id,
            coordinator_agent_id=request.coordinator_agent_id,
            participant_agent_ids=request.participant_agent_ids,
            collaboration_type=request.collaboration_type,
            initial_context=request.initial_context,
        )
        
        return CollaborationResponse(
            id=collaboration.id,
            run_id=collaboration.run_id,
            coordinator_agent_id=collaboration.coordinator_agent_id,
            participant_agent_ids=collaboration.participant_agent_ids,
            collaboration_type=collaboration.collaboration_type,
            status=collaboration.status,
            shared_context=collaboration.shared_context,
            created_at=collaboration.created_at.isoformat(),
            completed_at=collaboration.completed_at.isoformat() if collaboration.completed_at else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create collaboration: {str(e)}",
        )


@router.get("/collaborations/{collaboration_id}", response_model=CollaborationResponse)
async def get_collaboration(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> CollaborationResponse:
    """Get a collaboration session by ID"""
    collaboration = await collaboration_manager.get_collaboration(collaboration_id)
    if not collaboration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collaboration {collaboration_id} not found",
        )
    
    return CollaborationResponse(
        id=collaboration.id,
        run_id=collaboration.run_id,
        coordinator_agent_id=collaboration.coordinator_agent_id,
        participant_agent_ids=collaboration.participant_agent_ids,
        collaboration_type=collaboration.collaboration_type,
        status=collaboration.status,
        shared_context=collaboration.shared_context,
        created_at=collaboration.created_at.isoformat(),
        completed_at=collaboration.completed_at.isoformat() if collaboration.completed_at else None,
    )


@router.get("/runs/{run_id}/collaborations", response_model=List[CollaborationResponse])
async def get_run_collaborations(
    run_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> List[CollaborationResponse]:
    """Get all active collaboration sessions for a run"""
    collaborations = await collaboration_manager.get_active_collaborations_for_run(run_id)
    
    return [
        CollaborationResponse(
            id=collab.id,
            run_id=collab.run_id,
            coordinator_agent_id=collab.coordinator_agent_id,
            participant_agent_ids=collab.participant_agent_ids,
            collaboration_type=collab.collaboration_type,
            status=collab.status,
            shared_context=collab.shared_context,
            created_at=collab.created_at.isoformat(),
            completed_at=collab.completed_at.isoformat() if collab.completed_at else None,
        )
        for collab in collaborations
    ]


@router.post("/collaborations/search", response_model=List[SimilarCollaborationResponse])
async def find_similar_collaborations(
    request: SimilaritySearch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> List[SimilarCollaborationResponse]:
    """Find similar collaborations based on context similarity"""
    try:
        similar_collaborations = await collaboration_manager.find_similar_collaborations(
            context_query=request.context_query,
            limit=request.limit,
            filter_metadata=request.filter_metadata,
        )
        
        return [
            SimilarCollaborationResponse(
                collaboration=CollaborationResponse(
                    id=result["collaboration"].id,
                    run_id=result["collaboration"].run_id,
                    coordinator_agent_id=result["collaboration"].coordinator_agent_id,
                    participant_agent_ids=result["collaboration"].participant_agent_ids,
                    collaboration_type=result["collaboration"].collaboration_type,
                    status=result["collaboration"].status,
                    shared_context=result["collaboration"].shared_context,
                    created_at=result["collaboration"].created_at.isoformat(),
                    completed_at=result["collaboration"].completed_at.isoformat() if result["collaboration"].completed_at else None,
                ),
                similarity_score=result["similarity_score"],
                summary=result["summary"],
            )
            for result in similar_collaborations
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search for similar collaborations: {str(e)}",
        )


@router.post("/collaborations/{collaboration_id}/messages", response_model=CollaborationResponse)
async def add_message(
    collaboration_id: UUID,
    request: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> CollaborationResponse:
    """Add a message to the collaboration communication log"""
    try:
        collaboration = await collaboration_manager.add_message(
            collaboration_id=collaboration_id,
            from_agent_id=request.from_agent_id,
            content=request.content,
            to_agent_id=request.to_agent_id,
            message_type=request.message_type,
        )
        
        return CollaborationResponse(
            id=collaboration.id,
            run_id=collaboration.run_id,
            coordinator_agent_id=collaboration.coordinator_agent_id,
            participant_agent_ids=collaboration.participant_agent_ids,
            collaboration_type=collaboration.collaboration_type,
            status=collaboration.status,
            shared_context=collaboration.shared_context,
            created_at=collaboration.created_at.isoformat(),
            completed_at=collaboration.completed_at.isoformat() if collaboration.completed_at else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add message: {str(e)}",
        )


@router.get("/collaborations/{collaboration_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    collaboration_id: UUID,
    agent_id: Optional[UUID] = None,
    message_types: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> List[MessageResponse]:
    """Get messages from the collaboration communication log"""
    try:
        # Parse message_types if provided
        message_types_list = None
        if message_types:
            message_types_list = [t.strip() for t in message_types.split(",")]
        
        messages = await collaboration_manager.get_messages(
            collaboration_id=collaboration_id,
            agent_id=agent_id,
            message_types=message_types_list,
            limit=limit,
        )
        
        return [MessageResponse(**msg) for msg in messages]
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}",
        )


@router.put("/collaborations/{collaboration_id}/context", response_model=CollaborationResponse)
async def update_context(
    collaboration_id: UUID,
    request: ContextUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> CollaborationResponse:
    """Update the shared context for a collaboration session"""
    try:
        collaboration = await collaboration_manager.update_shared_context(
            collaboration_id=collaboration_id,
            context_updates=request.context_updates,
            agent_id=request.agent_id,
        )
        
        return CollaborationResponse(
            id=collaboration.id,
            run_id=collaboration.run_id,
            coordinator_agent_id=collaboration.coordinator_agent_id,
            participant_agent_ids=collaboration.participant_agent_ids,
            collaboration_type=collaboration.collaboration_type,
            status=collaboration.status,
            shared_context=collaboration.shared_context,
            created_at=collaboration.created_at.isoformat(),
            completed_at=collaboration.completed_at.isoformat() if collaboration.completed_at else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update context: {str(e)}",
        )


@router.put("/collaborations/{collaboration_id}/complete", response_model=CollaborationResponse)
async def complete_collaboration(
    collaboration_id: UUID,
    request: CollaborationComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collaboration_manager: CollaborationManager = Depends(get_collaboration_manager),
) -> CollaborationResponse:
    """Mark a collaboration session as completed"""
    try:
        collaboration = await collaboration_manager.complete_collaboration(
            collaboration_id=collaboration_id,
            status=request.status,
            output=request.output,
        )
        
        # Store collaboration memory if summary provided
        if request.summary:
            await collaboration_manager.store_collaboration_memory(
                collaboration_id=collaboration_id,
                summary=request.summary,
            )
        
        return CollaborationResponse(
            id=collaboration.id,
            run_id=collaboration.run_id,
            coordinator_agent_id=collaboration.coordinator_agent_id,
            participant_agent_ids=collaboration.participant_agent_ids,
            collaboration_type=collaboration.collaboration_type,
            status=collaboration.status,
            shared_context=collaboration.shared_context,
            created_at=collaboration.created_at.isoformat(),
            completed_at=collaboration.completed_at.isoformat() if collaboration.completed_at else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete collaboration: {str(e)}",
        )