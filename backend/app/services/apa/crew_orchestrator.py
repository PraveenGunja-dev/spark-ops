"""
CrewAI-based Multi-Agent Orchestrator
Implements multi-agent collaboration workflows using CrewAI framework
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

try:
    from crewai import Agent, Task, Crew, Process
    from crewai.tools import BaseTool
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("CrewAI not installed. Install with: pip install crewai")

from app.core.config import settings
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.context_manager import ContextManager
from app.services.apa.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


class CrewOrchestrator:
    """
    Orchestrates multi-agent workflows using CrewAI.
    Best for sequential or parallel multi-agent collaboration with shared context.
    """

    def __init__(
        self,
        safety_engine: SafetyEngine,
        context_manager: ContextManager,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        if not CREWAI_AVAILABLE:
            raise ImportError("CrewAI is not installed. Please install it to use this executor.")
        
        self.safety_engine = safety_engine
        self.context_manager = context_manager
        self.tool_registry = tool_registry or ToolRegistry()

    def _create_crew_agent(self, node_config: Dict[str, Any]) -> Agent:
        """Create a CrewAI Agent from node configuration"""
        data = node_config.get("data", {})
        
        # Extract agent configuration
        role = data.get("label", "Assistant Agent")
        goal = data.get("goal", f"Complete tasks as a {role}")
        backstory = data.get(
            "system_prompt",
            data.get("description", f"I am a {role} specialized in my designated tasks.")
        )
        
        # Get LLM configuration
        provider = data.get("provider", settings.DEFAULT_LLM_PROVIDER)
        model = data.get("model", "gpt-4")
        
        # Create tools for this agent
        tools = self._create_crew_tools(data.get("tools", []))
        
        return Agent(
            role=role,
            goal=goal,
            backstory=backstory,
            tools=tools,
            verbose=True,
            allow_delegation=True,  # Agents can delegate tasks to each other
            llm=f"{provider}/{model}",
        )

    def _create_crew_tools(self, tool_configs: List[Dict[str, Any]]) -> List[BaseTool]:
        """Convert tool configurations to CrewAI Tool objects"""
        crew_tools = []
        
        # CrewAI has its own tool system, we'll create adapters
        # For now, return empty list - implement tool adapters as needed
        # TODO: Create CrewAI tool adapters from our tool registry
        
        return crew_tools

    def _create_task_from_edge(
        self,
        source_node: Dict[str, Any],
        target_node: Dict[str, Any],
        edge: Dict[str, Any],
        agents_map: Dict[str, Agent],
    ) -> Task:
        """Create a CrewAI Task from workflow edge"""
        edge_data = edge.get("data", {})
        target_data = target_node.get("data", {})
        
        # Get the agent for this task
        agent = agents_map.get(target_node.get("id"))
        
        description = edge_data.get(
            "description",
            target_data.get("description", "Complete the assigned task")
        )
        
        expected_output = edge_data.get(
            "expected_output",
            "Task completed successfully with detailed results"
        )
        
        return Task(
            description=description,
            expected_output=expected_output,
            agent=agent,
        )

    def _determine_process_type(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
    ) -> Process:
        """
        Determine the best process type based on workflow structure.
        
        Returns:
            Process.sequential or Process.hierarchical
        """
        # Check if workflow has parallel branches
        has_parallel = False
        for node in nodes:
            outgoing_edges = [e for e in edges if e.get("source") == node.get("id")]
            if len(outgoing_edges) > 1:
                has_parallel = True
                break
        
        # Use hierarchical for complex workflows with parallel execution
        if has_parallel or len(nodes) > 3:
            return Process.hierarchical
        
        # Default to sequential for simple workflows
        return Process.sequential

    async def execute_workflow(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        input_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Execute a multi-agent workflow using CrewAI.
        
        Args:
            nodes: List of workflow nodes (agent nodes)
            edges: List of workflow edges (defines task flow)
            input_data: Initial input for the workflow
            
        Returns:
            Execution result with output, metrics, and trace
        """
        logger.info(f"Starting CrewAI workflow execution with {len(nodes)} agents")
        start_time = datetime.now()
        
        try:
            # Filter agent nodes
            agent_nodes = [n for n in nodes if n.get("type") == "agent"]
            
            if len(agent_nodes) == 0:
                raise ValueError("No agent nodes found in workflow")
            
            # Create CrewAI Agents
            agents_map = {}
            agents_list = []
            
            for node in agent_nodes:
                agent = self._create_crew_agent(node)
                agents_map[node.get("id")] = agent
                agents_list.append(agent)
            
            # Create Tasks from edges
            tasks = []
            
            # Build task graph
            for edge in edges:
                source_id = edge.get("source")
                target_id = edge.get("target")
                
                source_node = next((n for n in nodes if n.get("id") == source_id), None)
                target_node = next((n for n in nodes if n.get("id") == target_id), None)
                
                if source_node and target_node:
                    task = self._create_task_from_edge(
                        source_node, target_node, edge, agents_map
                    )
                    tasks.append(task)
            
            # If no edges, create a task for each agent with default description
            if not tasks:
                user_input = input_data.get("input", "") if input_data else ""
                for agent in agents_list:
                    task = Task(
                        description=user_input or "Complete your assigned role",
                        expected_output="Task completed successfully",
                        agent=agent,
                    )
                    tasks.append(task)
            
            # Determine process type
            process_type = self._determine_process_type(nodes, edges)
            
            # Create and run Crew
            crew = Crew(
                agents=agents_list,
                tasks=tasks,
                process=process_type,
                verbose=True,
                memory=True,  # Enable shared memory between agents
            )
            
            # Execute the crew
            user_input = input_data.get("input", "") if input_data else ""
            result = crew.kickoff(inputs={"input": user_input} if user_input else {})
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "status": "success",
                "output": str(result),
                "metrics": {
                    "execution_time": execution_time,
                    "agent_count": len(agents_list),
                    "task_count": len(tasks),
                    "process_type": process_type.value if hasattr(process_type, 'value') else str(process_type),
                },
                "framework": "crewai",
                "agents": [
                    {
                        "role": agent.role,
                        "goal": agent.goal,
                    }
                    for agent in agents_list
                ],
                "trace": {
                    "tasks": [
                        {
                            "description": task.description,
                            "expected_output": task.expected_output,
                        }
                        for task in tasks
                    ],
                }
            }
            
        except Exception as e:
            logger.error(f"CrewAI execution failed: {str(e)}", exc_info=True)
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "status": "error",
                "error": str(e),
                "metrics": {
                    "execution_time": execution_time,
                },
                "framework": "crewai",
            }

    async def execute_with_safety(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        input_data: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Execute workflow with safety checks and HITL integration.
        """
        # Pre-execution safety check
        if settings.ENABLE_HITL and user_id:
            safety_check = await self.safety_engine.check_safety(
                action="multi_agent_workflow",
                parameters={"nodes": nodes, "input": input_data},
                user_id=user_id,
            )
            
            if not safety_check.get("approved", False):
                return {
                    "status": "blocked",
                    "reason": safety_check.get("reason", "Safety check failed"),
                    "framework": "crewai",
                }
        
        # Execute workflow
        result = await self.execute_workflow(nodes, edges, input_data)
        
        # Store execution context for learning
        if settings.ENABLE_AGENT_LEARNING and result.get("status") == "success":
            await self.context_manager.store_execution(
                framework="crewai",
                input_data=input_data,
                output_data=result.get("output"),
                metrics=result.get("metrics", {}),
            )
        
        return result


# Example usage
async def example_usage():
    """Example of using CrewOrchestrator"""
    from sqlalchemy.orm import Session
    
    # Initialize dependencies
    db = None  # Get from dependency injection
    safety_engine = SafetyEngine(db=db)
    context_manager = ContextManager(db=db)
    
    # Create orchestrator
    orchestrator = CrewOrchestrator(
        safety_engine=safety_engine,
        context_manager=context_manager,
    )
    
    # Define multi-agent workflow
    nodes = [
        {
            "id": "researcher",
            "type": "agent",
            "data": {
                "label": "Researcher",
                "goal": "Research and gather information on the topic",
                "system_prompt": "You are an expert researcher who gathers comprehensive information.",
                "provider": "openai",
                "model": "gpt-4",
            },
        },
        {
            "id": "writer",
            "type": "agent",
            "data": {
                "label": "Writer",
                "goal": "Write a comprehensive article based on research",
                "system_prompt": "You are a skilled writer who creates engaging content.",
                "provider": "openai",
                "model": "gpt-4",
            },
        },
    ]
    
    edges = [
        {
            "source": "researcher",
            "target": "writer",
            "data": {
                "description": "Pass research findings to the writer",
            },
        }
    ]
    
    input_data = {
        "input": "Write an article about the future of AI agents"
    }
    
    # Execute
    result = await orchestrator.execute_with_safety(
        nodes=nodes,
        edges=edges,
        input_data=input_data,
        user_id=1,
    )
    
    print("Execution result:", result)
