"""
Analytics API Endpoints
Provides aggregated metrics and insights from workflow executions
"""
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.api.deps import get_db, get_current_user
from app.models import User, WorkflowExecution, WorkflowStep, Agent, Tool

router = APIRouter()


def get_time_range_filter(time_range: str):
    """Convert time_range string to datetime filter"""
    now = datetime.utcnow()
    
    if time_range == "1d":
        start_time = now - timedelta(days=1)
    elif time_range == "7d":
        start_time = now - timedelta(days=7)
    elif time_range == "30d":
        start_time = now - timedelta(days=30)
    elif time_range == "90d":
        start_time = now - timedelta(days=90)
    else:
        start_time = now - timedelta(days=7)  # Default to 7 days
    
    return start_time


@router.get("/analytics/latency")
async def get_latency_analytics(
    time_range: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
    interval: str = Query("hour", regex="^(hour|day)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get latency distribution over time
    
    Query Parameters:
    - time_range: 1d, 7d, 30d, 90d (default: 7d)
    - interval: hour, day (default: hour)
    
    Returns:
    {
      "data": [
        {"time": "00:00", "latency": 420, "count": 12},
        ...
      ]
    }
    """
    start_time = get_time_range_filter(time_range)
    
    # Query workflow executions with latency data
    query = db.query(
        WorkflowExecution.started_at,
        WorkflowExecution.duration_ms,
    ).filter(
        and_(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.status == "succeeded",
            WorkflowExecution.duration_ms.isnot(None)
        )
    )
    
    results = query.all()
    
    # Aggregate by interval
    data_points = {}
    
    for execution in results:
        if interval == "hour":
            time_key = execution.started_at.strftime("%H:00")
        else:  # day
            time_key = execution.started_at.strftime("%a")
        
        if time_key not in data_points:
            data_points[time_key] = {"latencies": [], "count": 0}
        
        data_points[time_key]["latencies"].append(execution.duration_ms)
        data_points[time_key]["count"] += 1
    
    # Calculate averages
    data = []
    for time_key, values in sorted(data_points.items()):
        avg_latency = sum(values["latencies"]) / len(values["latencies"]) if values["latencies"] else 0
        data.append({
            "time": time_key,
            "latency": round(avg_latency, 2),
            "count": values["count"]
        })
    
    return {"data": data}


@router.get("/analytics/cost")
async def get_cost_analytics(
    time_range: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
    interval: str = Query("day", regex="^(hour|day)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get cost breakdown over time
    
    Returns:
    {
      "data": [
        {"day": "Mon", "cost": 125.4, "runs": 42},
        ...
      ]
    }
    """
    start_time = get_time_range_filter(time_range)
    
    query = db.query(
        WorkflowExecution.started_at,
        WorkflowExecution.tokens_prompt,
        WorkflowExecution.tokens_completion,
        WorkflowExecution.usd_cost,
    ).filter(
        and_(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.status == "succeeded"
        )
    )
    
    results = query.all()
    
    # Aggregate by day
    data_points = {}
    
    for execution in results:
        if interval == "hour":
            time_key = execution.started_at.strftime("%H:00")
        else:  # day
            time_key = execution.started_at.strftime("%a")
        
        if time_key not in data_points:
            data_points[time_key] = {"cost": 0, "runs": 0}
        
        data_points[time_key]["cost"] += execution.usd_cost or 0
        data_points[time_key]["runs"] += 1
    
    data = []
    for time_key, values in sorted(data_points.items()):
        data.append({
            "day" if interval == "day" else "hour": time_key,
            "cost": round(values["cost"], 2),
            "runs": values["runs"]
        })
    
    return {"data": data}


@router.get("/analytics/models")
async def get_model_usage_analytics(
    time_range: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get model usage statistics
    
    Returns:
    {
      "data": [
        {"model": "gpt-4o", "usage": 45, "cost": 120.5},
        ...
      ]
    }
    """
    start_time = get_time_range_filter(time_range)
    
    # Query agents and their executions
    query = db.query(
        Agent.model,
        func.count(WorkflowExecution.id).label("usage"),
        func.sum(WorkflowExecution.usd_cost).label("cost")
    ).join(
        WorkflowExecution,
        WorkflowExecution.metadata_["agent_id"].astext == Agent.id.cast(db.String)
    ).filter(
        and_(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.status == "succeeded"
        )
    ).group_by(Agent.model)
    
    results = query.all()
    
    data = [
        {
            "model": result.model or "unknown",
            "usage": result.usage or 0,
            "cost": round(result.cost or 0, 2)
        }
        for result in results
    ]
    
    return {"data": data}


@router.get("/analytics/tools")
async def get_tool_utilization_analytics(
    time_range: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get tool usage statistics
    
    Returns:
    {
      "data": [
        {"tool": "HTTP", "usage": 1200, "success": 98.2},
        ...
      ]
    }
    """
    start_time = get_time_range_filter(time_range)
    
    # Query workflow steps by tool
    query = db.query(
        WorkflowStep.name,
        func.count(WorkflowStep.id).label("usage"),
        func.sum(func.cast(WorkflowStep.success, db.Integer)).label("successes")
    ).join(
        WorkflowExecution,
        WorkflowStep.execution_id == WorkflowExecution.id
    ).filter(
        and_(
            WorkflowExecution.started_at >= start_time,
            WorkflowStep.type == "tool"
        )
    ).group_by(WorkflowStep.name)
    
    results = query.all()
    
    data = []
    for result in results:
        success_rate = (result.successes / result.usage * 100) if result.usage > 0 else 0
        data.append({
            "tool": result.name or "unknown",
            "usage": result.usage or 0,
            "success": round(success_rate, 1)
        })
    
    return {"data": data}


@router.get("/analytics/throughput")
async def get_throughput_analytics(
    time_range: str = Query("24h", regex="^(24h|7d|30d)$"),
    interval: str = Query("hour", regex="^(hour|day)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get throughput over time (runs processed and errors)
    
    Returns:
    {
      "data": [
        {"time": "00:00", "throughput": 12, "errors": 2},
        ...
      ]
    }
    """
    # Convert time_range
    if time_range == "24h":
        start_time = datetime.utcnow() - timedelta(hours=24)
    else:
        start_time = get_time_range_filter(time_range.replace("h", "d"))
    
    query = db.query(
        WorkflowExecution.started_at,
        WorkflowExecution.status,
    ).filter(
        WorkflowExecution.started_at >= start_time
    )
    
    results = query.all()
    
    # Aggregate by interval
    data_points = {}
    
    for execution in results:
        if interval == "hour":
            time_key = execution.started_at.strftime("%H:00")
        else:  # day
            time_key = execution.started_at.strftime("%a")
        
        if time_key not in data_points:
            data_points[time_key] = {"throughput": 0, "errors": 0}
        
        data_points[time_key]["throughput"] += 1
        if execution.status in ["failed", "error"]:
            data_points[time_key]["errors"] += 1
    
    data = []
    for time_key, values in sorted(data_points.items()):
        data.append({
            "time": time_key,
            "throughput": values["throughput"],
            "errors": values["errors"]
        })
    
    return {"data": data}


@router.get("/analytics/summary")
async def get_analytics_summary(
    time_range: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get overall analytics summary
    
    Returns:
    {
      "total_runs": 1250,
      "success_rate": 96.5,
      "total_cost": 1254.75,
      "avg_latency": 420,
      "active_agents": 12,
      "total_tokens": 5250000
    }
    """
    start_time = get_time_range_filter(time_range)
    
    # Total runs
    total_runs = db.query(func.count(WorkflowExecution.id)).filter(
        WorkflowExecution.started_at >= start_time
    ).scalar() or 0
    
    # Success rate
    successful_runs = db.query(func.count(WorkflowExecution.id)).filter(
        and_(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.status == "succeeded"
        )
    ).scalar() or 0
    
    success_rate = (successful_runs / total_runs * 100) if total_runs > 0 else 0
    
    # Total cost and tokens
    cost_tokens = db.query(
        func.sum(WorkflowExecution.usd_cost),
        func.sum(WorkflowExecution.tokens_prompt),
        func.sum(WorkflowExecution.tokens_completion)
    ).filter(
        and_(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.status == "succeeded"
        )
    ).first()
    
    total_cost = cost_tokens[0] or 0
    total_tokens = (cost_tokens[1] or 0) + (cost_tokens[2] or 0)
    
    # Average latency
    avg_latency = db.query(
        func.avg(WorkflowExecution.duration_ms)
    ).filter(
        and_(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.status == "succeeded",
            WorkflowExecution.duration_ms.isnot(None)
        )
    ).scalar() or 0
    
    # Active agents
    active_agents = db.query(func.count(Agent.id)).filter(
        Agent.health == "healthy"
    ).scalar() or 0
    
    return {
        "total_runs": total_runs,
        "success_rate": round(success_rate, 1),
        "total_cost": round(total_cost, 2),
        "avg_latency": round(avg_latency, 2),
        "active_agents": active_agents,
        "total_tokens": int(total_tokens)
    }
