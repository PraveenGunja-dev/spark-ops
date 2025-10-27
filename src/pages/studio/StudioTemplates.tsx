import { Search, Filter, Loader2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplates, useIncrementDownloads } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

export default function StudioTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const { toast } = useToast();
  
  // Fetch templates with search and category filter
  const { data, isLoading, error } = useTemplates(1, 100, selectedCategory, searchQuery);
  const templates = data?.items || [];
  
  const { mutate: incrementDownloads } = useIncrementDownloads();
  
  const handleUseTemplate = (templateId: string, templateName: string) => {
    // Increment download count
    incrementDownloads(templateId, {
      onSuccess: () => {
        toast({
          title: 'Template Selected',
          description: `"${templateName}" is ready to use!`,
        });
      },
    });
  };
  
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center text-destructive">
          <p>Failed to load templates</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Automation Templates</h1>
        <p className="text-muted-foreground">
          Start with pre-built templates to accelerate your automation development
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading templates...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No templates found</p>
          {searchQuery && (
            <p className="text-sm mt-2">Try adjusting your search criteria</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
          <Card
            key={template.id}
            className="group hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="mb-2">
                  {template.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating.toFixed(1)}</span>
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{template.downloads.toLocaleString()} downloads</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="group-hover:bg-primary/10 group-hover:text-primary"
                  onClick={() => handleUseTemplate(template.id, template.name)}
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}
