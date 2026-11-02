import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BarChart3, FileText, Trophy, Home, User, Crown, BookOpen, Shield, GraduationCap, PenSquare, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsInstructor } from '@/hooks/useIsInstructor';
import logoAsset from '@/assets/logo.webp.asset.json';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/courses', label: 'Courses', icon: GraduationCap },
  { to: '/materials', label: 'Materials', icon: BookOpen },
  { to: '/sheets', label: 'Sheets', icon: FileText },
  { to: '/history', label: 'History', icon: Trophy },
  { to: '/leaderboard', label: 'Leaderboard', icon: Crown },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location.pathname]);
  const { isAdmin } = useIsAdmin();
  const { isInstructor } = useIsInstructor();
  let items = navItems;
  if (isInstructor) items = [...items, { to: '/instructor', label: 'Teach', icon: PenSquare }];
  if (isAdmin) items = [...items, { to: '/admin', label: 'Admin', icon: Shield }];

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="Smart AI OMR home">
            <img src={logoAsset.url} alt="Smart AI OMR – Test & Result" className="h-12 w-12 object-contain rounded-md bg-card" />
          </Link>

          <div className="flex items-center gap-1.5">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-2 gap-1">
                  {items.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium border transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-transparent text-foreground hover:bg-muted'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
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
