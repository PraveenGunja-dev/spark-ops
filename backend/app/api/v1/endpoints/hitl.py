"""
HITL (Human-in-the-Loop) API Endpoints
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User, HITLRequest
from app.services.apa.safety_engine import SafetyEngine

router = APIRouter()


@router.get("/hitl/pending")
async def get_pending_hitl_requests(
    limit: int = 50,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get pending HITL requests
    
    Query parameters:
    - limit: Maximum number of requests to return
    - risk_level: Filter by risk level (low, medium, high, critical)
    """
    query = db.query(HITLRequest).filter(HITLRequest.status == "pending")
    
    if risk_level:
        query = query.filter(HITLRequest.risk_level == risk_level)
    
    requests = query.order_by(HITLRequest.requested_at.desc()).limit(limit).all()
    
    return {
        "count": len(requests),
        "requests": [
            {
                "id": str(req.id),
                "run_id": str(req.run_id),
                "agent_id": str(req.agent_id),
                "request_type": req.request_type,
                "reason": req.reason,
                "action_details": req.action_details,
                "risk_level": req.risk_level,
                "status": req.status,
                "requested_at": req.requested_at.isoformat(),
            }
            for req in requests
        ],
    }


@router.get("/hitl/{request_id}")
async def get_hitl_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific HITL request"""
    request = db.query(HITLRequest).filter(HITLRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"HITL request {request_id} not found"
        )
    
    return {
        "id": str(request.id),
        "run_id": str(request.run_id),
        "agent_id": str(request.agent_id),
        "request_type": request.request_type,
        "reason": request.reason,
        "action_details": request.action_details,
        "risk_level": request.risk_level,
        "status": request.status,
        "requested_at": request.requested_at.isoformat(),
        "responded_at": request.responded_at.isoformat() if request.responded_at else None,
        "responded_by_id": str(request.responded_by_id) if request.responded_by_id else None,
        "decision": request.decision,
        "feedback": request.feedback,
    }


@router.post("/hitl/{request_id}/approve")
async def approve_hitl_request(
    request_id: UUID,
    feedback: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Approve a HITL request
    
    Request body (optional):
    {
        "feedback": "Optional feedback message"
    }
    """
    safety_engine = SafetyEngine(db)
    
    try:
        updated_request = await safety_engine.respond_to_hitl_request(
            request_id=request_id,
            user_id=current_user.id,
            decision="approve",
            feedback=feedback.get("feedback") if feedback else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return {
        "id": str(updated_request.id),
        "status": updated_request.status,
        "decision": updated_request.decision,
        "responded_at": updated_request.responded_at.isoformat(),
    }


@router.post("/hitl/{request_id}/reject")
async def reject_hitl_request(
    request_id: UUID,
    feedback: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Reject a HITL request
    
    Request body (optional):
    {
        "feedback": "Optional feedback message explaining rejection"
    }
    """
    safety_engine = SafetyEngine(db)
    
    try:
        updated_request = await safety_engine.respond_to_hitl_request(
            request_id=request_id,
            user_id=current_user.id,
            decision="reject",
            feedback=feedback.get("feedback") if feedback else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    return {
        "id": str(updated_request.id),
        "status": updated_request.status,
        "decision": updated_request.decision,
        "responded_at": updated_request.responded_at.isoformat(),
    }


@router.get("/hitl/stats")
async def get_hitl_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get HITL statistics"""
    from sqlalchemy import func
    
    # Count by status
    status_counts = (
        db.query(HITLRequest.status, func.count(HITLRequest.id))
        .group_by(HITLRequest.status)
        .all()
    )
    
    # Count by risk level
    risk_counts = (
        db.query(HITLRequest.risk_level, func.count(HITLRequest.id))
        .group_by(HITLRequest.risk_level)
        .all()
    )
    
    return {
        "by_status": {status: count for status, count in status_counts},
        "by_risk_level": {risk: count for risk, count in risk_counts},
    }
