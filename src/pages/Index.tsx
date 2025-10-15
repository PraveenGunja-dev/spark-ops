import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Workflow, ArrowRight, Sparkles, Layers } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Layers className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            AI Automation Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your interface: Traditional orchestration or next-generation agentic automation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Orchestrator Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl">Orchestrator</CardTitle>
              <CardDescription className="text-base">
                Traditional process automation with full control and visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Manage runs, agents, tools, and workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Detailed monitoring and analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Approval workflows and governance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Queue management and scheduling</span>
                </li>
              </ul>
              <Link to="/dashboard" className="block">
                <Button className="w-full group-hover:shadow-lg transition-all gradient-primary" size="lg">
                  Open Orchestrator
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Maestro Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-accent/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 via-accent to-pink-500 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Maestro
                <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-normal">
                  Next-Gen
                </span>
              </CardTitle>
              <CardDescription className="text-base">
                Agentic AI orchestration with visual workflow design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                  <span>Visual workflow builder with drag-and-drop</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                  <span>AI agent collaboration and orchestration</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                  <span>Real-time observability and tracing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                  <span>Advanced governance and safety policies</span>
                </li>
              </ul>
              <Link to="/maestro" className="block">
                <Button 
                  className="w-full mt-6 group-hover:shadow-lg transition-all gradient-hero" 
                  size="lg"
                >
                  Open Maestro
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            Both platforms share the same backend infrastructure and data
          </p>
        </div>
      </div>
    </div>
  );
}
