import { StudioTopNav } from './StudioTopNav';
import { StudioSidebar } from './StudioSidebar';

interface StudioLayoutProps {
  children: React.ReactNode;
}

export function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <StudioTopNav />
      <div className="flex flex-1 w-full">
        <StudioSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
