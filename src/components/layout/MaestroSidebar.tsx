import { NavLink, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Workflow,
  LineChart,
  Shield,
  Plug,
  Home,
  Settings,
  AlertCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const mainItems = [
  { title: 'Maestro Home', url: '/maestro', icon: Sparkles },
  { title: 'AI Agents', url: '/maestro/agents', icon: Bot },
  { title: 'Workflows', url: '/maestro/workflows', icon: Workflow },
  { title: 'Observability', url: '/maestro/observability', icon: LineChart },
  { title: 'Human-in-the-Loop', url: '/maestro/hitl', icon: AlertCircle },
  { title: 'Governance', url: '/maestro/governance', icon: Shield },
  { title: 'Integrations', url: '/maestro/integrations', icon: Plug },
];

const systemItems = [
  { title: 'Back to Home', url: '/', icon: Home },
  { title: 'Settings', url: '/maestro/settings', icon: Settings },
];

export function MaestroSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/maestro') {
      return location.pathname === '/maestro';
    }
    return location.pathname.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path)
      ? 'font-medium bg-gradient-to-r from-accent/20 to-accent/10 text-accent hover:bg-accent/20'
      : 'text-muted-foreground hover:bg-accent/5 hover:text-accent-foreground';

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent>
        <div className="px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-sm">Maestro</h2>
                <p className="text-xs text-muted-foreground">Agentic AI</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
