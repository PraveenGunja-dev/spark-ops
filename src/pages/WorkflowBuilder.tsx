import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import { Card, CardContent } from '@/components/ui/card';

export default function WorkflowBuilderPage() {
  return (
    <div className="space-y-6">
      <Card className="h-[calc(100vh-120px)]">
        <CardContent className="p-6 h-full">
          <WorkflowBuilder />
        </CardContent>
      </Card>
    </div>
  );
}
