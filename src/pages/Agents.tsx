import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Bot, Play, Brain, Settings, BarChart3, Trash2 } from 'lucide-react';
import { useAgents, useDeleteAgent } from '@/hooks/useAgents';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectSelector } from '@/components/ProjectSelector';
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog';
import { EditAgentDialog } from '@/components/agents/EditAgentDialog';
import { Pagination } from '@/components/ui/pagination';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Agents() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Get selected project from context
  const { selectedProjectId } = useProject();
  
  // Fetch agents
  const { data, isLoading } = useAgents(selectedProjectId || '', page, pageSize);
  const agents = data?.items || [];
  const totalPages = data?.totalPages || 1;
  
  // Delete mutation
  const deleteAgent = useDeleteAgent();
  
  const handleDeleteClick = (agent: { id: string; name: string }) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;
    
    try {
      await deleteAgent.mutateAsync(agentToDelete.id);
      toast.success(`Agent "${agentToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast.error('Failed to delete agent. Please try again.');
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Registry of all autonomous agents in the system</p>
        </div>
        <div className="flex items-center gap-3">
          <ProjectSelector />
          <CreateAgentDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Registry</CardTitle>
          <CardDescription>
            Manage all autonomous agents in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Avg Latency</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      {agent.name}
                    </div>
                  </TableCell>
                  <TableCell>v1.0</TableCell>
                  <TableCell>
                    <Badge variant="outline">{agent.runtime}</Badge>
                  </TableCell>
                  <TableCell>2 min ago</TableCell>
                  <TableCell>
                    {agent.health === 'healthy' ? (
                      <span className="text-green-500">98.7%</span>
                    ) : (
                      <span className="text-red-500">85.2%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {agent.health === 'healthy' ? '245ms' : '420ms'}
                  </TableCell>
                  <TableCell>Ada Admin</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditAgentDialog agent={agent} />
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Metrics
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(agent)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && agents.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          total={data?.total || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Agent"
        itemName={agentToDelete?.name}
        description={`This will permanently delete the agent "${agentToDelete?.name}". Any associated runs and configurations will be affected.`}
        isDeleting={deleteAgent.isPending}
      />
    </div>
  );
}