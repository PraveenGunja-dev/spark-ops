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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Brain, 
  Play, 
  Square, 
  RotateCcw, 
  BarChart3, 
  Settings, 
  Eye, 
  MoreHorizontal,
  Pause,
  Trash2,
  FileText,
  Zap,
  Shield,
  Cpu,
  Wallet
} from 'lucide-react';
import { mockAgents } from '@/lib/mockData';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';

// Extended agent data with more detailed information
const extendedAgents = mockAgents.map(agent => ({
  ...agent,
  type: ['Planner', 'Parser', 'Validator', 'Executor'][Math.floor(Math.random() * 4)],
  framework: ['LangChain', 'CrewAI', 'Autogen', 'OpenAgents'][Math.floor(Math.random() * 4)],
  status: ['idle', 'running', 'failed'][Math.floor(Math.random() * 3)] as 'idle' | 'running' | 'failed',
  costPerRun: (Math.random() * 10).toFixed(2),
  successRate: (85 + Math.random() * 15).toFixed(1) + '%',
  lastRun: '2 min ago',
  uptime: '99.' + (Math.floor(Math.random() * 9) + 1) + '%'
}));

export default function Maestro() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // KPI data
  const totalAgents = extendedAgents.length;
  const activeAgents = extendedAgents.filter(a => a.status === 'running').length;
  const idleAgents = extendedAgents.filter(a => a.status === 'idle').length;
  const failedAgents = extendedAgents.filter(a => a.status === 'failed').length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧠 Agent Maestro</h1>
          <p className="text-muted-foreground">Orchestrate, monitor, and manage AI Agents, Robots, and Human Workflows</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
          <Brain className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Agents" 
          value={totalAgents} 
          icon={Brain}
          className="border-l-4 border-l-blue-500"
        />
        <KpiCard 
          title="Active Agents" 
          value={activeAgents} 
          change="+2 from last hour"
          changeType="positive"
          icon={Zap}
          className="border-l-4 border-l-green-500"
        />
        <KpiCard 
          title="Idle Agents" 
          value={idleAgents} 
          icon={Pause}
          className="border-l-4 border-l-yellow-500"
        />
        <KpiCard 
          title="Failed Agents" 
          value={failedAgents} 
          change="-1 from last hour"
          changeType="negative"
          icon={Shield}
          className="border-l-4 border-l-red-500"
        />
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extendedAgents.map((agent) => (
          <Card 
            key={agent.id} 
            className={`transition-all hover:shadow-lg cursor-pointer ${selectedAgent === agent.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    {agent.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {agent.promptSummary}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{agent.type}</Badge>
                  <Badge variant="outline">{agent.framework}</Badge>
                  <Badge variant={agent.health === 'healthy' ? 'default' : agent.health === 'degraded' ? 'secondary' : 'destructive'}>
                    {agent.health}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{agent.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-medium">{agent.uptime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost/Run</p>
                    <p className="font-medium">${agent.costPerRun}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success</p>
                    <p className="font-medium">{agent.successRate}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Deploy
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Registry Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Agent Registry</CardTitle>
              <CardDescription>
                Manage all autonomous agents in the system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Cost/Run</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extendedAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      {agent.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{agent.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{agent.framework}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={agent.status === 'running' ? 'running' : agent.status === 'failed' ? 'failed' : 'succeeded'} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.health === 'healthy' ? 'default' : agent.health === 'degraded' ? 'secondary' : 'destructive'}>
                      {agent.health}
                    </Badge>
                  </TableCell>
                  <TableCell>${agent.costPerRun}</TableCell>
                  <TableCell>{agent.successRate}</TableCell>
                  <TableCell>{agent.lastRun}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Metrics
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Policy
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Agent Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline">
          <Play className="h-4 w-4 mr-2" />
          Start All Agents
        </Button>
        <Button variant="outline">
          <Square className="h-4 w-4 mr-2" />
          Stop All Agents
        </Button>
        <Button variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Restart All Agents
        </Button>
        <Button variant="outline">
          <Cpu className="h-4 w-4 mr-2" />
          Optimize All
        </Button>
        <Button variant="outline">
          <Wallet className="h-4 w-4 mr-2" />
          Budget Review
        </Button>
      </div>
    </div>
  );
}