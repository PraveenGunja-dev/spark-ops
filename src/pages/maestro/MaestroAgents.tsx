import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  BarChart3,
  Zap,
  Cpu,
  Activity,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Terminal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';





// Stepper component for agent deployment
const DeploymentStepper = ({ step }: { step: number }) => {
  const steps = [
    { id: 1, title: 'Select Agents', description: 'Choose agents to deploy' },
    { id: 2, title: 'Configure', description: 'Set deployment parameters' },
    { id: 3, title: 'Review', description: 'Confirm deployment details' },
    { id: 4, title: 'Deploy', description: 'Execute deployment' },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10"></div>
        <div 
          className="absolute top-4 left-0 h-0.5 bg-blue-500 -z-10 transition-all duration-300 ease-in-out" 
          style={{ width: `${(step - 1) * (100 / (steps.length - 1))}%` }}
        ></div>
        
        {steps.map((stepItem, index) => (
          <div key={stepItem.id} className="flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 ${
              stepItem.id <= step 
                ? 'bg-blue-500 text-white border-2 border-blue-500' 
                : 'bg-background border-2 border-muted'
            }`}>
              {stepItem.id < step ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{stepItem.id}</span>
              )}
            </div>
            <div className="text-center">
              <p className={`text-sm font-medium ${
                stepItem.id <= step ? 'text-blue-500' : 'text-muted-foreground'
              }`}>
                {stepItem.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                {stepItem.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Agent Selection Component
const AgentSelectionStep = ({ 
  agents, 
  selectedAgents, 
  setSelectedAgents 
}: { 
  agents: any[]; 
  selectedAgents: string[]; 
  setSelectedAgents: (agents: string[]) => void; 
}) => {
  const toggleAgent = (agentId: string) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  const toggleAll = () => {
    if (selectedAgents.length === agents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(agents.map(agent => agent.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Select Agents to Deploy</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleAll}
        >
          {selectedAgents.length === agents.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {agents.map((agent) => (
          <Card 
            key={agent.id} 
            className={`cursor-pointer transition-all ${
              selectedAgents.includes(agent.id) 
                ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => toggleAgent(agent.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${
                  selectedAgents.includes(agent.id) 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-muted-foreground'
                }`}>
                  {selectedAgents.includes(agent.id) && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{agent.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {agent.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {agent.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {agent.framework}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {agent.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Selected {selectedAgents.length} of {agents.length} agents
      </div>
    </div>
  );
};

// Configuration Step
const ConfigurationStep = ({ 
  configuration, 
  setConfiguration 
}: { 
  configuration: any; 
  setConfiguration: (config: any) => void; 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Deployment Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Environment</label>
          <Select 
            value={configuration.environment} 
            onValueChange={(value) => setConfiguration({...configuration, environment: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Replicas</label>
          <Input 
            type="number" 
            min="1" 
            max="10" 
            value={configuration.replicas} 
            onChange={(e) => setConfiguration({...configuration, replicas: parseInt(e.target.value) || 1})}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-2 block">Deployment Region</label>
          <Select 
            value={configuration.region} 
            onValueChange={(value) => setConfiguration({...configuration, region: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
              <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
              <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
              <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <Textarea 
            value={configuration.notes} 
            onChange={(e) => setConfiguration({...configuration, notes: e.target.value})}
            placeholder="Add any deployment notes or special instructions..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

// Review Step
const ReviewStep = ({ 
  selectedAgents, 
  agents, 
  configuration 
}: { 
  selectedAgents: string[]; 
  agents: any[]; 
  configuration: any; 
}) => {
  const selectedAgentObjects = agents.filter(agent => selectedAgents.includes(agent.id));
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Deployment</h3>
      
      <Card>
        <CardHeader>
          <CardTitle>Selected Agents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedAgentObjects.map(agent => (
            <div key={agent.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{agent.name}</p>
                <p className="text-sm text-muted-foreground">{agent.type} • {agent.framework}</p>
              </div>
              <Badge variant="outline">{agent.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Deployment Configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Environment</p>
            <p className="font-medium capitalize">{configuration.environment}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Replicas</p>
            <p className="font-medium">{configuration.replicas}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Region</p>
            <p className="font-medium">{configuration.region}</p>
          </div>
          {configuration.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{configuration.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Deployment Progress Step
const DeploymentProgressStep = ({ 
  deploymentStatus, 
  progress 
}: { 
  deploymentStatus: string; 
  progress: number; 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-muted-foreground';
      case 'in-progress': return 'text-blue-500';
      case 'success': return 'text-emerald-500';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <div className="w-3 h-3 rounded-full bg-muted" />;
      case 'in-progress': return <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />;
      case 'success': return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-destructive" />;
      default: return <div className="w-3 h-3 rounded-full bg-muted" />;
    }
  };
  
  const steps = [
    { id: 'validation', title: 'Validating Configuration', status: deploymentStatus === 'pending' ? 'in-progress' : 'success' },
    { id: 'building', title: 'Building Containers', status: deploymentStatus === 'pending' ? 'pending' : deploymentStatus === 'in-progress' && progress > 25 ? 'in-progress' : progress > 25 ? 'success' : 'pending' },
    { id: 'deploying', title: 'Deploying Agents', status: deploymentStatus === 'pending' || progress < 50 ? 'pending' : deploymentStatus === 'in-progress' && progress > 50 ? 'in-progress' : progress > 50 ? 'success' : 'pending' },
    { id: 'verifying', title: 'Verifying Deployment', status: deploymentStatus === 'pending' || progress < 75 ? 'pending' : deploymentStatus === 'in-progress' && progress > 75 ? 'in-progress' : progress > 75 ? 'success' : 'pending' },
  ];
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Deployment in Progress</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg border">
            {getStatusIcon(step.status)}
            <div className="flex-1">
              <p className={`font-medium ${getStatusColor(step.status)}`}>{step.title}</p>
            </div>
            <div className={`text-sm ${getStatusColor(step.status)}`}>
              {step.status === 'in-progress' ? 'In Progress' : 
               step.status === 'success' ? 'Complete' : 
               step.status === 'failed' ? 'Failed' : 'Pending'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

// Multi-Agent Deploy Wizard Component
const MultiAgentDeployWizard = ({ 
  isOpen, 
  onOpenChange, 
  agents 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  agents: any[]; 
}) => {
  const [step, setStep] = useState(1);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [configuration, setConfiguration] = useState({
    environment: 'development',
    replicas: 1,
    region: 'us-east-1',
    notes: ''
  });
  const [deploymentStatus, setDeploymentStatus] = useState('pending'); // pending, in-progress, success, failed
  const [progress, setProgress] = useState(0);

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const startDeployment = () => {
    setStep(4);
    setDeploymentStatus('in-progress');
    
    // Simulate deployment progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDeploymentStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };
  
  const resetWizard = () => {
    setStep(1);
    setSelectedAgents([]);
    setConfiguration({
      environment: 'development',
      replicas: 1,
      region: 'us-east-1',
      notes: ''
    });
    setDeploymentStatus('pending');
    setProgress(0);
  };
  
  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            Deploy Agents
          </DialogTitle>
        </DialogHeader>

        <DeploymentStepper step={step} />

        <div className="py-4">
          {step === 1 && (
            <AgentSelectionStep 
              agents={agents} 
              selectedAgents={selectedAgents} 
              setSelectedAgents={setSelectedAgents} 
            />
          )}
          {step === 2 && (
            <ConfigurationStep 
              configuration={configuration} 
              setConfiguration={setConfiguration} 
            />
          )}
          {step === 3 && (
            <ReviewStep 
              selectedAgents={selectedAgents} 
              agents={agents} 
              configuration={configuration} 
            />
          )}
          {step === 4 && (
            <DeploymentProgressStep 
              deploymentStatus={deploymentStatus} 
              progress={progress} 
            />
          )}
        </div>

        <div className="flex justify-between mt-4">
          {step === 4 && deploymentStatus === 'success' ? (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
          {step < 3 ? (
            <Button 
              onClick={nextStep}
              disabled={step === 1 && selectedAgents.length === 0}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : step === 3 ? (
            <Button 
              onClick={startDeployment}
              className="bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Deploy Agents
            </Button>
          ) : deploymentStatus === 'success' ? (
            <Button 
              onClick={handleClose}
              className="bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              Finish
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function MaestroAgents() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  const agents = [
    {
      id: 'a-1',
      name: 'Research Agent',
      type: 'Planner',
      framework: 'LangChain',
      status: 'running',
      uptime: '99.8%',
      costPerRun: '$0.45',
      successRate: 94,
      runsToday: 127,
      avgLatency: '1.2s',
      description: 'Autonomous research and data gathering agent with web search capabilities'
    },
    {
      id: 'a-2',
      name: 'Content Generator',
      type: 'Writer',
      framework: 'CrewAI',
      status: 'idle',
      uptime: '100%',
      costPerRun: '$0.32',
      successRate: 98,
      runsToday: 84,
      avgLatency: '0.9s',
      description: 'Multi-format content creation with style adaptation and SEO optimization'
    },
    {
      id: 'a-3',
      name: 'Data Analyzer',
      type: 'Validator',
      framework: 'AutoGen',
      status: 'running',
      uptime: '97.3%',
      costPerRun: '$0.58',
      successRate: 89,
      runsToday: 203,
      avgLatency: '2.1s',
      description: 'Complex data processing and pattern recognition with statistical analysis'
    },
    {
      id: 'a-4',
      name: 'Quality Checker',
      type: 'Validator',
      framework: 'LangChain',
      status: 'running',
      uptime: '99.5%',
      costPerRun: '$0.28',
      successRate: 96,
      runsToday: 156,
      avgLatency: '0.7s',
      description: 'Automated quality assurance and compliance checking'
    },
    {
      id: 'a-5',
      name: 'Workflow Coordinator',
      type: 'Orchestrator',
      framework: 'AutoGen',
      status: 'running',
      uptime: '98.9%',
      costPerRun: '$0.41',
      successRate: 92,
      runsToday: 98,
      avgLatency: '1.5s',
      description: 'Multi-agent coordination and task distribution'
    },
    {
      id: 'a-6',
      name: 'Customer Support Bot',
      type: 'Conversational',
      framework: 'CrewAI',
      status: 'idle',
      uptime: '99.2%',
      costPerRun: '$0.19',
      successRate: 97,
      runsToday: 412,
      avgLatency: '0.5s',
      description: 'Context-aware customer interaction and issue resolution'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'idle':
        return 'bg-muted text-muted-foreground border-border';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'LangChain':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'CrewAI':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'AutoGen':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔷 Agent Orchestrator</h1>
          <p className="text-muted-foreground mt-1">Manage your autonomous AI workforce</p>
        </div>
        <Button className="gradient-primary" onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Deploy Agents
        </Button>
      </div>

      {/* Multi-Agent Deploy Wizard */}
      <MultiAgentDeployWizard isOpen={isWizardOpen} onOpenChange={setIsWizardOpen} agents={agents} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">4 running, 2 idle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <p className="text-xs text-success">+2.1% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,080</div>
            <p className="text-xs text-muted-foreground">+156 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.15s</div>
            <p className="text-xs text-success">-0.2s improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-all border-border/50 hover:border-accent/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{agent.type}</p>
                  </div>
                </div>
                {agent.status === 'running' && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.description}
              </p>

              <div className="flex gap-2">
                <Badge variant="outline" className={getFrameworkColor(agent.framework)}>
                  {agent.framework}
                </Badge>
                <Badge variant="outline" className={getStatusColor(agent.status)}>
                  {agent.status === 'running' && <Activity className="mr-1 h-3 w-3" />}
                  {agent.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-sm font-semibold mt-1">{agent.successRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-sm font-semibold mt-1">{agent.uptime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cost/Run</p>
                  <p className="text-sm font-semibold mt-1">{agent.costPerRun}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Latency</p>
                  <p className="text-sm font-semibold mt-1">{agent.avgLatency}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Runs Today</p>
                <p className="text-2xl font-bold">{agent.runsToday}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="mr-1 h-3 w-3" />
                  Configure
                </Button>
                {agent.status === 'running' ? (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Pause className="mr-1 h-3 w-3" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="mr-1 h-3 w-3" />
                    Start
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployment Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Agent Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Agent Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground">Current deployment status</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium">Research Agent</h3>
                <p className="text-sm text-muted-foreground">Planner Framework</p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-medium">Content Generator</h3>
                <p className="text-sm text-muted-foreground">Writer Framework</p>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Deploying
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Console Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-green-500" />
              Console Output
            </CardTitle>
            <p className="text-sm text-muted-foreground">Real-time deployment logs</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="font-mono text-sm p-3 bg-black text-green-400 rounded-lg h-40 overflow-y-auto">
              <p>$ maestro deploy research-agent</p>
              <p className="text-blue-400">[INFO] Initializing deployment process...</p>
              <p className="text-blue-400">[INFO] Validating configuration...</p>
              <p className="text-blue-400">[INFO] Building agent container...</p>
              <p className="text-yellow-400">[WARN] Optimizing memory allocation...</p>
              <p className="text-blue-400">[INFO] Deploying to cluster...</p>
              <p className="text-green-400">[SUCCESS] Agent deployed successfully!</p>
              <p className="text-green-400">[INFO] Agent is now active and running</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Deployment successful - Agent is active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
