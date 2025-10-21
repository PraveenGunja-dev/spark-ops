/**
 * Agent Graph Visualizer
 * Interactive workflow diagram with execution path
 * Uses traditional tree structure (per user preference)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Play, 
  GitBranch, 
  IterationCw, 
  CheckCircle, 
  XCircle,
  Circle,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useState } from 'react';

interface WorkflowNode {
  id: string;
  type: 'start' | 'step' | 'decision' | 'loop' | 'end';
  name: string;
  status?: 'pending' | 'running' | 'success' | 'failed';
  children?: WorkflowNode[];
  metadata?: {
    duration?: number;
    retries?: number;
    iterations?: number;
  };
}

interface AgentGraphProps {
  workflow: WorkflowNode;
  executionPath?: string[];
  className?: string;
}

/**
 * Recursive Node Component
 */
function WorkflowNodeComponent({
  node,
  isInPath,
  level = 0,
  isLast = false,
}: {
  node: WorkflowNode;
  isInPath: boolean;
  level?: number;
  isLast?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const getNodeIcon = () => {
    switch (node.type) {
      case 'start':
        return <Play className="h-4 w-4" />;
      case 'decision':
        return <GitBranch className="h-4 w-4" />;
      case 'loop':
        return <IterationCw className="h-4 w-4" />;
      case 'end':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (!node.status) return 'bg-muted text-muted-foreground';
    switch (node.status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'running':
        return 'bg-primary/10 text-primary border-primary/20 animate-pulse';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="relative">
      {/* Node */}
      <div className="flex items-start gap-2">
        {/* Indent */}
        {level > 0 && (
          <div className="flex items-center">
            {Array.from({ length: level }).map((_, i) => (
              <div key={i} className="w-6" />
            ))}
          </div>
        )}

        {/* Node Card */}
        <div
          className={cn(
            'flex-1 p-3 rounded-lg border-2 transition-all',
            getStatusColor(),
            isInPath && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getNodeIcon()}
              <span className="font-medium">{node.name}</span>
              {node.type !== 'start' && node.type !== 'end' && (
                <Badge variant="outline" className="text-xs">
                  {node.type}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {node.metadata?.duration && (
                <span className="text-xs text-muted-foreground">
                  {(node.metadata.duration / 1000).toFixed(2)}s
                </span>
              )}
              {node.metadata?.iterations && (
                <Badge variant="secondary" className="text-xs">
                  {node.metadata.iterations}x
                </Badge>
              )}
              {node.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-success" />
              )}
              {node.status === 'failed' && (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? '−' : '+'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2 ml-3 border-l-2 border-border pl-2">
          {node.children?.map((child, index) => (
            <div key={child.id} className="mt-2">
              <WorkflowNodeComponent
                node={child}
                isInPath={isInPath}
                level={level + 1}
                isLast={index === (node.children?.length || 0) - 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Agent Graph Component
 */
export function AgentGraph({ workflow, executionPath = [], className }: AgentGraphProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Workflow Graph</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(150, zoom + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="overflow-auto p-4"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoom}%`,
          }}
        >
          <WorkflowNodeComponent
            node={workflow}
            isInPath={executionPath.includes(workflow.id)}
          />
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Legend:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success/10 border-2 border-success/20" />
              <span>Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive/10 border-2 border-destructive/20" />
              <span>Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/10 border-2 border-primary/20" />
              <span>Running</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted border-2 border-border" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
