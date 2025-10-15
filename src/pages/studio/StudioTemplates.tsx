import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockTemplates = [
  {
    id: 1,
    name: 'Invoice Processing',
    description: 'Extract data from invoices and update accounting system',
    category: 'Finance',
    downloads: 1234,
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Email Classifier',
    description: 'Automatically categorize and route incoming emails',
    category: 'Communication',
    downloads: 892,
    rating: 4.6,
  },
  {
    id: 3,
    name: 'Lead Generation',
    description: 'Scrape and qualify leads from multiple sources',
    category: 'Sales',
    downloads: 2145,
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Report Generator',
    description: 'Generate weekly reports from multiple data sources',
    category: 'Analytics',
    downloads: 567,
    rating: 4.5,
  },
  {
    id: 5,
    name: 'Customer Onboarding',
    description: 'Automate customer onboarding workflow and notifications',
    category: 'HR',
    downloads: 778,
    rating: 4.7,
  },
  {
    id: 6,
    name: 'Data Backup',
    description: 'Schedule and verify automated data backups',
    category: 'IT',
    downloads: 445,
    rating: 4.4,
  },
];

export default function StudioTemplates() {
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
          <Input placeholder="Search templates..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => (
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
                  <span>⭐</span>
                  <span>{template.rating}</span>
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
                <Button size="sm" variant="ghost" className="group-hover:bg-primary/10 group-hover:text-primary">
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
