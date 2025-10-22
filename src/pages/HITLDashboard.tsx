import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HITLApprovalCard } from '@/components/apa/HITLApprovalCard';
import { Shield, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Mock data - replace with actual API calls
const mockHITLRequests = [
  {
    id: '1',
    run_id: 'run-123',
    agent_id: 'agent-456',
    request_type: 'action_approval',
    reason: 'Agent attempting to delete user data. This requires human approval due to high risk.',
    action_details: {
      type: 'database_query',
      description: 'Delete user account and associated data',
      parameters: {
        user_id: '12345',
        cascade: true,
      },
    },
    risk_level: 'critical' as const,
    status: 'pending' as const,
    requested_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: '2',
    run_id: 'run-124',
    agent_id: 'agent-789',
    request_type: 'decision_input',
    reason: 'Customer requested a refund exceeding standard policy limits.',
    action_details: {
      type: 'financial_transaction',
      description: 'Process customer refund',
      parameters: {
        amount: 500,
        customer_id: '67890',
        reason: 'Product defect',
      },
    },
    risk_level: 'high' as const,
    status: 'pending' as const,
    requested_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '3',
    run_id: 'run-125',
    agent_id: 'agent-456',
    request_type: 'action_approval',
    reason: 'Agent wants to send marketing email to user who previously opted out.',
    action_details: {
      type: 'send_email',
      description: 'Send promotional email',
      parameters: {
        recipient: 'user@example.com',
        template: 'summer_sale',
      },
    },
    risk_level: 'medium' as const,
    status: 'pending' as const,
    requested_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

const mockStats = {
  by_status: {
    pending: 3,
    approved: 12,
    rejected: 4,
  },
  by_risk_level: {
    low: 2,
    medium: 5,
    high: 8,
    critical: 4,
  },
};

export default function HITLDashboard() {
  const [requests, setRequests] = useState(mockHITLRequests);
  const [activeTab, setActiveTab] = useState('pending');

  const handleApprove = async (requestId: string, feedback?: string) => {
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved' as const }
            : req
        )
      );
      
      toast.success('Request approved successfully');
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string, feedback?: string) => {
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected' as const }
            : req
        )
      );
      
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Human-in-the-Loop Dashboard
        </h1>
        <p className="text-muted-foreground">
          Review and approve high-risk agent actions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.by_status.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.by_status.approved}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.by_status.rejected}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.by_risk_level.high + mockStats.by_risk_level.critical}
            </div>
            <p className="text-xs text-muted-foreground">Active requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map(request => (
                <HITLApprovalCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">No Pending Requests</CardTitle>
                <CardDescription>
                  All requests have been reviewed
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedRequests.map(request => (
                <HITLApprovalCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">No Approved Requests</CardTitle>
                <CardDescription>
                  Approved requests will appear here
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {rejectedRequests.map(request => (
                <HITLApprovalCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">No Rejected Requests</CardTitle>
                <CardDescription>
                  Rejected requests will appear here
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
