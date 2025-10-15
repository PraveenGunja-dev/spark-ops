import { useState } from 'react';
import { Search, SlidersHorizontal, Plus, Download, MoreVertical, FolderOpen } from 'lucide-react';
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

const mockProjects = [
  { id: 1, name: 'Customer Onboarding Flow', content: 'Workflow', edited: '2 hours ago', status: 'Draft' },
  { id: 2, name: 'Invoice Processing', content: 'Automation', edited: '1 day ago', status: 'Published' },
  { id: 3, name: 'Data Extraction Pipeline', content: 'Agent', edited: '3 days ago', status: 'Draft' },
  { id: 4, name: 'Email Classifier', content: 'Workflow', edited: '5 days ago', status: 'Testing' },
  { id: 5, name: 'Report Generator', content: 'Automation', edited: '1 week ago', status: 'Published' },
  { id: 6, name: 'Sentiment Analysis Bot', content: 'Agent', edited: '2 weeks ago', status: 'Draft' },
  { id: 7, name: 'Lead Scoring System', content: 'Workflow', edited: '3 weeks ago', status: 'Published' },
  { id: 8, name: 'Document Parser', content: 'Automation', edited: '1 month ago', status: 'Archived' },
];

export default function StudioWorkspace() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
      case 'Draft':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'Testing':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'Archived':
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

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
            {mockProjects
              .filter((project) =>
                project.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((project) => (
                <TableRow key={project.id} className="group hover:bg-muted/30 cursor-pointer">
                  <TableCell>
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-muted-foreground">{project.content}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{project.edited}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Open</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Export</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Info */}
      <div className="text-sm text-muted-foreground">
        Showing {mockProjects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length} of {mockProjects.length} automations
      </div>
    </div>
  );
}
