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
import { Wrench, Plus, Play } from 'lucide-react';
import { mockTools } from '@/lib/mockData';

export default function Tools() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tools & Connectors</h1>
          <p className="text-muted-foreground">Registry of all tools and integrations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Tool
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Registry</CardTitle>
          <CardDescription>
            Manage all tools (MCP layer) and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Calls / Day</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTools.map((tool) => (
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
                  <TableCell>Ada Admin</TableCell>
                  <TableCell>1,240</TableCell>
                  <TableCell>5 min ago</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}