import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download } from 'lucide-react';
import { mockRuns, mockAgents, mockTools } from '@/lib/mockData';

// Mock analytics data
const latencyData = [
  { hour: '00:00', latency: 420, count: 12 },
  { hour: '04:00', latency: 380, count: 8 },
  { hour: '08:00', latency: 560, count: 24 },
  { hour: '12:00', latency: 620, count: 32 },
  { hour: '16:00', latency: 480, count: 28 },
  { hour: '20:00', latency: 510, count: 20 },
];

const costData = [
  { day: 'Mon', cost: 125.4, runs: 42 },
  { day: 'Tue', cost: 189.7, runs: 58 },
  { day: 'Wed', cost: 156.2, runs: 48 },
  { day: 'Thu', cost: 210.8, runs: 65 },
  { day: 'Fri', cost: 245.3, runs: 78 },
  { day: 'Sat', cost: 98.6, runs: 32 },
  { day: 'Sun', cost: 87.4, runs: 28 },
];

const modelUsage = [
  { model: 'gpt-4o', usage: 45, cost: 120.5 },
  { model: 'llama-3.1-70b', usage: 30, cost: 65.2 },
  { model: 'gpt-4o-mini', usage: 20, cost: 32.8 },
  { model: 'claude-3.5', usage: 5, cost: 28.7 },
];

const toolUtilization = [
  { tool: 'HTTP', usage: 1200, success: 98.2 },
  { tool: 'Browser', usage: 850, success: 92.5 },
  { tool: 'Postgres', usage: 650, success: 99.1 },
  { tool: 'Slack', usage: 420, success: 95.7 },
  { tool: 'Gmail', usage: 380, success: 97.3 },
];

const throughputData = [
  { time: '00:00', throughput: 12, errors: 2 },
  { time: '04:00', throughput: 8, errors: 1 },
  { time: '08:00', throughput: 24, errors: 3 },
  { time: '12:00', throughput: 32, errors: 5 },
  { time: '16:00', throughput: 28, errors: 4 },
  { time: '20:00', throughput: 20, errors: 2 },
];

const COLORS = ['#61CE70', '#1085e4', '#8884d8', '#ffc658'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Cross-tenant performance trends and cost insights</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cost">Cost Insights</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Latency Distribution</CardTitle>
                <CardDescription>
                  Average step latency over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={latencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="latency" stroke="#61CE70" fill="#61CE70" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Throughput</CardTitle>
                <CardDescription>
                  Runs processed per hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={throughputData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="throughput" fill="#1085e4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Agents with the best performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Fastest Agents</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>ResearchAgent</span>
                      <span className="font-medium">245ms avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SupportAgent</span>
                      <span className="font-medium">312ms avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MarketingAgent</span>
                      <span className="font-medium">428ms avg</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Most Reliable</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>SupportAgent</span>
                      <span className="font-medium">99.8% success</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ResearchAgent</span>
                      <span className="font-medium">98.7% success</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MarketingAgent</span>
                      <span className="font-medium">97.2% success</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium">Lowest Error Rate</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>Postgres Tool</span>
                      <span className="font-medium">0.2% errors</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HTTP Tool</span>
                      <span className="font-medium">0.8% errors</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slack Tool</span>
                      <span className="font-medium">1.2% errors</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Token & Cost Heatmap</CardTitle>
                <CardDescription>
                  Daily cost trends and run volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="cost" fill="#61CE70" name="Cost ($)" />
                    <Bar yAxisId="right" dataKey="runs" fill="#1085e4" name="Runs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Model Usage Breakdown</CardTitle>
                <CardDescription>
                  Distribution of model usage and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modelUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                      nameKey="model"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {modelUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => 
                      name === 'usage' ? [`${value}%`, 'Usage'] : [`$${value}`, 'Cost ($)']
                    } />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Expensive Agents</CardTitle>
              <CardDescription>
                Agents with the highest operational costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { agent: 'ResearchAgent', cost: 425.67 },
                  { agent: 'MarketingAgent', cost: 312.45 },
                  { agent: 'SupportAgent', cost: 187.23 },
                  { agent: 'DataProcessor', cost: 98.76 },
                  { agent: 'ReportGenerator', cost: 65.34 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">{index + 1}</span>
                      </div>
                      <span className="font-medium">{item.agent}</span>
                    </div>
                    <span className="font-medium">${item.cost}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Utilization</CardTitle>
              <CardDescription>
                Usage patterns and success rates for all tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={toolUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tool" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="usage" fill="#61CE70" name="Usage Count" />
                  <Bar yAxisId="right" dataKey="success" fill="#1085e4" name="Success Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Slowest Tools</CardTitle>
              <CardDescription>
                Tools with the highest average latency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { tool: 'Browser (Puppeteer)', latency: 2450 },
                  { tool: 'Postgres', latency: 1875 },
                  { tool: 'HTTP', latency: 1240 },
                  { tool: 'Gmail', latency: 980 },
                  { tool: 'Slack', latency: 650 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-primary font-medium">{index + 1}</span>
                      </div>
                      <span className="font-medium">{item.tool}</span>
                    </div>
                    <span className="font-medium">{item.latency}ms</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>
                Error patterns and failure rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Common Error Types</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'Timeout', count: 42, percentage: 35 },
                      { type: 'Authentication', count: 28, percentage: 23 },
                      { type: 'Rate Limit', count: 18, percentage: 15 },
                      { type: 'Invalid Input', count: 15, percentage: 12 },
                      { type: 'Network', count: 12, percentage: 10 },
                      { type: 'Other', count: 6, percentage: 5 },
                    ].map((error, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{error.type}</span>
                          <span>{error.count} ({error.percentage}%)</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${error.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Error Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={throughputData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="errors" 
                        stroke="#ff4757" 
                        strokeWidth={2} 
                        name="Errors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}