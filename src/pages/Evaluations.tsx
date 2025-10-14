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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAgents } from '@/lib/mockData';
import { BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock evaluation data
const evaluationSuites = [
  { id: '1', name: 'Agent Accuracy Test Suite', lastRun: '2025-10-14', status: 'completed' },
  { id: '2', name: 'Hallucination Detection', lastRun: '2025-10-13', status: 'completed' },
  { id: '3', name: 'Factuality Benchmark', lastRun: '2025-10-12', status: 'completed' },
];

const evaluationMetrics = [
  { agent: 'ResearchAgent', version: '2.1', accuracy: 94.2, hallucination: 2.1, factuality: 97.8, cost: 12.45, date: '2025-10-14' },
  { agent: 'MarketingAgent', version: '1.8', accuracy: 87.6, hallucination: 5.3, factuality: 92.1, cost: 8.72, date: '2025-10-14' },
  { agent: 'SupportAgent', version: '3.0', accuracy: 91.8, hallucination: 3.2, factuality: 95.4, cost: 6.33, date: '2025-10-14' },
  { agent: 'ResearchAgent', version: '2.0', accuracy: 92.1, hallucination: 2.8, factuality: 96.2, cost: 11.87, date: '2025-10-07' },
  { agent: 'MarketingAgent', version: '1.7', accuracy: 85.4, hallucination: 6.1, factuality: 90.3, cost: 9.21, date: '2025-10-07' },
];

const trendData = [
  { date: '2025-10-01', accuracy: 90.2, hallucination: 3.5, factuality: 94.1 },
  { date: '2025-10-03', accuracy: 91.8, hallucination: 3.1, factuality: 95.2 },
  { date: '2025-10-05', accuracy: 92.4, hallucination: 2.9, factuality: 95.8 },
  { date: '2025-10-07', accuracy: 92.1, hallucination: 2.8, factuality: 96.2 },
  { date: '2025-10-09', accuracy: 93.7, hallucination: 2.3, factuality: 96.9 },
  { date: '2025-10-11', accuracy: 94.1, hallucination: 2.2, factuality: 97.3 },
  { date: '2025-10-13', accuracy: 94.2, hallucination: 2.1, factuality: 97.8 },
];

const agentComparison = [
  { name: 'ResearchAgent v2.1', accuracy: 94.2, hallucination: 2.1, factuality: 97.8 },
  { name: 'MarketingAgent v1.8', accuracy: 87.6, hallucination: 5.3, factuality: 92.1 },
  { name: 'SupportAgent v3.0', accuracy: 91.8, hallucination: 3.2, factuality: 95.4 },
];

const COLORS = ['#61CE70', '#1085e4', '#8884d8'];

export default function Evaluations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Evaluations</h1>
        <p className="text-muted-foreground">View automated evaluation results and quality metrics</p>
      </div>

      <Tabs defaultValue="suites">
        <TabsList>
          <TabsTrigger value="suites">Evaluation Suites</TabsTrigger>
          <TabsTrigger value="metrics">Metrics Table</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="compare">A/B Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Suites</CardTitle>
              <CardDescription>
                List of datasets used for nightly evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluationSuites.map((suite) => (
                    <TableRow key={suite.id}>
                      <TableCell className="font-medium">{suite.name}</TableCell>
                      <TableCell>{suite.lastRun}</TableCell>
                      <TableCell>
                        <Badge variant="default">Completed</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View Results</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Metrics</CardTitle>
              <CardDescription>
                Quality and performance metrics for all agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Hallucination</TableHead>
                    <TableHead>Factuality</TableHead>
                    <TableHead>Cost ($)</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluationMetrics.map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{metric.agent}</TableCell>
                      <TableCell>{metric.version}</TableCell>
                      <TableCell>{metric.accuracy}%</TableCell>
                      <TableCell>{metric.hallucination}%</TableCell>
                      <TableCell>{metric.factuality}%</TableCell>
                      <TableCell>${metric.cost}</TableCell>
                      <TableCell>{metric.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#61CE70" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hallucination Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="hallucination" stroke="#1085e4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Factuality Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="factuality" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Comparison</CardTitle>
              <CardDescription>
                Side-by-side comparison of agent versions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Accuracy Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={agentComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="accuracy" fill="#61CE70" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hallucination Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={agentComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hallucination" fill="#1085e4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Factuality Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={agentComparison}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="factuality"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {agentComparison.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}