import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader, ErrorState } from '@/components/PageStates';
import { supabase } from '@/integrations/supabase/client';

type Verification = { valid: boolean; reference?: string; exam?: string | null; version?: number };

export default function CbtVerifyPage() {
  const { reference = '' } = useParams();
  const [result, setResult] = useState<Verification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setResult(null);
    const { data, error } = await supabase.rpc('cbt_verify_card', { _reference: reference });
    if (error) setError('Could not check this admit card. Please try again.');
    else setResult((data ?? { valid: false }) as Verification);
  };
  useEffect(() => { load(); }, [reference]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <SEO title="Verify admit card | Smart AI OMR" description="Check whether a CBT admit card is valid." noindex />
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="font-display">Admit card check</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {error ? <ErrorState message={error} onRetry={load} /> : !result ? <PageLoader label="Checking…" /> : result.valid ? (
            <div className="space-y-3" role="status">
              <p className="flex items-center gap-2 font-semibold text-primary"><CheckCircle2 className="w-5 h-5" aria-hidden />Valid admit card</p>
              <dl className="text-sm grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
                <dt className="text-muted-foreground">Reference</dt><dd className="font-mono break-all">{result.reference}</dd>
                {result.exam && <><dt className="text-muted-foreground">Exam</dt><dd>{result.exam}</dd></>}
                {result.version != null && <><dt className="text-muted-foreground">Version</dt><dd>{result.version}</dd></>}
              </dl>
              <p className="text-xs text-muted-foreground">Match the name and photo on the printed card with the student's ID.</p>
            </div>
          ) : (
            <div className="space-y-2" role="alert">
              <p className="flex items-center gap-2 font-semibold text-destructive"><XCircle className="w-5 h-5" aria-hidden />Not valid</p>
              <p className="text-sm text-muted-foreground">This card was not found, was replaced by a newer card, or the exam is no longer open to this student.</p>
              <p className="text-xs font-mono break-all text-muted-foreground">{reference}</p>
            </div>
          )}
          <Button asChild variant="outline" className="w-full"><Link to="/">Go to home</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
