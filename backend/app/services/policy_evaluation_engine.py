"""
Policy Evaluation Engine
Evaluates policies and enforces governance rules
"""
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.policy import Policy, PolicyType, PolicyStatus
from app.models.project import Project
from app.services.apa.safety_engine import SafetyEngine

logger = logging.getLogger(__name__)


class PolicyViolation(Exception):
    """Exception raised when a policy is violated"""
    
    def __init__(self, policy: Policy, message: str, severity: str = "medium"):
        self.policy = policy
        self.message = message
        self.severity = severity
        super().__init__(message)


class PolicyEvaluationEngine:
    """
    Evaluates policies and enforces governance rules
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.safety_engine = SafetyEngine(db)
        
    async def evaluate_policies(
        self, 
        project_id: str, 
        action: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Tuple[bool, List[PolicyViolation]]:
        """
        Evaluate all active policies for a project
        
        Args:
            project_id: Project ID to evaluate policies for
            action: Action being performed
            context: Context information
            
        Returns:
            Tuple of (passed, violations) where passed indicates if all policies passed
            and violations is a list of any policy violations
        """
        try:
            # Get all active policies for the project
            result = await self.db.execute(
                select(Policy).where(
                    Policy.project_id == project_id,
                    Policy.status == PolicyStatus.ACTIVE
                )
            )
            policies = result.scalars().all()
            
            violations = []
            passed = True
            
            # Evaluate each policy
            for policy in policies:
                try:
                    policy_passed, violation = await self._evaluate_policy(policy, action, context)
                    if not policy_passed:
                        violations.append(violation)
                        passed = False
                except Exception as e:
                    logger.error(f"Error evaluating policy {policy.id}: {e}")
                    # Continue evaluating other policies even if one fails
            
            return passed, violations
            
        except Exception as e:
            logger.error(f"Error evaluating policies for project {project_id}: {e}")
            raise
            
    async def _evaluate_policy(
        self, 
        policy: Policy, 
        action: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Tuple[bool, Optional[PolicyViolation]]:
        """
        Evaluate a single policy
        
        Args:
            policy: Policy to evaluate
            action: Action being performed
            context: Context information
            
        Returns:
            Tuple of (passed, violation) where passed indicates if the policy passed
            and violation is the violation details if it failed
        """
        try:
            # Route to appropriate evaluator based on policy type
            if policy.type == PolicyType.SAFETY:
                return await self._evaluate_safety_policy(policy, action, context)
            elif policy.type == PolicyType.BUDGET:
                return await self._evaluate_budget_policy(policy, action, context)
            elif policy.type == PolicyType.APPROVAL:
                return await self._evaluate_approval_policy(policy, action, context)
            elif policy.type == PolicyType.COMPLIANCE:
                return await self._evaluate_compliance_policy(policy, action, context)
            else:
                logger.warning(f"Unknown policy type: {policy.type}")
                return True, None
                
        except Exception as e:
            logger.error(f"Error evaluating policy {policy.id}: {e}")
            return False, PolicyViolation(
                policy, 
                f"Error evaluating policy: {str(e)}", 
                "high"
            )
            
    async def _evaluate_safety_policy(
        self, 
        policy: Policy, 
        action: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Tuple[bool, Optional[PolicyViolation]]:
        """
        Evaluate a safety policy using the safety engine
        """
        try:
            # Use the existing safety engine for safety policies
            # This ensures consistency with existing safety mechanisms
            result = await self.safety_engine.validate_action(
                agent=None,  # Agent is not relevant for general safety policies
                action=action,
                context=context
            )
            
            # If the safety engine flags an issue, it's a policy violation
            if not result.get("allowed", True):
                return False, PolicyViolation(
                    policy,
                    result.get("reason", "Safety policy violation"),
                    result.get("risk_level", "medium")
                )
                
            return True, None
            
        except Exception as e:
            logger.error(f"Error evaluating safety policy {policy.id}: {e}")
            return False, PolicyViolation(
                policy,
                f"Error evaluating safety policy: {str(e)}",
                "high"
            )
            
    async def _evaluate_budget_policy(
        self, 
        policy: Policy, 
        action: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Tuple[bool, Optional[PolicyViolation]]:
        """
        Evaluate a budget policy
        """
        try:
            # Get budget configuration
            config = policy.config or {}
            allocated = config.get("allocated", 0)
            spent = config.get("spent", 0)
            alert_threshold = config.get("alert_threshold", 80)
            
            # Calculate current utilization
            utilization = (spent / allocated * 100) if allocated > 0 else 0
            
            # Check if we're over budget
            if utilization > 100:
                return False, PolicyViolation(
                    policy,
                    f"Budget exceeded: {utilization:.1f}% used of {allocated}",
                    "critical"
                )
            
            # Check if we're near the alert threshold
            if utilization > alert_threshold:
                return False, PolicyViolation(
                    policy,
                    f"Budget alert: {utilization:.1f}% used of {allocated}",
                    "high"
                )
                
            # Check if this action would exceed the budget
            estimated_cost = action.get("estimated_cost", 0)
            if spent + estimated_cost > allocated:
                return False, PolicyViolation(
                    policy,
                    f"Action would exceed budget: {spent + estimated_cost} > {allocated}",
                    "high"
                )
                
            return True, None
            
        except Exception as e:
            logger.error(f"Error evaluating budget policy {policy.id}: {e}")
            return False, PolicyViolation(
                policy,
                f"Error evaluating budget policy: {str(e)}",
                "high"
            )
            
    async def _evaluate_approval_policy(
        self, 
        policy: Policy, 
        action: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Tuple[bool, Optional[PolicyViolation]]:
        """
        Evaluate an approval policy
        """
        try:
            # Get approval rules
            rules = policy.rules or []
            
            # Check each rule
            for rule in rules:
                condition = rule.get("condition", "")
                action_type = action.get("type", "")
                
                # Simple condition matching (in a real implementation, this would be more sophisticated)
                if condition in action_type or condition in str(action):
                    # Create HITL request for approval
                    return False, PolicyViolation(
                        policy,
                        f"Approval required for action: {action_type}",
                        "medium"
                    )
                    
            return True, None
            
        except Exception as e:
            logger.error(f"Error evaluating approval policy {policy.id}: {e}")
            return False, PolicyViolation(
                policy,
                f"Error evaluating approval policy: {str(e)}",
                "high"
            )
            
    async def _evaluate_compliance_policy(
        self, 
        policy: Policy, 
        action: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Tuple[bool, Optional[PolicyViolation]]:
        """
        Evaluate a compliance policy
        """
        try:
            # Get compliance rules
            rules = policy.rules or []
            
            # Check each rule
            for rule in rules:
                # Simple compliance check (in a real implementation, this would be more sophisticated)
                required_field = rule.get("required_field")
                if required_field and required_field not in action:
                    return False, PolicyViolation(
                        policy,
                        f"Compliance violation: Missing required field '{required_field}'",
                        "high"
                    )
                    
                # Check for prohibited values
                prohibited_values = rule.get("prohibited_values", [])
                if prohibited_values:
                    field_value = action.get(required_field, "")
                    if field_value in prohibited_values:
                        return False, PolicyViolation(
                            policy,
                            f"Compliance violation: Prohibited value '{field_value}' in field '{required_field}'",
                            "high"
                        )
                        
            return True, None
            
        except Exception as e:
            logger.error(f"Error evaluating compliance policy {policy.id}: {e}")
            return False, PolicyViolation(
                policy,
                f"Error evaluating compliance policy: {str(e)}",
                "high"
            )
            
    async def get_policy_violations(
        self, 
        project_id: str, 
        action: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> List[PolicyViolation]:
        """
        Get all policy violations for an action without blocking it
        
        Args:
            project_id: Project ID to evaluate policies for
            action: Action being performed
            context: Context information
            
        Returns:
            List of policy violations
        """
        try:
            _, violations = await self.evaluate_policies(project_id, action, context)
            return violations
        except Exception as e:
            logger.error(f"Error getting policy violations for project {project_id}: {e}")
            return []