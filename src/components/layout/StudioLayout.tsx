import { ReactNode } from 'react';
import { StudioSidebar } from './StudioSidebar';
import { TopBar } from './TopBar';

interface StudioLayoutProps {
  children: ReactNode;
}

export function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <StudioSidebar />
      <div className="flex-1 flex flex-col w-full">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}