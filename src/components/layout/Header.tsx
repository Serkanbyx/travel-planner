import { Link, useLocation } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onCreatePlan?: () => void;
}

/**
 * Main application header with navigation
 */
export function Header({ onCreatePlan }: HeaderProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/plans';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Travel Planner
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/plans"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isHomePage ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            My Plans
          </Link>
          
          {isHomePage && onCreatePlan && (
            <Button onClick={onCreatePlan} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Plan
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
