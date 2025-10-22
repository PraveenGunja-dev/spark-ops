"""
Tool Registry - Unified interface for agent tool execution
"""
import uuid
from typing import Dict, List, Any, Optional, Callable
from sqlalchemy.orm import Session

from app.models import Tool


class ToolRegistry:
    """
    Tool Registry for managing and executing agent tools
    
    Responsibilities:
    - Register and manage tools
    - Execute tools with parameters
    - Validate tool calls
    - Handle tool errors
    """
    
    def __init__(self, db: Session):
        self.db = db
        self._tools: Dict[str, Callable] = {}
        self._register_builtin_tools()
    
    def _register_builtin_tools(self) -> None:
        """Register built-in tools"""
        # Register common tools
        self.register_tool("calculate", self._tool_calculate)
        self.register_tool("search", self._tool_search)
        self.register_tool("http_request", self._tool_http_request)
        self.register_tool("database_query", self._tool_database_query)
        self.register_tool("send_email", self._tool_send_email)
        self.register_tool("file_operation", self._tool_file_operation)
    
    def register_tool(self, tool_name: str, handler: Callable) -> None:
        """
        Register a tool handler
        
        Args:
            tool_name: Name of the tool
            handler: Function to handle tool execution
        """
        self._tools[tool_name] = handler
    
    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        agent_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        """
        Execute a tool with given parameters
        
        Args:
            tool_name: Name of the tool to execute
            parameters: Tool parameters
            agent_id: ID of the agent executing the tool
        
        Returns:
            Tool execution result
        """
        # Check if tool is registered
        if tool_name not in self._tools:
            return {
                "status": "error",
                "error": f"Tool '{tool_name}' not found",
                "available_tools": list(self._tools.keys()),
            }
        
        # Get tool handler
        handler = self._tools[tool_name]
        
        try:
            # Execute tool
            result = await handler(parameters)
            return {
                "status": "success",
                "tool": tool_name,
                "result": result,
            }
        except Exception as e:
            return {
                "status": "error",
                "tool": tool_name,
                "error": str(e),
            }
    
    async def get_tool_schema(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """
        Get the schema/signature for a tool
        
        Args:
            tool_name: Name of the tool
        
        Returns:
            Tool schema or None
        """
        # Try to get from database first
        tool = self.db.query(Tool).filter(Tool.name == tool_name).first()
        if tool:
            return tool.function_schema
        
        # Return built-in schema if available
        builtin_schemas = {
            "calculate": {
                "name": "calculate",
                "description": "Perform mathematical calculations",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {"type": "string", "description": "Mathematical expression"},
                    },
                    "required": ["expression"],
                },
            },
            "search": {
                "name": "search",
                "description": "Search for information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "limit": {"type": "integer", "description": "Number of results"},
                    },
                    "required": ["query"],
                },
            },
        }
        
        return builtin_schemas.get(tool_name)
    
    async def list_available_tools(self, agent_id: Optional[uuid.UUID] = None) -> List[Dict[str, Any]]:
        """
        List all available tools for an agent
        
        Args:
            agent_id: Optional agent ID to filter tools
        
        Returns:
            List of available tools with schemas
        """
        tools = []
        
        # Add built-in tools
        for tool_name in self._tools.keys():
            schema = await self.get_tool_schema(tool_name)
            if schema:
                tools.append(schema)
        
        # Add database tools if agent_id provided
        if agent_id:
            db_tools = (
                self.db.query(Tool)
                .filter(Tool.status == "active")
                .all()
            )
            for tool in db_tools:
                tools.append(tool.function_schema)
        
        return tools
    
    # Built-in tool handlers
    
    async def _tool_calculate(self, params: Dict[str, Any]) -> Any:
        """Calculate mathematical expression"""
        expression = params.get("expression", "")
        try:
            # Safe eval with limited scope
            result = eval(expression, {"__builtins__": {}}, {})
            return {"result": result, "expression": expression}
        except Exception as e:
            raise ValueError(f"Calculation error: {str(e)}")
    
    async def _tool_search(self, params: Dict[str, Any]) -> Any:
        """Search for information (placeholder)"""
        query = params.get("query", "")
        limit = params.get("limit", 5)
        
        # TODO: Implement actual search (web search, knowledge base, etc.)
        return {
            "query": query,
            "results": [
                {"title": f"Result {i}", "snippet": f"Mock result for: {query}"}
                for i in range(limit)
            ],
        }
    
    async def _tool_http_request(self, params: Dict[str, Any]) -> Any:
        """Make HTTP request (placeholder)"""
        url = params.get("url", "")
        method = params.get("method", "GET")
        
        # TODO: Implement actual HTTP request with httpx
        return {
            "url": url,
            "method": method,
            "status": "mock",
            "message": "HTTP request tool not yet implemented",
        }
    
    async def _tool_database_query(self, params: Dict[str, Any]) -> Any:
        """Execute database query (placeholder)"""
        query = params.get("query", "")
        
        # TODO: Implement safe database query execution
        return {
            "query": query,
            "status": "mock",
            "message": "Database query tool not yet implemented",
        }
    
    async def _tool_send_email(self, params: Dict[str, Any]) -> Any:
        """Send email (placeholder)"""
        to = params.get("to", "")
        subject = params.get("subject", "")
        body = params.get("body", "")
        
        # TODO: Implement email sending
        return {
            "to": to,
            "subject": subject,
            "status": "mock",
            "message": "Email tool not yet implemented",
        }
    
    async def _tool_file_operation(self, params: Dict[str, Any]) -> Any:
        """File operations (placeholder)"""
        operation = params.get("operation", "read")
        path = params.get("path", "")
        
        # TODO: Implement file operations
        return {
            "operation": operation,
            "path": path,
            "status": "mock",
            "message": "File operation tool not yet implemented",
        }
