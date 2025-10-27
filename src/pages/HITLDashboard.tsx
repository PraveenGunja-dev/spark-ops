import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HITLApprovalCard } from '@/components/apa/HITLApprovalCard';
import { Shield, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePendingHITL, useApproveHITL, useRejectHITL } from '@/hooks/useAPA';

export default function HITLDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  
  // Fetch pending HITL requests with auto-refresh every 10 seconds
  const { data: hitlData, isLoading, error } = usePendingHITL({
    refetchInterval: 10000,
  });
  
  // Approve HITL mutation
  const { mutate: approveHITL, isPending: isApproving } = useApproveHITL();
  
  // Reject HITL mutation
  const { mutate: rejectHITL, isPending: isRejecting } = useRejectHITL();

  const handleApprove = async (requestId: string, feedback?: string) => {
    approveHITL(
      { requestId, feedback },
      {
        onSuccess: (data) => {
          toast.success('Request approved successfully');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to approve request');
        },
      }
    );
  };

  const handleReject = async (requestId: string, feedback?: string) => {
    rejectHITL(
      { requestId, feedback: feedback || 'Request rejected by human reviewer' },
      {
        onSuccess: (data) => {
          toast.success('Request rejected');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to reject request');
        },
      }
    );
  };

  // Filter requests by status and ensure action_details has required structure
  const requests = (hitlData?.requests || []).map(req => ({
    ...req,
    action_details: {
      type: req.action_details?.type || 'unknown',
      description: req.action_details?.description,
      parameters: req.action_details?.parameters || req.action_details,
    },
  }));
  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
  const approvedRequests = useMemo(() => requests.filter(r => r.status === 'approved'), [requests]);
  const rejectedRequests = useMemo(() => requests.filter(r => r.status === 'rejected'), [requests]);
  
  // Calculate stats from real data
  const stats = useMemo(() => {
    const byStatus = {
      pending: pendingRequests.length,
      approved: approvedRequests.length,
      rejected: rejectedRequests.length,
    };
    
    const byRiskLevel = requests.reduce((acc, req) => {
      const level = req.risk_level || 'medium';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { by_status: byStatus, by_risk_level: byRiskLevel };
  }, [requests, pendingRequests, approvedRequests, rejectedRequests]);

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
            <div className="text-2xl font-bold">{stats.by_status.pending}</div>
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
            <div className="text-2xl font-bold">{stats.by_status.approved}</div>
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
            <div className="text-2xl font-bold">{stats.by_status.rejected}</div>
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
              {(stats.by_risk_level.high || 0) + (stats.by_risk_level.critical || 0)}
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
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading pending requests...</span>
            </div>
          ) : pendingRequests.length > 0 ? (
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
