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
import { Wrench, Plus, Play, Trash2, Settings } from 'lucide-react';
import { useTools, useDeleteTool } from '@/hooks/useTools';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectSelector } from '@/components/ProjectSelector';
import { CreateToolDialog } from '@/components/tools/CreateToolDialog';
import { EditToolDialog } from '@/components/tools/EditToolDialog';
import { Pagination } from '@/components/ui/pagination';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Tools() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Get selected project from context
  const { selectedProjectId } = useProject();
  
  // Fetch tools
  const { data, isLoading } = useTools(selectedProjectId || '', page, pageSize);
  const tools = data?.items || [];
  const totalPages = data?.totalPages || 1;
  
  // Delete mutation
  const deleteTool = useDeleteTool();
  
  const handleDeleteClick = (tool: { id: string; name: string }) => {
    setToolToDelete(tool);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!toolToDelete) return;
    
    try {
      await deleteTool.mutateAsync(toolToDelete.id);
      toast.success(`Tool "${toolToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setToolToDelete(null);
    } catch (error) {
      console.error('Failed to delete tool:', error);
      toast.error('Failed to delete tool. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tools & Connectors</h1>
          <p className="text-muted-foreground">Registry of all tools and integrations</p>
        </div>
        <div className="flex items-center gap-3">
          <ProjectSelector />
          <CreateToolDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Registry</CardTitle>
          <CardDescription>
            Manage all tools (MCP layer) and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Loading tools...</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">No tools found. Create your first tool to get started.</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      {tool.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tool.kind}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.authType === 'oauth' ? 'default' : 'secondary'}>
                      {tool.authType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tool.rateLimitPerMin ? `${tool.rateLimitPerMin}/min` : 'Unlimited'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {tool.description || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(tool.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditToolDialog tool={tool} />
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(tool)}
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && tools.length > 0 && (
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
        title="Delete Tool"
        itemName={toolToDelete?.name}
        isDeleting={deleteTool.isPending}
      />
    </div>
  );
}