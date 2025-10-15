import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Workflow, Bot, Settings } from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', path: '/studio', icon: LayoutDashboard },
  { title: 'Projects', path: '/studio/projects', icon: FolderOpen },
  { title: 'Automations', path: '/studio/automations', icon: Workflow },
  { title: 'Agents', path: '/studio/agents', icon: Bot },
  { title: 'Settings', path: '/studio/settings', icon: Settings },
];

export function StudioSidebar() {
  return (
    <aside className="w-16 border-r border-border/50 bg-muted/30 flex flex-col items-center py-4 gap-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/studio'}
          className={({ isActive }) =>
            `w-12 h-12 rounded-lg flex items-center justify-center transition-all group relative ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
          title={item.title}
        >
          <item.icon className="h-5 w-5" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {item.title}
          </span>
        </NavLink>
      ))}
    </aside>
  );
}
