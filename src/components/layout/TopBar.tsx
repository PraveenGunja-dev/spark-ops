import { Search, Bell, User, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Determine current section based on URL
  const getCurrentSection = () => {
    if (location.pathname.startsWith('/maestro')) return 'maestro';
    if (location.pathname.startsWith('/studio')) return 'studio';
    if (location.pathname.startsWith('/dashboard') || 
        location.pathname.startsWith('/runs') || 
        location.pathname.startsWith('/agents') || 
        location.pathname.startsWith('/workflows') || 
        location.pathname.startsWith('/tools') || 
        location.pathname.startsWith('/approvals') || 
        location.pathname.startsWith('/evaluations') || 
        location.pathname.startsWith('/analytics') || 
        location.pathname.startsWith('/policies') || 
        location.pathname.startsWith('/settings') || 
        location.pathname.startsWith('/profile') || 
        location.pathname.startsWith('/teams')) return 'orchestrator';
    return 'home';
  };

  const currentSection = getCurrentSection();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search runs, workflows, agents..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Section Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="capitalize">
                {currentSection === 'orchestrator' ? 'Orchestrator' : 
                 currentSection === 'maestro' ? 'Maestro' : "Home"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch Platform</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onSelect={() => navigate('/dashboard')}
              className={currentSection === 'orchestrator' ? 'bg-accent' : ''}
            >
              Orchestrator
              <span className="text-xs text-muted-foreground ml-2">Traditional</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onSelect={() => navigate('/maestro')}
              className={currentSection === 'maestro' ? 'bg-accent' : ''}
            >
              Maestro
              <span className="text-xs text-muted-foreground ml-2">Agentic AI</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem 
              onSelect={() => navigate('/studio')}
              className={currentSection === 'studio' ? 'bg-accent' : ''}
            >
              Studio
              <span className="text-xs text-muted-foreground ml-2">Visual Builder</span>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">High error rate detected</p>
                <p className="text-xs text-muted-foreground">Postgres tool errors spiked 15 min ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Deployment completed</p>
                <p className="text-xs text-muted-foreground">ResearchAgent v2.1 is now live</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.name || 'User'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout} className="text-red-600">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}