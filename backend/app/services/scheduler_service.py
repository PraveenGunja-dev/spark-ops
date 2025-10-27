"""
Scheduler Service
Handles cron-based workflow scheduling and execution
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import aiohttp
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.models.schedule import Schedule, ScheduleStatus
from app.models.workflow import Workflow
from app.core.config import settings
from app.services.apa.workflow_engine import WorkflowEngine
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.context_manager import ContextManager

logger = logging.getLogger(__name__)


class SchedulerService:
    """
    Manages scheduled workflow executions using APScheduler
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.scheduler = AsyncIOScheduler()
        self.active_jobs = {}
        
    async def start(self):
        """Start the scheduler service"""
        # Load active schedules from database
        await self._load_schedules()
        
        # Start the scheduler
        self.scheduler.start()
        logger.info("Scheduler service started")
        
    async def stop(self):
        """Stop the scheduler service"""
        self.scheduler.shutdown()
        logger.info("Scheduler service stopped")
        
    async def _load_schedules(self):
        """Load active schedules from database and add them to the scheduler"""
        try:
            # Get all active schedules
            result = await self.db.execute(
                select(Schedule).where(Schedule.status == ScheduleStatus.ACTIVE)
            )
            schedules = result.scalars().all()
            
            for schedule in schedules:
                await self._add_schedule_job(schedule)
                
            logger.info(f"Loaded {len(schedules)} active schedules")
        except Exception as e:
            logger.error(f"Error loading schedules: {e}")
            
    async def _add_schedule_job(self, schedule: Schedule):
        """Add a schedule job to the scheduler"""
        try:
            # Create cron trigger
            trigger = CronTrigger.from_crontab(schedule.cron_expression, timezone=schedule.timezone)
            
            # Add job to scheduler
            job = self.scheduler.add_job(
                self._execute_scheduled_workflow,
                trigger=trigger,
                id=str(schedule.id),
                args=[schedule],
                name=f"schedule_{schedule.id}"
            )
            
            # Store job reference
            self.active_jobs[str(schedule.id)] = job
            
            logger.info(f"Added schedule job for schedule {schedule.id}")
        except Exception as e:
            logger.error(f"Error adding schedule job for {schedule.id}: {e}")
            
    async def _execute_scheduled_workflow(self, schedule: Schedule):
        """Execute a scheduled workflow"""
        try:
            logger.info(f"Executing scheduled workflow for schedule {schedule.id}")
            
            # Get the workflow
            result = await self.db.execute(
                select(Workflow).where(Workflow.id == schedule.workflow_id)
            )
            workflow = result.scalar_one_or_none()
            
            if not workflow:
                logger.error(f"Workflow {schedule.workflow_id} not found for schedule {schedule.id}")
                return
                
            # Initialize services
            safety_engine = SafetyEngine(db=self.db)
            context_manager = ContextManager(db=self.db)
            workflow_engine = WorkflowEngine(
                safety_engine=safety_engine,
                context_manager=context_manager,
            )
            
            # Execute the workflow
            # Note: This is a simplified execution. In a real implementation,
            # you might want to trigger the API endpoint instead to maintain
            # consistency with manual executions
            result = await workflow_engine.execute_with_safety(
                nodes=workflow.definition.get("nodes", []),
                edges=workflow.definition.get("edges", []),
                input_data=workflow.definition.get("input", {}),
                user_id=workflow.project.owner_id,  # Use project owner as the user
            )
            
            logger.info(f"Successfully executed scheduled workflow {workflow.id} for schedule {schedule.id}")
            
            # Update next run time
            await self._update_next_run_time(schedule)
            
        except Exception as e:
            logger.error(f"Error executing scheduled workflow for schedule {schedule.id}: {e}")
            
    async def _update_next_run_time(self, schedule: Schedule):
        """Update the next run time for a schedule"""
        try:
            # Get the next run time from the scheduler
            job = self.active_jobs.get(str(schedule.id))
            if job:
                next_run_time = job.next_run_time
                if next_run_time:
                    # Update in database
                    schedule.next_run_at = next_run_time.isoformat()
                    await self.db.commit()
                    logger.debug(f"Updated next run time for schedule {schedule.id}")
        except Exception as e:
            logger.error(f"Error updating next run time for schedule {schedule.id}: {e}")
            
    async def add_schedule(self, schedule: Schedule):
        """Add a new schedule to the scheduler"""
        if schedule.status == ScheduleStatus.ACTIVE:
            await self._add_schedule_job(schedule)
            
    async def remove_schedule(self, schedule_id: str):
        """Remove a schedule from the scheduler"""
        job = self.active_jobs.get(schedule_id)
        if job:
            self.scheduler.remove_job(job.id)
            del self.active_jobs[schedule_id]
            logger.info(f"Removed schedule job {schedule_id}")
            
    async def update_schedule(self, schedule: Schedule):
        """Update an existing schedule"""
        # Remove existing job if it exists
        await self.remove_schedule(str(schedule.id))
        
        # Add updated job if schedule is active
        if schedule.status == ScheduleStatus.ACTIVE:
            await self._add_schedule_job(schedule)