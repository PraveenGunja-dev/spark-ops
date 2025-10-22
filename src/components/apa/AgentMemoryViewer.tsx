import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Search, 
  Star,
  Clock,
  Eye,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgentMemory {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  importance_score?: number;
  access_count: number;
  similarity_score?: number;
  last_accessed_at?: string;
  created_at: string;
}

interface AgentMemoryViewerProps {
  memories: AgentMemory[];
  onSearch?: (query: string) => void;
  onFilterType?: (type: string) => void;
  className?: string;
}

const memoryTypeConfig = {
  episodic: {
    label: 'Episodic',
    description: 'Specific experiences and events',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  semantic: {
    label: 'Semantic',
    description: 'Facts and knowledge',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  procedural: {
    label: 'Procedural',
    description: 'Skills and procedures',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
};

export function AgentMemoryViewer({ 
  memories, 
  onSearch, 
  onFilterType,
  className 
}: AgentMemoryViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    onFilterType?.(type === 'all' ? '' : type);
  };

  const getImportanceColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 0.8) return 'text-red-500';
    if (score >= 0.6) return 'text-orange-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Agent Memory
          </CardTitle>
          <CardDescription>
            Search and explore agent's long-term memory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="memory-search">Search Memories</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="memory-search"
                  placeholder="Search by content..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="memory-type">Memory Type</Label>
              <Select value={typeFilter} onValueChange={handleTypeFilter}>
                <SelectTrigger id="memory-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="episodic">Episodic</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="procedural">Procedural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Cards */}
      <div className="space-y-3">
        {memories.map((memory) => {
          const typeConfig = memoryTypeConfig[memory.type];
          
          return (
            <Card key={memory.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className={cn('border-l-4 pb-3', typeConfig.color)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={typeConfig.color}>
                      {typeConfig.label}
                    </Badge>
                    {memory.similarity_score !== undefined && (
                      <Badge variant="secondary" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {(memory.similarity_score * 100).toFixed(0)}% match
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {memory.importance_score !== undefined && (
                      <div className="flex items-center gap-1">
                        <Star className={cn('h-4 w-4', getImportanceColor(memory.importance_score))} />
                        <span className="text-xs text-muted-foreground">
                          {(memory.importance_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-4">
                {/* Content */}
                <p className="text-sm leading-relaxed">{memory.content}</p>
                
                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>Accessed {memory.access_count} times</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(memory.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {memory.last_accessed_at && (
                    <div className="flex items-center gap-1">
                      <span>Last: {new Date(memory.last_accessed_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {memories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Memories Found</CardTitle>
            <CardDescription>
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'The agent has not stored any memories yet'}
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
