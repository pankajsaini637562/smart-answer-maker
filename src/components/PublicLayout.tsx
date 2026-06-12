import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        pathname === to ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              EM
            </div>
            <span className="font-display font-bold text-lg gradient-text">Exam Master</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLink("/", "Home")}
            {navLink("/blog", "Blog")}
            {navLink("/about", "About")}
            {navLink("/contact", "Contact")}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="rounded-full gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-full gap-1.5">
                  <Sparkles className="w-4 h-4" /> Start free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs"
                style={{ background: "var(--gradient-primary)" }}
              >
                EM
              </div>
              <span className="font-display font-semibold">Exam Master</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A mobile-first OMR exam-prep companion for serious students. Practice, score, and
              analyse — all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
              <li><Link to="/auth" className="hover:text-primary">Sign in</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link to="/blog/neet-preparation-strategy" className="hover:text-primary">NEET strategy</Link></li>
              <li><Link to="/blog/omr-sheet-practice-guide" className="hover:text-primary">OMR practice guide</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary">Privacy policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms of service</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Exam Master. Built for students preparing for NEET, JEE,
          CUET, CLAT and other OMR-based exams.
        </div>
      </footer>
    </div>
  );
}
