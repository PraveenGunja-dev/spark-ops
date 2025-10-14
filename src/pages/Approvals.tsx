import { useState } from 'react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockRuns, mockAgents } from '@/lib/mockData';
import { Check, X, Clock, MessageSquare } from 'lucide-react';

// Mock approval data
const mockApprovals = [
  {
    id: '1',
    runId: 'r-10001',
    agentId: 'a-research',
    step: 'Finalize Report',
    type: 'Budget Approval',
    submitted: '2025-10-14T08:30:00Z',
    reason: 'Invoice exceeds $1000 threshold',
    status: 'pending',
  },
  {
    id: '2',
    runId: 'r-10002',
    agentId: 'a-marketer',
    step: 'Publish Campaign',
    type: 'Content Review',
    submitted: '2025-10-14T07:15:00Z',
    reason: 'Generated content contains sensitive topics',
    status: 'pending',
  },
  {
    id: '3',
    runId: 'r-10003',
    agentId: 'a-support',
    step: 'Refund Request',
    type: 'Financial Approval',
    submitted: '2025-10-14T06:45:00Z',
    reason: 'Customer refund over $500',
    status: 'pending',
  },
];

export default function Approvals() {
  const [approvals, setApprovals] = useState(mockApprovals);
  const [selectedApproval, setSelectedApproval] = useState<typeof mockApprovals[0] | null>(null);

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(approval => 
      approval.id === id 
        ? { ...approval, status: 'approved' } 
        : approval
    ));
  };

  const handleReject = (id: string) => {
    setApprovals(approvals.map(approval => 
      approval.id === id 
        ? { ...approval, status: 'rejected' } 
        : approval
    ));
  };

  const getAgentName = (agentId: string) => {
    const agent = mockAgents.find(a => a.id === agentId);
    return agent ? agent.name : agentId;
  };

  const getRunDetails = (runId: string) => {
    return mockRuns.find(r => r.id === runId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Human-in-the-Loop Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending agent actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Review and take action on requests requiring human approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.filter(a => a.status === 'pending').map((approval) => {
                const run = getRunDetails(approval.runId);
                return (
                  <TableRow key={approval.id}>
                    <TableCell className="font-medium">{approval.runId}</TableCell>
                    <TableCell>{getAgentName(approval.agentId)}</TableCell>
                    <TableCell>{approval.step}</TableCell>
                    <TableCell>{approval.type}</TableCell>
                    <TableCell>
                      {new Date(approval.submitted).toLocaleString()}
                    </TableCell>
                    <TableCell>{approval.reason}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApproval(approval)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Approval Details</DialogTitle>
                              <DialogDescription>
                                Review step details and take action
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApproval && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium">Run Information</h4>
                                    <div className="text-sm text-muted-foreground mt-2">
                                      <p><span className="font-medium">Run ID:</span> {selectedApproval.runId}</p>
                                      <p><span className="font-medium">Agent:</span> {getAgentName(selectedApproval.agentId)}</p>
                                      <p><span className="font-medium">Step:</span> {selectedApproval.step}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Approval Details</h4>
                                    <div className="text-sm text-muted-foreground mt-2">
                                      <p><span className="font-medium">Type:</span> {selectedApproval.type}</p>
                                      <p><span className="font-medium">Submitted:</span> {new Date(selectedApproval.submitted).toLocaleString()}</p>
                                      <p><span className="font-medium">Reason:</span> {selectedApproval.reason}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Step Input</h4>
                                  <ScrollArea className="h-32 rounded-md border p-4">
                                    <pre className="text-xs">
                                      {JSON.stringify({
                                        action: "process_invoice",
                                        amount: 1250.75,
                                        vendor: "ABC Supplies",
                                        description: "Office equipment purchase",
                                        urgency: "normal"
                                      }, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Step Output</h4>
                                  <ScrollArea className="h-32 rounded-md border p-4">
                                    <pre className="text-xs">
                                      {JSON.stringify({
                                        decision: "requires_approval",
                                        reason: "Amount exceeds $1000 threshold",
                                        recommendation: "Human review required for financial compliance",
                                        risk_score: 0.75
                                      }, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handleReject(selectedApproval.id)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button 
                                    onClick={() => handleApprove(selectedApproval.id)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {approvals.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {approvals.filter(a => a.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {approvals.filter(a => a.status === 'rejected').length}
            </div>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}