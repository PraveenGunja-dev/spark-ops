import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  Node,
  Edge,
  Connection,
  Handle,
  Position,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Bot,
  GitBranch,
  Activity,
  MessageSquare,
  Play,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Minus,
  Move,
  Database,
  Timer,
  FileText,
  Edit3,
  Check,
  X,
  Undo,
  Redo,
  Save,
  Layers,
  Cpu,
  Network
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
    <div className="px-4 py-3 shadow-md rounded-md bg-background border-2 border-primary min-w-[150px]">
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
    <div className="px-4 py-3 shadow-md rounded-md bg-background border-2 border-accent min-w-[150px]">
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
    <div className="px-4 py-3 shadow-md rounded-md bg-background border-2 border-secondary min-w-[150px]">
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
    <div className="px-4 py-3 shadow-md rounded-md bg-background border-2 border-foreground min-w-[150px]">
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

const EventNode = ({ data, id }: { data: any, id: string }) => {
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
    <div className="px-4 py-3 shadow-md rounded-full bg-background border-2 border-green-500 min-w-[120px] min-h-[60px] flex items-center justify-center">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-green-500" />
      {isEditing ? (
        <div className="flex flex-col items-center gap-1">
          <Timer className="h-5 w-5 text-green-500" />
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm w-24"
          />
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-5 w-5 p-1" onClick={handleSave}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-5 w-5 p-1" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="flex flex-col items-center cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <Timer className="h-5 w-5 text-green-500" />
          <div className="font-bold text-green-500 text-center">{data?.label || 'Event Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500" />
    </div>
  );
};

const GatewayNode = ({ data, id }: { data: any, id: string }) => {
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
    <div className="px-4 py-3 shadow-md bg-white border-2 border-purple-500 min-w-[100px] min-h-[100px] flex items-center justify-center relative"
         style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      {isEditing ? (
        <div className="flex flex-col items-center gap-1">
          <GitBranch className="h-5 w-5 text-purple-500" />
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm w-24"
          />
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-5 w-5 p-1" onClick={handleSave}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-5 w-5 p-1" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="flex flex-col items-center cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <GitBranch className="h-5 w-5 text-purple-500" />
          <div className="font-bold text-purple-500 text-center">{data?.label || 'Gateway Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
    </div>
  );
};

const DataStoreNode = ({ data, id }: { data: any, id: string }) => {
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
          <Database className="h-5 w-5 text-blue-500" />
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
          <Database className="h-5 w-5 text-blue-500" />
          <div className="font-bold text-blue-500">{data?.label || 'Data Store Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

const GroupNode = ({ data, id }: { data: any, id: string }) => {
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
    <div className="p-4 shadow-md rounded-md bg-white border-2 border-dashed border-orange-500 min-w-[200px] min-h-[150px]">
      {isEditing ? (
        <div className="flex items-center gap-1 mb-2">
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
          <div className="font-bold text-orange-500">{data?.label || 'Group Node'}</div>
          <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="text-xs mt-1 text-muted-foreground">{data?.description || ''}</div>
    </div>
  );
};

// Empty initial nodes and edges for the workflow
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypesPalette = [
  { type: 'agent', label: 'Agent', icon: Bot },
  { type: 'decision', label: 'Decision', icon: GitBranch },
  { type: 'tool', label: 'Tool', icon: Activity },
  { type: 'human', label: 'Human', icon: MessageSquare },
  { type: 'event', label: 'Event', icon: Timer },
  { type: 'gateway', label: 'Gateway', icon: GitBranch },
  { type: 'datastore', label: 'Data Store', icon: Database },
  { type: 'group', label: 'Group', icon: FileText },
];

// Add the agentic framework selection to the component
const AdvancedWorkflowEditor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<string>('multiagent');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  
  // Get framework-specific node types
  const getNodeTypesForFramework = useCallback(() => {
    const nodeTypes = frameworkNodeTypes[selectedFramework];
    return nodeTypes || frameworkNodeTypes.custom || [];
  }, [selectedFramework]);
  
  // History management for undo/redo functionality
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDirty, setIsDirty] = useState(false);

  // Save the current state to history
  const saveToHistory = useCallback(() => {
    // Only save to history if there are actual changes
    if (history.length > 0 && historyIndex >= 0) {
      const currentState = history[historyIndex];
      if (currentState) {
        // Check if there are actual changes
        const nodesChanged = JSON.stringify(currentState.nodes) !== JSON.stringify(nodes);
        const edgesChanged = JSON.stringify(currentState.edges) !== JSON.stringify(edges);
        
        if (!nodesChanged && !edgesChanged) {
          return; // No changes, don't save to history
        }
      }
    }
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: [...nodes], edges: [...edges] });
      // Limit history to 50 states to prevent memory issues
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
    setIsDirty(true);
  }, [nodes, edges, history, historyIndex]);

  // Initialize history with the initial state
  useEffect(() => {
    saveToHistory();
  }, []);

  // Override the node and edge change handlers to save history
  const customOnNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    saveToHistory();
  }, [onNodesChange, saveToHistory]);

  const customOnEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    saveToHistory();
  }, [onEdgesChange, saveToHistory]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      if (prevState) {
        setNodes([...prevState.nodes]);
        setEdges([...prevState.edges]);
        setHistoryIndex(prev => prev - 1);
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (nextState) {
        setNodes([...nextState.nodes]);
        setEdges([...nextState.edges]);
        setHistoryIndex(prev => prev + 1);
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Save workflow functionality
  const saveWorkflow = useCallback(() => {
    // In a real application, this would save to a backend
    // For now, we'll just export to JSON and show a success message
    const workflowData = {
      name: workflowName,
      nodes,
      edges
    };
    
    // Save to localStorage as an example
    localStorage.setItem(`workflow-${workflowName}`, JSON.stringify(workflowData));
    
    // Save to recent workflows
    const recentWorkflows = JSON.parse(localStorage.getItem('recent-workflows') || '[]');
    const workflowEntry = {
      id: `workflow-${Date.now()}`,
      name: workflowName,
      timestamp: new Date().toISOString(),
      data: workflowData
    };
    
    // Add to recent workflows (limit to 10 most recent)
    const updatedRecent = [workflowEntry, ...recentWorkflows.filter((w: any) => w.name !== workflowName)].slice(0, 10);
    localStorage.setItem('recent-workflows', JSON.stringify(updatedRecent));
    
    // Mark as not dirty
    setIsDirty(false);
    
    // Show success message (in a real app, you might use a toast notification)
    alert(`Workflow "${workflowName}" saved successfully!`);
  }, [workflowName, nodes, edges]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 's') {
          e.preventDefault();
          saveWorkflow();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo, saveWorkflow]);

  // Handle node label changes from custom events
  const handleNodeLabelChange = useCallback((event: CustomEvent) => {
    const { id, label } = event.detail;
    setNodes(nds => {
      const newNodes = nds.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, label } }
          : node
      );
      // Save to history after node label change
      saveToHistory();
      return newNodes;
    });
  }, [setNodes, saveToHistory]);

  // Add event listener for node label changes
  useEffect(() => {
    const handler = (event: Event) => handleNodeLabelChange(event as CustomEvent);
    window.addEventListener('nodeLabelChange', handler);
    return () => {
      window.removeEventListener('nodeLabelChange', handler);
    };
  }, [handleNodeLabelChange]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds);
        // Save to history after edge addition
        saveToHistory();
        return newEdges;
      });
    },
    [setEdges, saveToHistory]
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
        description: `Description for ${type} node`,
        action: '',
        output: ''
      };

      if (type === 'agent' && selectedAgent) {
        const agent = mockAgents.find(a => a.id === selectedAgent);
        if (agent) {
          nodeData = {
            label: agent.name,
            description: agent.promptSummary,
            action: '',
            output: '',
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

      // Group nodes don't have handles
      if (type === 'group') {
        // @ts-ignore
        delete newNode.data.action;
        // @ts-ignore
        delete newNode.data.output;
      }

      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        // Save to history after node addition
        saveToHistory();
        return newNodes;
      });
    },
    [reactFlowInstance, setNodes, saveToHistory, selectedAgent]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodes([node]);
    setIsEditingLabel(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodes([]);
    setIsEditingLabel(false);
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    if (!selectedNodes || selectedNodes.length === 0) return;
    
    const selectedNodeIds = selectedNodes.map(node => node.id);
    setNodes(nds => {
      const newNodes = nds.filter(node => !selectedNodeIds.includes(node.id));
      // Save to history after node deletion
      saveToHistory();
      return newNodes;
    });
    setEdges(eds => {
      const newEdges = eds.filter(edge => 
        !selectedNodeIds.includes(edge.source) && 
        !selectedNodeIds.includes(edge.target)
      );
      // Save to history after edge deletion
      saveToHistory();
      return newEdges;
    });
    setSelectedNodes([]);
    setIsEditingLabel(false);
  }, [selectedNodes, setNodes, setEdges, saveToHistory]);

  const resetWorkflow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodes([]);
    setIsEditingLabel(false);
    setWorkflowName('Untitled Workflow');
    // Save to history after reset
    saveToHistory();
  }, [setNodes, setEdges, saveToHistory]);

  const exportWorkflow = useCallback(() => {
    const workflowData = {
      name: workflowName,
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
  }, [workflowName, nodes, edges]);

  const importWorkflow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const workflowData = JSON.parse(content);
        
        setWorkflowName(workflowData.name || 'Imported Workflow');
        setNodes(workflowData.nodes || []);
        setEdges(workflowData.edges || []);
        setSelectedNodes([]);
        setIsEditingLabel(false);
        // Save to history after import
        saveToHistory();
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
  }, [setNodes, setEdges, saveToHistory]);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Zoom functions that were missing
  const zoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
      setZoomLevel(prev => Math.min(prev + 0.1, 2));
    }
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
      setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    }
  }, [reactFlowInstance]);

  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
      setZoomLevel(1);
    }
  }, [reactFlowInstance]);

  // Label editing functions that were missing
  const startLabelEdit = useCallback(() => {
    if (selectedNodes && selectedNodes.length > 0 && selectedNodes[0]) {
      setIsEditingLabel(true);
      setTempLabel(selectedNodes[0].data?.label || '');
    }
  }, [selectedNodes]);

  const saveLabelEdit = useCallback(() => {
    if (selectedNodes && selectedNodes.length > 0 && selectedNodes[0] && isEditingLabel) {
      const firstSelectedNode = selectedNodes[0];
      setNodes(nds => {
        const newNodes = nds.map(node => 
          node.id === firstSelectedNode.id 
            ? { ...node, data: { ...node.data, label: tempLabel } }
            : node
        );
        // Save to history after label edit
        saveToHistory();
        return newNodes;
      });
      setIsEditingLabel(false);
    }
  }, [selectedNodes, isEditingLabel, tempLabel, setNodes, saveToHistory]);

  const cancelLabelEdit = useCallback(() => {
    setIsEditingLabel(false);
  }, []);

  // Safely get the first selected node
  const firstSelectedNode = selectedNodes && selectedNodes.length > 0 ? selectedNodes[0] : null;

  return (
    <div className="w-full h-full flex">
      {/* Left Panel - Properties and Controls */}
      <div className="w-80 bg-muted border-r flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Properties</h2>
        </div>
        
        {/* Framework Selection - Increased width to accommodate content */}
        <div className="flex-1 flex flex-col h-full">
          <div className="p-4 border-b">
            <AgenticFrameworkSelector
              selectedFramework={selectedFramework}
              setSelectedFramework={setSelectedFramework}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
            />
          </div>
          
          <div className="p-4 border-b">
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 min-w-[40px]"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 min-w-[40px]"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomOut} className="flex-1 min-w-[40px]">
                <Minus className="h-4 w-4" />
              </Button>
              <div className="px-2 text-sm flex items-center justify-center bg-muted rounded min-w-[50px]">
                {Math.round(zoomLevel * 100)}%
              </div>
              <Button variant="outline" size="sm" onClick={zoomIn} className="flex-1 min-w-[40px]">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={fitView} className="flex-1 min-w-[40px]">
                <Move className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-b">
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={deleteSelectedNodes}
              disabled={!selectedNodes || selectedNodes.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
          
          {/* Properties Panel - Takes remaining space without scrolling */}
          <div className="p-4 flex-1">
            {firstSelectedNode ? (
              <div className="space-y-4 h-full">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="node-label">Label</Label>
                    {!isEditingLabel ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={startLabelEdit}
                        className="h-6 px-2"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={saveLabelEdit}
                          className="h-6 px-2"
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={cancelLabelEdit}
                          className="h-6 px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditingLabel ? (
                    <Input 
                      id="node-label"
                      value={tempLabel}
                      onChange={(e) => setTempLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveLabelEdit();
                        if (e.key === 'Escape') cancelLabelEdit();
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded text-sm">
                      {firstSelectedNode?.data?.label || 'No label'}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="node-description">Description</Label>
                  <Textarea 
                    id="node-description"
                    value={firstSelectedNode?.data?.description || ''}
                    onChange={(e) => {
                      setNodes(nds => {
                        const newNodes = nds.map(node => 
                          node.id === firstSelectedNode?.id 
                            ? { ...node, data: { ...node.data, description: e.target.value } }
                            : node
                      );
                        // Save to history after description change
                        saveToHistory();
                        return newNodes;
                      });
                    }}
                    className="min-h-[80px]"
                  />
                </div>
                
                {firstSelectedNode?.type !== 'group' && (
                  <>
                    <div>
                      <Label htmlFor="node-action">Action</Label>
                      <Textarea 
                        id="node-action"
                        value={firstSelectedNode?.data?.action || ''}
                        onChange={(e) => {
                          setNodes(nds => {
                            const newNodes = nds.map(node => 
                              node.id === firstSelectedNode?.id 
                                ? { ...node, data: { ...node.data, action: e.target.value } }
                                : node
                          );
                            // Save to history after action change
                            saveToHistory();
                            return newNodes;
                          });
                        }}
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="node-output">Output</Label>
                      <Textarea 
                        id="node-output"
                        value={firstSelectedNode?.data?.output || ''}
                        onChange={(e) => {
                          setNodes(nds => {
                            const newNodes = nds.map(node => 
                              node.id === firstSelectedNode?.id 
                                ? { ...node, data: { ...node.data, output: e.target.value } }
                                : node
                          );
                            // Save to history after output change
                            saveToHistory();
                            return newNodes;
                          });
                        }}
                        className="min-h-[80px]"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 h-full flex items-center justify-center">
                <p>Select a node to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar - Streamlined with workflow name and essential controls */}
        <div className="bg-background border-b p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-64"
            />
            <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-2">
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={saveWorkflow}
              disabled={!isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
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
        
        {/* Framework Info Bar */}
        <div className="bg-muted border-b p-2 flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Framework: {agenticFrameworks.find(f => f.id === selectedFramework)?.name || 'None'}</span>
          </div>
          
          {selectedFramework === 'multiagent' && selectedAgent && (
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Agent: {mockAgents.find(a => a.id === selectedAgent)?.name || 'None'}</span>
            </div>
          )}
          
          <div className="ml-auto text-muted-foreground">
            {agenticFrameworks.find(f => f.id === selectedFramework)?.description}
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 relative">
          <div className="h-full w-full" ref={reactFlowWrapper}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={customOnNodesChange}
                onEdgesChange={customOnEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                fitView
                nodeTypes={{
                  agent: (props) => <AgentNode {...props} />,
                  decision: (props) => <DecisionNode {...props} />,
                  tool: (props) => <ToolNode {...props} />,
                  human: (props) => <HumanNode {...props} />,
                  event: (props) => <EventNode {...props} />,
                  gateway: (props) => <GatewayNode {...props} />,
                  datastore: (props) => <DataStoreNode {...props} />,
                  group: (props) => <GroupNode {...props} />,
                }}
                className="bg-muted"
              >
                <Controls className="bg-background border-border" />
                <Background gap={16} className="bg-background" />
                
                {/* Framework-specific node palette on canvas */}
                <Panel position="top-left" className="bg-background rounded-lg shadow-md p-3 border border-border">
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
                          <Icon className="h-4 w-4" />
                          <span className="text-xs whitespace-nowrap">{nodeType.label}</span>
                        </div>
                      );
                    })}
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

export default AdvancedWorkflowEditor;