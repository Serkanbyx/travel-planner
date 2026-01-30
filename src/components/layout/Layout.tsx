import { ReactNode } from 'react';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: ReactNode;
  onCreatePlan?: () => void;
}

/**
 * Main layout wrapper with header and footer
 */
export function Layout({ children, onCreatePlan }: LayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header onCreatePlan={onCreatePlan} />
      <main className="flex-1">{children}</main>
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-sm text-muted-foreground">
            Built with React, TypeScript & Tailwind CSS
          </p>
          <p className="text-sm text-muted-foreground">
            Travel Planner &copy; {new Date().getFullYear()}
          </p>
          <p className="text-sm text-muted-foreground">
            Created by{' '}
            <a
              href="https://serkanbayraktar.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Serkanby
            </a>
            {' | '}
            <a
              href="https://github.com/Serkanbyx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Github
            </a>
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
