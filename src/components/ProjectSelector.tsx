/**
 * Project Selector Component
 * Dropdown to select active project
 */
import { useProjects } from '@/hooks/useProjects';
import { useProject } from '@/contexts/ProjectContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderKanban } from 'lucide-react';

export function ProjectSelector() {
  const { data, isLoading } = useProjects(1, 100);
  const { selectedProjectId, setSelectedProjectId } = useProject();

  // Auto-select first project if none selected
  const projects = data?.items || [];
  if (projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0].id);
  }

  return (
    <div className="flex items-center gap-2">
      <FolderKanban className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedProjectId || undefined}
        onValueChange={setSelectedProjectId}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Project'} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
