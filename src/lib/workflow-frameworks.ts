/**
 * Framework Selection Types and Configuration
 * Defines available execution frameworks and workflow patterns
 */

export type ExecutionFramework = 
  | 'langchain'      // Single-agent ReAct pattern
  | 'crewai'         // Multi-agent collaboration
  | 'langgraph'      // Complex conditional workflows
  | 'custom'         // Custom implementation

export type WorkflowPattern = 
  | 'single-agent'
  | 'sequential-multi-agent'
  | 'parallel-multi-agent'
  | 'conditional-workflow'
  | 'research-analysis'
  | 'code-execution'

export interface FrameworkConfig {
  framework: ExecutionFramework;
  name: string;
  description: string;
  useCases: WorkflowPattern[];
  pros: string[];
  cons?: string[];
  requiredTools?: string[];
  icon?: string;
}

export const AVAILABLE_FRAMEWORKS: Record<ExecutionFramework, FrameworkConfig> = {
  langchain: {
    framework: 'langchain',
    name: 'LangChain ReAct',
    description: 'Best for single-agent tasks with Reasoning-Action-Observation loop',
    useCases: ['single-agent', 'code-execution'],
    pros: [
      'Battle-tested and stable',
      'Extensive tool ecosystem',
      'Great documentation',
      'Built-in memory management',
      'Easy to debug'
    ],
    cons: [
      'Not optimized for multi-agent',
      'Less structured than alternatives'
    ],
    requiredTools: ['langchain', 'langchain-openai', 'langchain-anthropic'],
    icon: '🔗'
  },
  crewai: {
    framework: 'crewai',
    name: 'CrewAI',
    description: 'Built for multi-agent collaboration with roles and processes',
    useCases: ['sequential-multi-agent', 'parallel-multi-agent', 'research-analysis'],
    pros: [
      'Purpose-built for multi-agent',
      'Sequential & hierarchical processes',
      'Shared memory between agents',
      'Role-based agent design',
      'Production-ready'
    ],
    cons: [
      'Overkill for single-agent tasks',
      'More complex setup'
    ],
    requiredTools: ['crewai', 'crewai-tools'],
    icon: '👥'
  },
  langgraph: {
    framework: 'langgraph',
    name: 'LangGraph',
    description: 'State machine-based workflow engine for complex conditional logic',
    useCases: ['conditional-workflow', 'sequential-multi-agent'],
    pros: [
      'Excellent for conditional logic',
      'State persistence',
      'Cyclic workflows supported',
      'Visual workflow graphs',
      'Human-in-the-loop built-in'
    ],
    cons: [
      'Steeper learning curve',
      'More verbose code'
    ],
    requiredTools: ['langgraph', 'langgraph-checkpoint'],
    icon: '📊'
  },
  custom: {
    framework: 'custom',
    name: 'Custom Implementation',
    description: 'Use our custom ReAct engine with full control',
    useCases: ['single-agent', 'code-execution'],
    pros: [
      'Full control over execution',
      'Custom safety engine integration',
      'No external dependencies',
      'Optimized for our use case'
    ],
    cons: [
      'More maintenance required',
      'Limited community support'
    ],
    requiredTools: [],
    icon: '⚙️'
  }
};

/**
 * Auto-suggest optimal framework based on workflow characteristics
 */
export function suggestFramework(
  nodeCount: number,
  hasConditions: boolean,
  hasParallelPaths: boolean,
  agentCount?: number
): ExecutionFramework {
  // Single agent workflows
  if (nodeCount === 1 || agentCount === 1) {
    return 'langchain';
  }

  // Complex conditional logic
  if (hasConditions && hasParallelPaths) {
    return 'langgraph';
  }

  // Multi-agent workflows
  if (nodeCount > 1 || (agentCount && agentCount > 1)) {
    return 'crewai';
  }

  // Simple conditional workflows
  if (hasConditions) {
    return 'langgraph';
  }

  // Default to custom for simple workflows
  return 'custom';
}

/**
 * Get framework recommendation reason
 */
export function getRecommendationReason(
  framework: ExecutionFramework,
  nodeCount: number,
  hasConditions: boolean,
  hasParallelPaths: boolean
): string {
  const config = AVAILABLE_FRAMEWORKS[framework];
  
  switch (framework) {
    case 'langchain':
      return `Single agent workflow detected (${nodeCount} node${nodeCount > 1 ? 's' : ''}) - ${config.name} is optimal for ReAct pattern execution.`;
    
    case 'crewai':
      return `Multi-agent workflow with ${nodeCount} agents - ${config.name} excels at coordinating multiple agents with shared context.`;
    
    case 'langgraph':
      return `Complex workflow with ${hasConditions ? 'conditional logic' : 'state management'} ${hasParallelPaths ? 'and parallel paths' : ''} - ${config.name} provides robust state machine capabilities.`;
    
    case 'custom':
      return `Simple workflow - ${config.name} offers maximum control with our battle-tested safety engine.`;
    
    default:
      return 'Recommended based on workflow characteristics.';
  }
}

/**
 * Validate framework compatibility with workflow
 */
export function validateFrameworkCompatibility(
  framework: ExecutionFramework,
  pattern: WorkflowPattern
): { compatible: boolean; message?: string } {
  const config = AVAILABLE_FRAMEWORKS[framework];
  
  if (config.useCases.includes(pattern)) {
    return { compatible: true };
  }

  return {
    compatible: false,
    message: `${config.name} is not optimized for ${pattern} workflows. Consider using: ${
      Object.values(AVAILABLE_FRAMEWORKS)
        .filter(f => f.useCases.includes(pattern))
        .map(f => f.name)
        .join(', ')
    }`
  };
}

/**
 * Get all frameworks that support a pattern
 */
export function getFrameworksForPattern(pattern: WorkflowPattern): FrameworkConfig[] {
  return Object.values(AVAILABLE_FRAMEWORKS).filter(
    config => config.useCases.includes(pattern)
  );
}
