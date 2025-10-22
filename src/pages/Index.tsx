import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Brain, Zap, Shield, Eye } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-accent to-pink-500 flex items-center justify-center animate-pulse">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-accent to-pink-500 bg-clip-text text-transparent">
            Spark-Ops Maestro
          </h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto mb-2">
            AI Agent Platform
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powered by Agentic Process Automation (APA) execution layer
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full -mr-32 -mt-32" />
            <CardHeader className="pb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 via-accent to-pink-500 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl flex items-center gap-3">
                Maestro Platform
                <span className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 text-accent font-normal">
                  Powered by APA
                </span>
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Manage and monitor autonomous AI agents. APA (Agentic Process Automation) serves as the intelligent execution layer underneath
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <Brain className="h-6 w-6 text-purple-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">ReAct Reasoning</h3>
                    <p className="text-sm text-muted-foreground">
                      Agents think step-by-step, analyze situations, and make intelligent decisions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <Zap className="h-6 w-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Semantic Memory</h3>
                    <p className="text-sm text-muted-foreground">
                      Vector-based memory enables agents to learn and recall from past experiences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <Shield className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Human-in-the-Loop</h3>
                    <p className="text-sm text-muted-foreground">
                      Safety controls with approval workflows for high-risk actions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <Eye className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Full Observability</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time trace visualization and performance monitoring
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/maestro" className="block">
                <Button 
                  className="w-full mt-6 group-hover:shadow-lg transition-all gradient-hero text-lg py-6" 
                  size="lg"
                >
                  Launch Maestro Platform
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>LLM Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Vector Memory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Multi-Agent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Maestro Interface + APA Execution Layer
          </p>
          <p className="text-xs text-muted-foreground">
            Built with OpenAI GPT-4, Anthropic Claude, ChromaDB, and FastAPI
          </p>
        </div>
      </div>
    </div>
  );
}
