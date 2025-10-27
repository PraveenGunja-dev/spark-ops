import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Sparkles, BarChart3, AlertCircle } from 'lucide-react';
import WorkflowBuilder from './WorkflowBuilder';
import { FrameworkSelector } from './FrameworkSelector';
import {
  ExecutionFramework,
  suggestFramework,
  getRecommendationReason,
  AVAILABLE_FRAMEWORKS,
} from '@/lib/workflow-frameworks';

interface WorkflowStats {
  nodeCount: number;
  edgeCount: number;
  agentCount: number;
  hasConditions: boolean;
  hasParallelPaths: boolean;
}

interface EnhancedWorkflowBuilderProps {
  workflowId?: string;
  onExecute?: (framework: ExecutionFramework, nodes: Node[], edges: Edge[]) => Promise<void>;
}

export function EnhancedWorkflowBuilder({
  workflowId,
  onExecute,
}: EnhancedWorkflowBuilderProps) {
  const [selectedFramework, setSelectedFramework] = useState<ExecutionFramework>('custom');
  const [recommendedFramework, setRecommendedFramework] = useState<ExecutionFramework | undefined>();
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats>({
    nodeCount: 0,
    edgeCount: 0,
    agentCount: 0,
    hasConditions: false,
    hasParallelPaths: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentNodes, setCurrentNodes] = useState<Node[]>([]);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>([]);
  const [showFrameworkSelector, setShowFrameworkSelector] = useState(false);

  /**
   * Analyze workflow structure and suggest optimal framework
   */
  const analyzeWorkflow = useCallback(async (nodes: Node[], edges: Edge[]) => {
    setIsAnalyzing(true);

    // Count agent nodes
    const agentCount = nodes.filter(
      (node) => node.type === 'agent' || node.data?.type === 'agent'
    ).length;

    // Detect conditions (decision nodes or conditional edges)
    const hasConditions =
      nodes.some((node) => node.type === 'decision') ||
      edges.some((edge) => edge.data?.condition);

    // Detect parallel paths (nodes with multiple outgoing edges)
    const hasParallelPaths = nodes.some((node) => {
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);
      return outgoingEdges.length > 1;
    });

    const stats: WorkflowStats = {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      agentCount,
      hasConditions,
      hasParallelPaths,
    };

    setWorkflowStats(stats);

    // Suggest framework based on analysis
    if (nodes.length > 0) {
      const suggested = suggestFramework(
        nodes.length,
        hasConditions,
        hasParallelPaths,
        agentCount
      );
      setRecommendedFramework(suggested);
      
      // If no framework manually selected yet, use suggestion
      if (selectedFramework === 'custom' && suggested !== 'custom') {
        setSelectedFramework(suggested);
      }
    }

    setIsAnalyzing(false);
  }, [selectedFramework]);

  /**
   * Handle workflow state changes from WorkflowBuilder
   */
  const handleWorkflowChange = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      setCurrentNodes(nodes);
      setCurrentEdges(edges);
      
      // Auto-analyze on changes
      if (nodes.length > 0) {
        analyzeWorkflow(nodes, edges);
      }
    },
    [analyzeWorkflow]
  );

  /**
   * Execute workflow with selected framework
   */
  const handleExecuteWorkflow = useCallback(async () => {
    if (currentNodes.length === 0) {
      alert('Please add nodes to the workflow before executing.');
      return;
    }

    setIsExecuting(true);

    try {
      if (onExecute) {
        await onExecute(selectedFramework, currentNodes, currentEdges);
      } else {
        // Default execution via API
        const response = await fetch('/api/v1/workflows/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflowId: workflowId || 'temp-workflow',
            framework: selectedFramework,
            nodes: currentNodes,
            edges: currentEdges,
          }),
        });

        if (!response.ok) {
          throw new Error('Workflow execution failed');
        }

        const result = await response.json();
        console.log('Workflow execution result:', result);
        alert(`Workflow executed successfully using ${AVAILABLE_FRAMEWORKS[selectedFramework].name}!`);
      }
    } catch (error) {
      console.error('Execution error:', error);
      alert(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  }, [selectedFramework, currentNodes, currentEdges, workflowId, onExecute]);

  /**
   * Force analyze workflow
   */
  const handleAnalyzeClick = useCallback(() => {
    analyzeWorkflow(currentNodes, currentEdges);
    setShowFrameworkSelector(true);
  }, [currentNodes, currentEdges, analyzeWorkflow]);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Enhanced Header with Framework Info */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Multi-Framework Workflow Builder
              <Sparkles className="h-5 w-5 text-purple-500" />
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Build workflows and execute with {AVAILABLE_FRAMEWORKS[selectedFramework].name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Workflow Stats */}
          {workflowStats.nodeCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Nodes</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {workflowStats.nodeCount}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Agents</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {workflowStats.agentCount}
                </div>
              </div>
              {workflowStats.hasConditions && (
                <>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                    Conditional
                  </Badge>
                </>
              )}
              {workflowStats.hasParallelPaths && (
                <>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    Parallel
                  </Badge>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing || currentNodes.length === 0}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze & Select Framework'}
          </Button>

          <Button
            size="sm"
            onClick={handleExecuteWorkflow}
            disabled={isExecuting || currentNodes.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Execute Workflow'}
          </Button>
        </div>
      </div>

      {/* Framework Selector Panel (Collapsible) */}
      {showFrameworkSelector && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Execution Framework Selection</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFrameworkSelector(false)}
              >
                Hide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FrameworkSelector
              selectedFramework={selectedFramework}
              onSelect={setSelectedFramework}
              nodeCount={workflowStats.nodeCount}
              hasConditions={workflowStats.hasConditions}
              hasParallelPaths={workflowStats.hasParallelPaths}
              recommendedFramework={recommendedFramework}
            />
          </CardContent>
        </Card>
      )}

      {/* Current Framework Indicator (when selector is hidden) */}
      {!showFrameworkSelector && workflowStats.nodeCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Execution Framework:
          </span>
          <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
            {AVAILABLE_FRAMEWORKS[selectedFramework].icon} {AVAILABLE_FRAMEWORKS[selectedFramework].name}
          </Badge>
          {recommendedFramework && recommendedFramework !== selectedFramework && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-3 w-3" />
              <span>
                Recommended: {AVAILABLE_FRAMEWORKS[recommendedFramework].name}
              </span>
            </div>
          )}
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowFrameworkSelector(true)}
            className="ml-auto"
          >
            Change Framework
          </Button>
        </div>
      )}

      {/* Main Workflow Builder (Wrapped to capture state changes) */}
      <div className="flex-1 min-h-0">
        <WorkflowBuilderWrapper onChange={handleWorkflowChange} />
      </div>
    </div>
  );
}

/**
 * Wrapper component to capture workflow state changes
 */
interface WorkflowBuilderWrapperProps {
  onChange: (nodes: Node[], edges: Edge[]) => void;
}

function WorkflowBuilderWrapper({ onChange }: WorkflowBuilderWrapperProps) {
  // We need to wrap the existing WorkflowBuilder to capture state changes
  // This is a temporary solution - ideally WorkflowBuilder would accept onChange prop
  
  useEffect(() => {
    // Listen for workflow changes via custom events
    const handleWorkflowUpdate = (event: CustomEvent) => {
      const { nodes, edges } = event.detail;
      onChange(nodes, edges);
    };

    window.addEventListener('workflowUpdate' as any, handleWorkflowUpdate);
    
    return () => {
      window.removeEventListener('workflowUpdate' as any, handleWorkflowUpdate);
    };
  }, [onChange]);

  return <WorkflowBuilder />;
}
