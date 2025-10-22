"""
Safety Engine - Safety guardrails and HITL for APA agents
"""
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Agent, WorkflowExecution, HITLRequest


class SafetyEngine:
    """
    Safety Engine for APA agents
    
    Responsibilities:
    - Validate actions against safety guardrails
    - Detect high-risk operations
    - Create and manage HITL requests
    - Enforce action policies
    """
    
    # Risk levels for different action types
    RISK_LEVELS = {
        "data_deletion": "critical",
        "financial_transaction": "critical",
        "user_communication": "high",
        "data_modification": "medium",
        "data_read": "low",
        "calculation": "low",
    }
    
    # Actions requiring human approval
    REQUIRES_APPROVAL = [
        "data_deletion",
        "financial_transaction",
        "user_communication",
    ]
    
    def __init__(self, db: Session):
        self.db = db
    
    async def validate_action(
        self,
        agent: Agent,
        action: Dict[str, Any],
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Validate an action against safety guardrails
        
        Args:
            agent: The agent attempting the action
            action: The action to validate
            context: Current execution context
        
        Returns:
            Validation result with allowed status and reason
        """
        action_type = action.get("type", "unknown")
        
        # Get agent-specific guardrails
        guardrails = getattr(agent, 'safety_guardrails', {}) or {}
        
        # Determine risk level
        risk_level = self.RISK_LEVELS.get(action_type, "medium")
        
        # Check if action is explicitly blocked
        blocked_actions = guardrails.get("blocked_actions", [])
        if action_type in blocked_actions:
            return {
                "allowed": False,
                "reason": f"Action '{action_type}' is blocked by agent guardrails",
                "risk_level": risk_level,
            }
        
        # Check if action requires human approval
        requires_approval = action_type in self.REQUIRES_APPROVAL
        if requires_approval and not guardrails.get("allow_high_risk", False):
            return {
                "allowed": False,
                "requires_human_approval": True,
                "reason": f"Action '{action_type}' requires human approval",
                "risk_level": risk_level,
            }
        
        # Check custom guardrail conditions
        if "conditions" in guardrails:
            for condition in guardrails["conditions"]:
                if not self._evaluate_condition(condition, action, context):
                    return {
                        "allowed": False,
                        "reason": f"Guardrail condition failed: {condition.get('name', 'unknown')}",
                        "risk_level": risk_level,
                    }
        
        # Action is allowed
        return {
            "allowed": True,
            "risk_level": risk_level,
        }
    
    def _evaluate_condition(
        self,
        condition: Dict[str, Any],
        action: Dict[str, Any],
        context: Dict[str, Any],
    ) -> bool:
        """
        Evaluate a guardrail condition
        
        Args:
            condition: Condition definition
            action: Action being validated
            context: Execution context
        
        Returns:
            True if condition passes, False otherwise
        """
        # TODO: Implement condition evaluation logic
        # This will support various condition types like:
        # - Parameter value checks
        # - Context state checks
        # - Time-based restrictions
        # - Resource limits
        
        return True  # Default to pass for now
    
    async def request_human_approval(
        self,
        agent: Agent,
        execution: WorkflowExecution,
        action: Dict[str, Any],
        reason: str,
        risk_level: str = "high",
    ) -> Dict[str, Any]:
        """
        Create a HITL request for human approval
        
        Args:
            agent: The agent requesting approval
            execution: The workflow execution
            action: The action requiring approval
            reason: Reason for approval request
            risk_level: Risk level (low, medium, high, critical)
        
        Returns:
            HITL request result
        """
        # Create HITL request
        hitl_request = HITLRequest(
            run_id=execution.id,
            agent_id=agent.id,
            request_type="action_approval",
            reason=reason,
            action_details=action,
            risk_level=risk_level,
            status="pending",
            metadata={},
        )
        
        self.db.add(hitl_request)
        self.db.commit()
        self.db.refresh(hitl_request)
        
        # TODO: Send notification to human operators
        # This will integrate with notification service
        
        # For now, auto-reject to prevent blocking
        # In production, this will wait for human response
        return {
            "request_id": str(hitl_request.id),
            "status": "pending",
            "decision": "rejected",  # Auto-reject for development
            "message": "HITL approval required but not yet implemented",
        }
    
    async def get_pending_hitl_requests(
        self,
        limit: int = 50,
    ) -> list:
        """
        Get pending HITL requests
        
        Args:
            limit: Maximum number of requests to return
        
        Returns:
            List of pending HITL requests
        """
        requests = (
            self.db.query(HITLRequest)
            .filter(HITLRequest.status == "pending")
            .order_by(HITLRequest.requested_at.desc())
            .limit(limit)
            .all()
        )
        
        return requests
    
    async def respond_to_hitl_request(
        self,
        request_id: uuid.UUID,
        user_id: uuid.UUID,
        decision: str,
        feedback: Optional[str] = None,
    ) -> HITLRequest:
        """
        Respond to a HITL request
        
        Args:
            request_id: The HITL request ID
            user_id: The user responding to the request
            decision: The decision (approve, reject, modify)
            feedback: Optional feedback message
        
        Returns:
            Updated HITL request
        """
        request = self.db.query(HITLRequest).filter(HITLRequest.id == request_id).first()
        
        if not request:
            raise ValueError(f"HITL request {request_id} not found")
        
        if request.status != "pending":
            raise ValueError(f"HITL request {request_id} is not pending")
        
        # Update request
        request.status = "approved" if decision == "approve" else "rejected"
        request.decision = decision
        request.responded_by_id = user_id
        request.responded_at = datetime.utcnow()
        request.feedback = feedback
        
        self.db.commit()
        self.db.refresh(request)
        
        return request
    
    async def check_rate_limits(
        self,
        agent: Agent,
        action_type: str,
    ) -> Dict[str, Any]:
        """
        Check if agent has exceeded rate limits for an action type
        
        Args:
            agent: The agent to check
            action_type: Type of action
        
        Returns:
            Rate limit check result
        """
        # TODO: Implement rate limiting logic
        # This will track action counts per time window
        
        return {
            "allowed": True,
            "remaining": 100,
            "reset_at": None,
        }
