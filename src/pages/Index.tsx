import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useODIStore } from '@/lib/odi-store';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import CompanyProfileStep from '@/components/CompanyProfileStep';
import AssessmentStep from '@/components/AssessmentStep';
import RevenueRiskStep from '@/components/RevenueRiskStep';
import ScorecardStep from '@/components/ScorecardStep';

const steps = ['Company Profile', 'Assessment', 'Revenue at Risk', 'Scorecard'];

const Index = () => {
  const { step, loaded, loadAssessment, saveGuestLocal } = useODIStore();
  const { user, signOut } = useAuth();

  // Load saved assessment (Supabase if logged in, localStorage if guest)
  useEffect(() => {
    if (!loaded) {
      loadAssessment(user?.id ?? null);
    }
  }, [user?.id, loaded, loadAssessment]);

  // Auto-save on state changes
  useEffect(() => {
    if (!loaded) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = useODIStore.subscribe((state, prevState) => {
      if (
        state.profile !== prevState.profile ||
        state.answers !== prevState.answers ||
        state.selectedProfile !== prevState.selectedProfile ||
        state.step !== prevState.step ||
        state.clients !== prevState.clients
      ) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          if (user?.id) {
            state.saveAssessment(user.id);
          } else {
            saveGuestLocal();
          }
        }, 1200);
      }
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [user?.id, loaded, saveGuestLocal]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your assessment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-base leading-none">O</span>
            </div>
            <span className="hidden md:inline font-serif text-base">Owner Dependency Index</span>
          </Link>

          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === step ? 'bg-primary text-primary-foreground' :
                  i < step ? 'bg-accent/15 text-accent' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === step ? 'bg-primary-foreground/20' : 'bg-foreground/10'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Sign in to save</Button>
              </Link>
            )}
          </div>
        </div>
        {!user && (
          <div className="bg-accent/10 border-t border-accent/20">
            <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-foreground/80 flex flex-wrap items-center justify-between gap-2">
              <span>You're taking this as a guest. Your progress is saved on this device only.</span>
              <Link to="/auth" className="font-medium text-accent hover:underline">Sign in to save & download →</Link>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {step === 0 && <CompanyProfileStep />}
        {step === 1 && <AssessmentStep />}
        {step === 2 && <RevenueRiskStep />}
        {step === 3 && <ScorecardStep />}
      </div>
    </div>
  );
};

export default Index;
