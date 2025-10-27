import { useState } from 'react';
import { Search, SlidersHorizontal, Plus, Download, MoreVertical, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useProject } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

export default function StudioWorkspace() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { selectedProjectId } = useProject();
  
  // Fetch workflows (which are the "projects" in the studio)
  const { data: workflowsData, isLoading } = useWorkflows(selectedProjectId || '', 1, 100);
  const workflows = workflowsData?.items || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
      case 'draft':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };
  
  // Filter workflows by search
  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading workflows...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for automations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Columns (4)
        </Button>
        <Button variant="outline" size="sm">
          Owner: All
        </Button>
        <Button variant="outline" size="sm">
          Status: All
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Install locally
        </Button>
      </div>

      {/* Projects Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Edited</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No workflows found
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkflows.map((workflow) => (
                <TableRow 
                  key={workflow.id} 
                  className="group hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`/studio/workflow/${workflow.id}`)}
                >
                  <TableCell>
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell className="text-muted-foreground">Workflow</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(workflow.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/studio/workflow/${workflow.id}`);
                        }}>Open</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Share</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Export</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredWorkflows.length} of {workflows.length} automations
      </div>
    </div>
  );
}
