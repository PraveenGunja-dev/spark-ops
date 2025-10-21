import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Layers, 
  Cpu, 
  Network, 
  Bot,
  GitBranch,
  Activity,
  MessageSquare,
  Database,
  Timer,
  FileText
} from 'lucide-react';
import { mockAgents } from '@/lib/mockData';

// Define agentic frameworks
export const agenticFrameworks = [
  { id: 'react', name: 'ReACT (Reasoning + Acting)', description: 'Thought → Action → Observation loop' },
  { id: 'reflexion', name: 'Reflexion', description: 'Self-reflection and learning from past experiences' },
  { id: 'multiagent', name: 'Multi-Agent Collaboration', description: 'Multiple agents working together' },
  { id: 'autogen', name: 'AutoGen', description: 'Conversational multi-agent framework' },
  { id: 'crewai', name: 'CrewAI', description: 'Role-based agent collaboration' },
  { id: 'langgraph', name: 'LangGraph', description: 'Graph-based agent workflows' },
  { id: 'custom', name: 'Custom Framework', description: 'Define your own orchestration pattern' }
];

// Define framework-specific node types
export const frameworkNodeTypes: Record<string, Array<{ type: string; label: string; icon: React.ComponentType<any>; color: string }>> = {
  react: [
    { type: 'agent', label: 'Reasoning Agent', icon: Bot, color: 'primary' },
    { type: 'tool', label: 'Action Tool', icon: Activity, color: 'secondary' },
    { type: 'decision', label: 'Observation Decision', icon: GitBranch, color: 'accent' },
    { type: 'human', label: 'Human Feedback', icon: MessageSquare, color: 'foreground' }
  ],
  reflexion: [
    { type: 'agent', label: 'Thinking Agent', icon: Bot, color: 'primary' },
    { type: 'tool', label: 'Experience Tool', icon: Activity, color: 'secondary' },
    { type: 'decision', label: 'Reflection Decision', icon: GitBranch, color: 'accent' },
    { type: 'database', label: 'Memory Store', icon: Database, color: 'purple-500' }
  ],
  multiagent: [
    { type: 'agent', label: 'Agent', icon: Bot, color: 'primary' },
    { type: 'tool', label: 'Tool', icon: Activity, color: 'secondary' },
    { type: 'decision', label: 'Decision', icon: GitBranch, color: 'accent' },
    { type: 'human', label: 'Human', icon: MessageSquare, color: 'foreground' },
    { type: 'database', label: 'Database', icon: Database, color: 'purple-500' },
    { type: 'event', label: 'Event', icon: Timer, color: 'green-500' }
  ],
  autogen: [
    { type: 'agent', label: 'Conversational Agent', icon: Bot, color: 'primary' },
    { type: 'tool', label: 'Communication Tool', icon: Activity, color: 'secondary' },
    { type: 'decision', label: 'Group Decision', icon: GitBranch, color: 'accent' },
    { type: 'human', label: 'Human Input', icon: MessageSquare, color: 'foreground' }
  ],
  crewai: [
    { type: 'agent', label: 'Role-Based Agent', icon: Bot, color: 'primary' },
    { type: 'tool', label: 'Task Tool', icon: Activity, color: 'secondary' },
    { type: 'decision', label: 'Task Decision', icon: GitBranch, color: 'accent' },
    { type: 'group', label: 'Agent Group', icon: FileText, color: 'orange-500' }
  ],
  langgraph: [
    { type: 'agent', label: 'Graph Agent', icon: Bot, color: 'primary' },
    { type: 'tool', label: 'Node Tool', icon: Activity, color: 'secondary' },
    { type: 'gateway', label: 'Conditional Gateway', icon: GitBranch, color: 'purple-500' },
    { type: 'datastore', label: 'State Store', icon: Database, color: 'blue-500' }
  ],
  custom: [
    { type: 'agent', label: 'Agent', icon: Bot, color: 'primary' },
    { type: 'tool', label: 'Tool', icon: Activity, color: 'secondary' },
    { type: 'decision', label: 'Decision', icon: GitBranch, color: 'accent' },
    { type: 'human', label: 'Human', icon: MessageSquare, color: 'foreground' },
    { type: 'database', label: 'Database', icon: Database, color: 'purple-500' },
    { type: 'event', label: 'Event', icon: Timer, color: 'green-500' },
    { type: 'group', label: 'Group', icon: FileText, color: 'orange-500' },
    { type: 'gateway', label: 'Gateway', icon: GitBranch, color: 'purple-500' },
    { type: 'datastore', label: 'Data Store', icon: Database, color: 'blue-500' }
  ]
};

interface AgenticFrameworkSelectorProps {
  selectedFramework: string;
  setSelectedFramework: (framework: string) => void;
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
}

export function AgenticFrameworkSelector({
  selectedFramework,
  setSelectedFramework,
  selectedAgent,
  setSelectedAgent
}: AgenticFrameworkSelectorProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Card className="flex-1 min-w-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Agentic Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="framework-select">Select Framework</Label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger id="framework-select">
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  {agenticFrameworks.map((framework) => (
                    <SelectItem key={framework.id} value={framework.id}>
                      {framework.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {agenticFrameworks.find(f => f.id === selectedFramework)?.description}
              </p>
            </div>
            
            {selectedFramework === 'multiagent' && (
              <div>
                <Label htmlFor="agent-select">Select Agent</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger id="agent-select">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Select an agent to use in your multi-agent workflow
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="flex-1 min-w-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Framework Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Selected Framework:</span>
              <span className="text-sm">
                {agenticFrameworks.find(f => f.id === selectedFramework)?.name || 'None'}
              </span>
            </div>
            
            {selectedFramework === 'multiagent' && selectedAgent && (
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Selected Agent:</span>
                <span className="text-sm">
                  {mockAgents.find(a => a.id === selectedAgent)?.name || 'None'}
                </span>
              </div>
            )}
            
            <div className="pt-2 border-t border-border">
              <p className="text-sm">
                {selectedFramework === 'react' && "ReACT combines reasoning and acting in a loop where agents think, act, and observe results."}
                {selectedFramework === 'reflexion' && "Reflexion enables agents to learn from past experiences through self-reflection and memory."}
                {selectedFramework === 'multiagent' && "Multi-Agent Collaboration allows multiple specialized agents to work together on complex tasks."}
                {selectedFramework === 'autogen' && "AutoGen provides conversational multi-agent interactions with human involvement."}
                {selectedFramework === 'crewai' && "CrewAI enables role-based agent collaboration with hierarchical task execution."}
                {selectedFramework === 'langgraph' && "LangGraph creates graph-based workflows for sequential and conditional agent execution."}
                {selectedFramework === 'custom' && "Custom Framework allows you to define your own orchestration pattern and rules."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}