import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockTools } from '@/lib/mockData';
import { Wrench, Database, Globe, Chrome, Search, HardDrive, Zap } from 'lucide-react';

const kindIcons = {
  http: Globe,
  db: Database,
  saas: Zap,
  browser: Chrome,
  search: Search,
  storage: HardDrive,
  custom: Wrench,
};

export default function Tools() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-muted-foreground">Connectors and integrations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTools.map((tool) => {
          const Icon = kindIcons[tool.kind];
          
          return (
            <Card key={tool.id} className="hover:shadow-md transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{tool.kind}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tool.provider && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{tool.provider}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Auth Type</span>
                  <Badge variant="secondary" className="text-xs">{tool.authType}</Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Environment</span>
                  <Badge variant="outline" className="text-xs">{tool.env}</Badge>
                </div>

                {tool.rateLimitPerMin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate Limit</span>
                    <span className="font-mono text-xs">{tool.rateLimitPerMin}/min</span>
                  </div>
                )}

                {tool.scopes && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Scopes</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.scopes.map(scope => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {tool.lastErrorAt && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-destructive">
                      Last error: {new Date(tool.lastErrorAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t text-xs text-muted-foreground">
                  Created {new Date(tool.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
