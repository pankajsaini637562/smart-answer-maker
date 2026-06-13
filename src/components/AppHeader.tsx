import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BarChart3, FileText, Trophy, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/sheets', label: 'Sheets', icon: FileText },
  { to: '/history', label: 'History', icon: Trophy },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm" style={{ background: 'var(--gradient-primary)' }}>
              EM
            </div>
            <h1 className="text-xl font-bold font-display">
              <span className="gradient-text">Smart AI OMR Analysis</span>
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-muted/60 rounded-xl p-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <button className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            {/* Mobile nav */}
            <nav className="flex md:hidden items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="icon"
                      className="w-9 h-9"
                    >
                      <item.icon className="w-4 h-4" />
                    </Button>
                  </Link>
                );
              })}
            </nav>
            <div className="w-px h-6 bg-border mx-1 hidden md:block" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link to="/profile">
              <Button
                variant={location.pathname === '/profile' ? 'default' : 'ghost'}
                size="icon"
                className="w-9 h-9 rounded-xl"
                aria-label="Profile"
              >
                <User className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
