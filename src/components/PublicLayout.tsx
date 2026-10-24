import { Link } from 'react-router-dom';
import logoAsset from '@/assets/logo.webp.asset.json';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/site';

export const guideLinks = [
  { to: '/free-neet-omr-sheet-pdf', label: 'Free NEET OMR sheet PDF' },
  { to: '/how-to-check-neet-omr-sheet', label: 'How to check a NEET OMR sheet' },
  { to: '/neet-omr-mistakes', label: 'NEET OMR mistakes checklist' },
];

export function StartPracticeLink({ children = 'Start OMR Practice', size = 'lg' as const, variant = 'default' as const }: { children?: React.ReactNode; size?: 'sm' | 'lg' | 'default'; variant?: 'default' | 'outline' }) {
  return (
    <Button asChild size={size} variant={variant}>
      <Link to="/auth" onClick={() => trackEvent('start_omr_practice_click')}>{children}</Link>
    </Button>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container flex items-center justify-between h-16 gap-3">
          <Link to="/" className="flex items-center" aria-label="Smart AI OMR Analysis home">
            <img src={logoAsset.url} alt="Smart AI OMR Analysis logo" width={56} height={56} className="h-14 w-14 object-contain rounded-md bg-card" />
          </Link>
          <nav aria-label="Guides" className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/free-neet-omr-sheet-pdf" className="hover:text-foreground">OMR sheet PDF</Link>
            <Link to="/how-to-check-neet-omr-sheet" className="hover:text-foreground">Checking guide</Link>
            <Link to="/neet-omr-mistakes" className="hover:text-foreground">Mistakes checklist</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <StartPracticeLink size="sm">Start practice</StartPracticeLink>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card/50">
        <div className="container py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold mb-2">Smart AI OMR Analysis</div>
            <p className="text-muted-foreground">Analyze. Evaluate. Improve. An online OMR checker for NEET practice tests.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Guides</div>
            <ul className="space-y-2 text-muted-foreground">
              {guideLinks.map((g) => <li key={g.to}><Link to={g.to} className="hover:text-foreground">{g.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">App</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground">Sign up or sign in</Link></li>
              <li><Link to="/courses" className="hover:text-foreground">Courses</Link></li>
              <li><Link to="/materials" className="hover:text-foreground">Study materials</Link></li>
              <li><Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="container pb-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Smart AI OMR Analysis. Independent practice tool, not affiliated with NTA.
        </div>
      </footer>
    </div>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <article className="container max-w-3xl py-12 md:py-16 space-y-5 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:pt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:pt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1.5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
      {children}
    </article>
  );
}
