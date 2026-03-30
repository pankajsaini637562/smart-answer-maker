import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Exam Master</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/analytics">
              <Button
                variant={location.pathname === '/analytics' ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
