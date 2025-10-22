"""
Test APA Integration - Quick verification script
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import AsyncSessionLocal
from app.models import Agent, Project, User
from app.services.apa.reasoning_engine import ReasoningEngine
from app.services.apa.context_manager import ContextManager
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.vector_store import VectorStore
from app.services.apa.tool_registry import ToolRegistry


async def test_vector_store():
    """Test vector store functionality"""
    print("\n=== Testing Vector Store ===")
    
    vector_store = VectorStore(store_type="chromadb")
    
    # Test embedding generation
    print("Generating embedding...")
    embedding = await vector_store.generate_embedding("Hello, world!")
    print(f"Embedding size: {len(embedding)}")
    
    # Test memory storage
    print("Storing memory...")
    await vector_store.store_memory(
        memory_id="test-1",
        content="The user prefers dark mode",
        metadata={"agent_id": "test-agent", "type": "preference"},
    )
    
    # Test semantic search
    print("Searching for similar memories...")
    results = await vector_store.search_similar("user preferences", limit=3)
    print(f"Found {len(results)} similar memories")
    for result in results:
        print(f"  - {result['content'][:50]}... (score: {result['score']})")
    
    # Test stats
    stats = await vector_store.get_collection_stats()
    print(f"Collection stats: {stats}")
    
    print("✓ Vector Store tests passed!\n")


async def test_tool_registry():
    """Test tool registry functionality"""
    print("\n=== Testing Tool Registry ===")
    
    async with AsyncSessionLocal() as db:
        registry = ToolRegistry(db)
        
        # Test listing tools
        print("Available tools:")
        tools = await registry.list_available_tools()
        for tool in tools[:5]:  # Show first 5
            print(f"  - {tool.get('name')}: {tool.get('description', 'No description')}")
        
        # Test calculate tool
        print("\nTesting calculate tool...")
        result = await registry.execute_tool(
            tool_name="calculate",
            parameters={"expression": "2 + 2 * 3"},
        )
        print(f"Result: {result}")
        
        # Test search tool
        print("\nTesting search tool...")
        result = await registry.execute_tool(
            tool_name="search",
            parameters={"query": "Python programming", "limit": 3},
        )
        print(f"Result: {result}")
        
        print("✓ Tool Registry tests passed!\n")


async def test_reasoning_engine():
    """Test reasoning engine (mock mode)"""
    print("\n=== Testing Reasoning Engine ===")
    
    engine = ReasoningEngine(llm_provider="openai")
    
    # Create mock agent
    class MockAgent:
        provider = "openai"
        model = "gpt-4"
        temperature = 7
        max_tokens = 2000
        tools = ["calculate", "search"]
        system_prompt = "You are a helpful AI agent"
    
    agent = MockAgent()
    
    # Test reasoning (will use mock since no API key)
    print("Testing reasoning (mock mode)...")
    result = await engine.reason(
        agent=agent,
        task={"description": "Calculate 2+2"},
        context={},
        previous_actions=[],
        previous_observations=[],
    )
    
    print(f"Reasoning: {result['reasoning'][:100]}...")
    print(f"Action: {result['action']['type']}")
    print(f"Tokens used: {result['tokens_used']}")
    
    print("✓ Reasoning Engine tests passed!\n")


async def test_integration():
    """Run all integration tests"""
    print("=" * 60)
    print("APA Integration Test Suite")
    print("=" * 60)
    
    try:
        await test_vector_store()
    except Exception as e:
        print(f"✗ Vector Store test failed: {e}\n")
    
    try:
        await test_tool_registry()
    except Exception as e:
        print(f"✗ Tool Registry test failed: {e}\n")
    
    try:
        await test_reasoning_engine()
    except Exception as e:
        print(f"✗ Reasoning Engine test failed: {e}\n")
    
    print("=" * 60)
    print("Test suite completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_integration())
