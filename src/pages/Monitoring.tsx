import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitoring</h1>
        <p className="text-muted-foreground">Logs, metrics, and traces</p>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="traces">Traces</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-card rounded-lg border p-4 font-mono text-xs space-y-1 max-h-[600px] overflow-auto">
                <p className="text-muted-foreground">[2025-10-14 05:55:11] INFO: Run r-10001 started</p>
                <p className="text-muted-foreground">[2025-10-14 05:55:12] INFO: Agent a-research initialized</p>
                <p className="text-success">[2025-10-14 05:55:15] INFO: HTTP tool invoked successfully</p>
                <p className="text-muted-foreground">[2025-10-14 05:55:18] INFO: Processing response...</p>
                <p className="text-success">[2025-10-14 05:55:22] INFO: Step 1 completed (4.2s)</p>
                <p className="text-muted-foreground">[2025-10-14 05:55:23] INFO: Calling LLM for summarization</p>
                <p className="text-success">[2025-10-14 05:56:08] INFO: Step 2 completed (45.1s)</p>
                <p className="text-destructive">[2025-10-14 05:56:10] ERROR: Postgres connection timeout</p>
                <p className="text-warning">[2025-10-14 05:56:11] WARN: Retrying with exponential backoff...</p>
                <p className="text-success">[2025-10-14 05:56:15] INFO: Connection restored</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Metrics visualization coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distributed Traces</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Trace explorer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
