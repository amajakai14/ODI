import { useODIStore } from '@/lib/odi-store';
import CompanyProfileStep from '@/components/CompanyProfileStep';
import AssessmentStep from '@/components/AssessmentStep';
import RevenueRiskStep from '@/components/RevenueRiskStep';
import ScorecardStep from '@/components/ScorecardStep';

const steps = ['Company Profile', 'Assessment', 'Revenue at Risk', 'Scorecard'];

const Index = () => {
  const { step } = useODIStore();

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
