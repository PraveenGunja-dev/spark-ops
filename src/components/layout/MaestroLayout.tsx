import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MaestroSidebar } from './MaestroSidebar';
import { TopBar } from './TopBar';

interface MaestroLayoutProps {
  children: ReactNode;
}

export function MaestroLayout({ children }: MaestroLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-accent/5">
        <MaestroSidebar />
        <div className="flex-1 flex flex-col w-full">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
