"""
LangGraph-based Workflow Engine
Implements state machine-based workflows with conditional logic using LangGraph
"""

import logging
from typing import Dict, List, Any, Optional, TypedDict, Annotated
from datetime import datetime
import operator

try:
    from langgraph.graph import StateGraph, END
    from langgraph.prebuilt import ToolNode
    from langgraph.checkpoint.memory import MemorySaver
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("LangGraph not installed. Install with: pip install langgraph")

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

from app.core.config import settings
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.context_manager import ContextManager
from app.services.apa.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


# Define workflow state
class WorkflowState(TypedDict):
    """State that flows through the workflow graph"""
    messages: Annotated[List[str], operator.add]
    current_node: str
    input: str
    output: str
    intermediate_results: Dict[str, Any]
    iteration: int


class WorkflowEngine:
    """
    Executes workflows using LangGraph's state machine pattern.
    Best for complex conditional workflows with state persistence.
    """

    def __init__(
        self,
        safety_engine: SafetyEngine,
        context_manager: ContextManager,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        if not LANGGRAPH_AVAILABLE:
            raise ImportError("LangGraph is not installed. Please install it to use this executor.")
        
        self.safety_engine = safety_engine
        self.context_manager = context_manager
        self.tool_registry = tool_registry or ToolRegistry()
        self.memory = MemorySaver()

    def _get_llm(self, provider: str, model: str, temperature: float = 0.7):
        """Get LLM instance based on provider"""
        if provider.lower() == "openai":
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=settings.OPENAI_API_KEY,
            )
        elif provider.lower() == "anthropic":
            return ChatAnthropic(
                model=model,
                temperature=temperature,
                api_key=settings.ANTHROPIC_API_KEY,
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")

    def _create_node_function(
        self,
        node_config: Dict[str, Any],
        llm: Any,
    ):
        """Create a node function for the state graph"""
        node_type = node_config.get("type")
        node_data = node_config.get("data", {})
        
        if node_type == "agent":
            # Agent node: Process with LLM
            async def agent_node(state: WorkflowState) -> WorkflowState:
                messages = state.get("messages", [])
                current_input = state.get("input", "")
                
                # Use LLM to process
                prompt = node_data.get("system_prompt", "Process the input.")
                response = await llm.ainvoke(f"{prompt}\n\nInput: {current_input}")
                
                result = response.content if hasattr(response, 'content') else str(response)
                
                return {
                    **state,
                    "messages": messages + [f"Agent {node_data.get('label', 'node')}: {result}"],
                    "output": result,
                    "current_node": node_config.get("id"),
                    "iteration": state.get("iteration", 0) + 1,
                }
            
            return agent_node
        
        elif node_type == "decision":
            # Decision node: Evaluate condition
            async def decision_node(state: WorkflowState) -> WorkflowState:
                messages = state.get("messages", [])
                condition = node_data.get("condition", "")
                
                # Evaluate condition using LLM
                evaluation_prompt = f"""
                Evaluate the following condition based on the current state:
                Condition: {condition}
                Current output: {state.get('output', '')}
                
                Answer with only 'true' or 'false'.
                """
                
                response = await llm.ainvoke(evaluation_prompt)
                result = response.content.strip().lower() if hasattr(response, 'content') else "false"
                
                return {
                    **state,
                    "messages": messages + [f"Decision: {result}"],
                    "current_node": node_config.get("id"),
                    "intermediate_results": {
                        **state.get("intermediate_results", {}),
                        f"decision_{node_config.get('id')}": result == "true",
                    },
                    "iteration": state.get("iteration", 0) + 1,
                }
            
            return decision_node
        
        elif node_type == "tool":
            # Tool node: Execute tool
            async def tool_node(state: WorkflowState) -> WorkflowState:
                messages = state.get("messages", [])
                tool_name = node_data.get("tool_name", "")
                
                # Execute tool
                tool_func = self.tool_registry.get_tool(tool_name)
                if tool_func:
                    result = await tool_func(state.get("output", ""))
                else:
                    result = f"Tool {tool_name} not found"
                
                return {
                    **state,
                    "messages": messages + [f"Tool {tool_name}: {result}"],
                    "output": result,
                    "current_node": node_config.get("id"),
                    "iteration": state.get("iteration", 0) + 1,
                }
            
            return tool_node
        
        else:
            # Generic node
            async def generic_node(state: WorkflowState) -> WorkflowState:
                messages = state.get("messages", [])
                return {
                    **state,
                    "messages": messages + [f"Processed node: {node_data.get('label', 'unknown')}"],
                    "current_node": node_config.get("id"),
                    "iteration": state.get("iteration", 0) + 1,
                }
            
            return generic_node

    def _create_routing_function(
        self,
        node_id: str,
        edges: List[Dict[str, Any]],
    ):
        """Create a routing function for conditional edges"""
        outgoing_edges = [e for e in edges if e.get("source") == node_id]
        
        def route(state: WorkflowState) -> str:
            """Determine next node based on state"""
            # If decision node, check intermediate results
            decision_result = state.get("intermediate_results", {}).get(f"decision_{node_id}")
            
            if decision_result is not None:
                # Find edge matching the decision
                for edge in outgoing_edges:
                    edge_condition = edge.get("data", {}).get("condition", "")
                    if (decision_result and "true" in edge_condition.lower()) or \
                       (not decision_result and "false" in edge_condition.lower()):
                        return edge.get("target", END)
            
            # Default: take first available edge or end
            if outgoing_edges:
                return outgoing_edges[0].get("target", END)
            
            return END
        
        return route

    async def execute_workflow(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        input_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Execute a workflow using LangGraph state machine.
        
        Args:
            nodes: List of workflow nodes
            edges: List of workflow edges (defines transitions)
            input_data: Initial input for the workflow
            
        Returns:
            Execution result with output, metrics, and trace
        """
        logger.info(f"Starting LangGraph workflow execution with {len(nodes)} nodes")
        start_time = datetime.now()
        
        try:
            # Get LLM instance (use first agent's config or default)
            agent_node = next((n for n in nodes if n.get("type") == "agent"), None)
            if agent_node:
                agent_data = agent_node.get("data", {})
                provider = agent_data.get("provider", settings.DEFAULT_LLM_PROVIDER)
                model = agent_data.get("model", "gpt-4")
            else:
                provider = settings.DEFAULT_LLM_PROVIDER
                model = "gpt-4"
            
            llm = self._get_llm(provider, model)
            
            # Create state graph
            workflow = StateGraph(WorkflowState)
            
            # Add nodes to graph
            for node in nodes:
                node_func = self._create_node_function(node, llm)
                workflow.add_node(node.get("id"), node_func)
            
            # Find entry node (node with no incoming edges)
            incoming_targets = {e.get("target") for e in edges}
            entry_nodes = [n for n in nodes if n.get("id") not in incoming_targets]
            
            if not entry_nodes and nodes:
                # If no clear entry, use first node
                entry_nodes = [nodes[0]]
            
            if entry_nodes:
                workflow.set_entry_point(entry_nodes[0].get("id"))
            
            # Add edges
            for edge in edges:
                source = edge.get("source")
                target = edge.get("target")
                condition = edge.get("data", {}).get("condition")
                
                # Check if this is a conditional edge
                source_node = next((n for n in nodes if n.get("id") == source), None)
                outgoing_from_source = [e for e in edges if e.get("source") == source]
                
                if len(outgoing_from_source) > 1:
                    # Multiple outgoing edges - use conditional routing
                    routing_func = self._create_routing_function(source, edges)
                    workflow.add_conditional_edges(
                        source,
                        routing_func,
                    )
                else:
                    # Single edge - direct connection
                    workflow.add_edge(source, target)
            
            # Set finish points (nodes with no outgoing edges)
            outgoing_sources = {e.get("source") for e in edges}
            finish_nodes = [n for n in nodes if n.get("id") not in outgoing_sources]
            
            for finish_node in finish_nodes:
                workflow.add_edge(finish_node.get("id"), END)
            
            # Compile graph
            app = workflow.compile(checkpointer=self.memory)
            
            # Prepare initial state
            initial_state: WorkflowState = {
                "messages": [],
                "current_node": "",
                "input": input_data.get("input", "") if input_data else "",
                "output": "",
                "intermediate_results": {},
                "iteration": 0,
            }
            
            # Execute workflow
            config = {"configurable": {"thread_id": "workflow_001"}}
            final_state = await app.ainvoke(initial_state, config)
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "status": "success",
                "output": final_state.get("output", ""),
                "metrics": {
                    "execution_time": execution_time,
                    "iterations": final_state.get("iteration", 0),
                    "nodes_executed": len(final_state.get("messages", [])),
                },
                "framework": "langgraph",
                "trace": {
                    "messages": final_state.get("messages", []),
                    "intermediate_results": final_state.get("intermediate_results", {}),
                    "final_node": final_state.get("current_node", ""),
                },
            }
            
        except Exception as e:
            logger.error(f"LangGraph execution failed: {str(e)}", exc_info=True)
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "status": "error",
                "error": str(e),
                "metrics": {
                    "execution_time": execution_time,
                },
                "framework": "langgraph",
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
                action="graph_workflow",
                parameters={"nodes": nodes, "input": input_data},
                user_id=user_id,
            )
            
            if not safety_check.get("approved", False):
                return {
                    "status": "blocked",
                    "reason": safety_check.get("reason", "Safety check failed"),
                    "framework": "langgraph",
                }
        
        # Execute workflow
        result = await self.execute_workflow(nodes, edges, input_data)
        
        # Store execution context for learning
        if settings.ENABLE_AGENT_LEARNING and result.get("status") == "success":
            await self.context_manager.store_execution(
                framework="langgraph",
                input_data=input_data,
                output_data=result.get("output"),
                metrics=result.get("metrics", {}),
            )
        
        return result
