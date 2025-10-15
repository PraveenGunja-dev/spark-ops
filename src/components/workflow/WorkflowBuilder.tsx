import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  ControlButton,
  Background,
  MiniMap,
  Panel,
  MarkerType,
  Node,
  Edge,
  Connection,
  NodeTypes,
  EdgeTypes,
  Handle,
  Position,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  GitBranch, 
  Activity, 
  MessageSquare, 
  Play, 
  Square, 
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Database,
  Mail,
  Globe,
  FileText,
  Settings,
  Timer,
  AlertTriangle,
  Edit3,
  Check,
  X,
  Move
} from 'lucide-react';
import { AgenticFrameworkSelector, agenticFrameworks, frameworkNodeTypes } from './AgenticFrameworkSelector';
import { mockAgents } from '@/lib/mockData';

// Define custom node types with handles for connections and inline editing
const AgentNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Update the node data through the parent component
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-primary min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <Bot className="h-5 w-5 text-primary" />
          <div className="font-bold text-primary">{data?.label || 'Agent Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  );
};

const DecisionNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-accent min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-accent" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <GitBranch className="h-5 w-5 text-accent" />
          <div className="font-bold text-accent">{data?.label || 'Decision Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <div className="flex justify-between mt-2">
        <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-accent" style={{ left: '30%' }} />
        <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 bg-accent" style={{ left: '70%' }} />
      </div>
    </div>
  );
};

const ToolNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-secondary min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-secondary" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <Activity className="h-5 w-5 text-secondary" />
          <div className="font-bold text-secondary">{data?.label || 'Tool Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-secondary" />
    </div>
  );
};

const HumanNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-foreground min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-foreground" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <MessageSquare className="h-5 w-5 text-foreground" />
          <div className="font-bold text-foreground">{data?.label || 'Human Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-foreground" />
    </div>
  );
};

const DatabaseNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-purple-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <Database className="h-5 w-5 text-purple-500" />
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <Database className="h-5 w-5 text-purple-500" />
          <div className="font-bold text-purple-500">{data?.label || 'Database Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
    </div>
  );
};

const EmailNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <Mail className="h-5 w-5 text-blue-500" />
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <Mail className="h-5 w-5 text-blue-500" />
          <div className="font-bold text-blue-500">{data?.label || 'Email Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

const WebhookNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <Globe className="h-5 w-5 text-green-500" />
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <Globe className="h-5 w-5 text-green-500" />
          <div className="font-bold text-green-500">{data?.label || 'Webhook Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
};

const DocumentNode = ({ data, id }: { data: any, id: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    setIsEditing(false);
    window.dispatchEvent(new CustomEvent('nodeLabelChange', { detail: { id, label } }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLabel(data.label || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-orange-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      {isEditing ? (
        <div className="flex items-center gap-1 mb-1">
          <FileText className="h-5 w-5 text-orange-500" />
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
          />
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 p-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <FileText className="h-5 w-5 text-orange-500" />
          <div className="font-bold text-orange-500">{data?.label || 'Document Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
    </div>
  );
};

// Define custom node types
const nodeTypes: NodeTypes = {
  agent: (props) => <AgentNode {...props} />,
  decision: (props) => <DecisionNode {...props} />,
  tool: (props) => <ToolNode {...props} />,
  human: (props) => <HumanNode {...props} />,
  database: (props) => <DatabaseNode {...props} />,
  email: (props) => <EmailNode {...props} />,
  webhook: (props) => <WebhookNode {...props} />,
  document: (props) => <DocumentNode {...props} />,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {};

// Empty initial nodes and edges for the workflow
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const WorkflowBuilder = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [selectedFramework, setSelectedFramework] = useState<string>('multiagent');
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  // Get framework-specific node types
  const getNodeTypesForFramework = useCallback(() => {
    const nodeTypes = frameworkNodeTypes[selectedFramework];
    return nodeTypes || frameworkNodeTypes.custom || [];
  }, [selectedFramework]);

  // Handle node label changes from custom events
  const handleNodeLabelChange = useCallback((event: CustomEvent) => {
    const { id, label } = event.detail;
    setNodes(nds => nds.map(node => 
      node.id === id 
        ? { ...node, data: { ...node.data, label } }
        : node
    ));
  }, [setNodes]);

  // Add event listener for node label changes
  useEffect(() => {
    const handler = (event: Event) => handleNodeLabelChange(event as CustomEvent);
    window.addEventListener('nodeLabelChange', handler);
    return () => {
      window.removeEventListener('nodeLabelChange', handler);
    };
  }, [handleNodeLabelChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // If it's an agent node and we have a selected agent, use the agent's data
      let nodeData: any = { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        description: `Description for ${type} node`
      };

      if (type === 'agent' && selectedAgent) {
        const agent = mockAgents.find(a => a.id === selectedAgent);
        if (agent) {
          nodeData = {
            label: agent.name,
            description: agent.promptSummary,
            agentId: agent.id,
            model: agent.model,
            tools: agent.tools
          };
        }
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, selectedAgent]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodes([node]);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodes([]);
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;
    
    const selectedNodeIds = selectedNodes.map(node => node.id);
    setNodes(nds => nds.filter(node => !selectedNodeIds.includes(node.id)));
    setEdges(eds => eds.filter(edge => 
      !selectedNodeIds.includes(edge.source) && 
      !selectedNodeIds.includes(edge.target)
    ));
    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const resetWorkflow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodes([]);
    setWorkflowName('Untitled Workflow');
    setSelectedFramework('multiagent');
    setSelectedAgent('');
  }, [setNodes, setEdges]);

  const exportWorkflow = useCallback(() => {
    const workflowData = {
      name: workflowName,
      framework: selectedFramework,
      nodes,
      edges
    };
    
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${workflowName.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [workflowName, selectedFramework, nodes, edges]);

  const importWorkflow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const workflowData = JSON.parse(content);
        
        setWorkflowName(workflowData.name || 'Imported Workflow');
        if (workflowData.framework) setSelectedFramework(workflowData.framework);
        setNodes(workflowData.nodes || []);
        setEdges(workflowData.edges || []);
        setSelectedNodes([]);
      } catch (error) {
        console.error('Error importing workflow:', error);
        alert('Error importing workflow. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input value to allow importing the same file again
    if (event.target) {
      event.target.value = '';
    }
  }, [setNodes, setEdges]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar - Streamlined with workflow name and essential controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Visual Workflow Builder</h2>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex gap-2">
          {/* Import Workflow Button */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={importWorkflow}
              className="hidden"
            />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </label>
          
          {/* Export Workflow Button */}
          <Button variant="outline" size="sm" onClick={exportWorkflow}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm" onClick={resetWorkflow}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Run Workflow
          </Button>
        </div>
      </div>

      {/* Framework Selection - Increased width */}
      <div className="w-full max-w-4xl">
        <AgenticFrameworkSelector
          selectedFramework={selectedFramework}
          setSelectedFramework={setSelectedFramework}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
        />
      </div>

      <div className="flex flex-1 gap-4 mt-4">
        {/* Workflow Canvas - Full width */}
        <div className="flex-1">
          <div className="h-full w-full" ref={reactFlowWrapper}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                fitView
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                className="bg-muted"
                // Allow connections from any handle to any handle (freehand connections)
                isValidConnection={() => true}
              >
                <Controls className="bg-white rounded-lg shadow-md">
                  <ControlButton onClick={() => reactFlowInstance?.zoomIn()}>
                    <span className="text-lg">+</span>
                  </ControlButton>
                  <ControlButton onClick={() => reactFlowInstance?.zoomOut()}>
                    <span className="text-lg">-</span>
                  </ControlButton>
                </Controls>
                <MiniMap className="bg-white rounded-lg shadow-md" />
                <Background gap={16} />
                
                {/* Framework-specific node palette on canvas */}
                <Panel position="top-left" className="bg-white rounded-lg shadow-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Move className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">Drag Nodes to Canvas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {getNodeTypesForFramework().map((nodeType) => {
                      const Icon = nodeType.icon;
                      return (
                        <div
                          key={nodeType.type}
                          className="p-2 rounded-lg border border-border hover:border-accent transition-colors cursor-grab active:cursor-grabbing flex items-center gap-2"
                          onDragStart={(event) => onDragStart(event, nodeType.type)}
                          draggable
                        >
                          <Icon className={`h-4 w-4 text-${nodeType.color}`} />
                          <span className="text-xs whitespace-nowrap">{nodeType.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
                
                <Panel position="top-right" className="bg-white rounded-lg shadow-md p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-xs">Agent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-accent"></div>
                      <span className="text-xs">Decision</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <span className="text-xs">Tool</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-foreground"></div>
                      <span className="text-xs">Human</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs">Database</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs">Email</span>
                    </div>
                  </div>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;