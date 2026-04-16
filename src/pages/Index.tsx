import { useEffect } from 'react';
import { useODIStore } from '@/lib/odi-store';
import { useAuth } from '@/contexts/AuthContext';
import CompanyProfileStep from '@/components/CompanyProfileStep';
import AssessmentStep from '@/components/AssessmentStep';
import RevenueRiskStep from '@/components/RevenueRiskStep';
import ScorecardStep from '@/components/ScorecardStep';

const steps = ['Company Profile', 'Assessment', 'Revenue at Risk', 'Scorecard'];

const Index = () => {
  const { step, loaded, loadAssessment, saveAssessment } = useODIStore();
  const { user } = useAuth();

  // Load saved assessment on mount
  useEffect(() => {
    if (user?.id && !loaded) {
      loadAssessment(user.id);
    }
  }, [user?.id, loaded, loadAssessment]);

  // Auto-save on state changes
  useEffect(() => {
    if (!user?.id || !loaded) return;
    const unsub = useODIStore.subscribe((state, prevState) => {
      if (
        state.profile !== prevState.profile ||
        state.answers !== prevState.answers ||
        state.selectedProfile !== prevState.selectedProfile ||
        state.step !== prevState.step ||
        state.clients !== prevState.clients
      ) {
        // Debounced save
        const timer = setTimeout(() => {
          state.saveAssessment(user!.id);
        }, 1500);
        return () => clearTimeout(timer);
      }
    });
    return unsub;
  }, [user?.id, loaded]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your assessment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === step ? 'bg-primary text-primary-foreground' :
                  i < step ? 'bg-emerald-100 text-emerald-800' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
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
