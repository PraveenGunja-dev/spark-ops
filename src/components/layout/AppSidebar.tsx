import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Play,
  Bot,
  Wrench,
  UserCheck,
  BarChart,
  Shield,
  Settings,
  User,
  Users,
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
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Runs', url: '/runs', icon: Play },
  { title: 'Agents', url: '/agents', icon: Bot },
  { title: 'Tools & Connectors', url: '/tools', icon: Wrench },
  { title: 'Approvals', url: '/approvals', icon: UserCheck },
  { title: 'Evaluations', url: '/evaluations', icon: BarChart },
  { title: 'Analytics', url: '/analytics', icon: BarChart },
  { title: 'Policies & Governance', url: '/policies', icon: Shield },
];

const systemItems = [
  { title: 'Teams', url: '/teams', icon: Users },
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  const getNavCls = (path: string) =>
    isActive(path)
      ? 'font-medium text-primary bg-primary/10 hover:bg-primary/10'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

  return (
    <Sidebar>
      <SidebarContent>
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