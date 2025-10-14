import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug } from 'lucide-react';

export default function MaestroIntegrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">Connect external services and APIs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>LangChain, CrewAI, AutoGen, and more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <Plug className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Integration catalog coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
