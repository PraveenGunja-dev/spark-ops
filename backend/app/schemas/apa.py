"""
APA Schemas - Request/Response models for APA endpoints
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


# Agent Reasoning Schemas

class AgentReasonRequest(BaseModel):
    """Request to trigger agent reasoning"""
    description: str = Field(..., description="Task description")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Task parameters")
    execution_id: Optional[UUID] = Field(None, description="Existing execution ID to continue")
    max_iterations: Optional[int] = Field(None, description="Override max iterations")


class AgentReasonResponse(BaseModel):
    """Response from agent reasoning"""
    agent_id: str
    execution_id: str
    result: Dict[str, Any]


class ReasoningTraceItem(BaseModel):
    """Individual reasoning trace step"""
    id: str
    run_id: str
    step_index: int
    thought: str
    action: Dict[str, Any]
    observation: Dict[str, Any]
    reflection: Optional[str]
    tokens_used: Optional[int]
    latency_ms: Optional[int]
    created_at: str


class ReasoningTraceResponse(BaseModel):
    """Response with reasoning traces"""
    agent_id: str
    run_id: Optional[str]
    count: int
    traces: List[ReasoningTraceItem]


# Learning Feedback Schemas

class LearningFeedbackRequest(BaseModel):
    """Request to provide learning feedback"""
    task_description: str
    action_taken: Dict[str, Any]
    outcome: str = Field(..., description="success, failure, or partial")
    success: bool
    error_message: Optional[str] = None
    improvement_suggestions: Optional[str] = None


class LearningFeedbackResponse(BaseModel):
    """Response from learning feedback"""
    feedback_id: str
    agent_id: str
    status: str


# Memory Schemas

class AgentMemoryItem(BaseModel):
    """Individual agent memory"""
    id: str
    type: str
    content: str
    importance_score: Optional[float]
    access_count: int
    last_accessed_at: Optional[str]
    created_at: str


class AgentMemoryResponse(BaseModel):
    """Response with agent memories"""
    agent_id: str
    memory_type: Optional[str]
    count: int
    memories: List[AgentMemoryItem]


# HITL Schemas

class HITLRequestItem(BaseModel):
    """Individual HITL request"""
    id: str
    run_id: str
    agent_id: str
    request_type: str
    reason: str
    action_details: Dict[str, Any]
    risk_level: str
    status: str
    requested_at: str
    responded_at: Optional[str] = None
    responded_by_id: Optional[str] = None
    decision: Optional[str] = None
    feedback: Optional[str] = None


class HITLPendingResponse(BaseModel):
    """Response with pending HITL requests"""
    count: int
    requests: List[HITLRequestItem]


class HITLFeedbackRequest(BaseModel):
    """Request to respond to HITL"""
    feedback: Optional[str] = None


class HITLResponseResponse(BaseModel):
    """Response from HITL action"""
    id: str
    status: str
    decision: str
    responded_at: str


class HITLStatsResponse(BaseModel):
    """HITL statistics"""
    by_status: Dict[str, int]
    by_risk_level: Dict[str, int]


# Tool Execution Schemas

class ToolExecutionRequest(BaseModel):
    """Request to execute a tool"""
    tool_name: str
    parameters: Dict[str, Any]


class ToolExecutionResponse(BaseModel):
    """Response from tool execution"""
    status: str
    tool: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
