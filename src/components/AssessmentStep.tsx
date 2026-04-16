import { useODIStore } from '@/lib/odi-store';
import { dimensions } from '@/lib/odi-data';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AssessmentStep() {
  const { answers, setAnswer, setStep } = useODIStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ODI v2 ASSESSMENT — OBSERVABLE INDICATORS</h1>
        <p className="text-muted-foreground mt-1">Each question uses Y/N or countable indicators. No subjective judgment needed.</p>
        <p className="text-sm text-muted-foreground">Select the answer that best describes your business situation.</p>
      </div>

      {dimensions.map((dim) => {
        const rawScore = dim.questions.reduce((sum, q) => sum + q.score(answers[q.id] || ''), 0);
        return (
          <div key={dim.id} className="rounded-lg overflow-hidden border border-border">
            <div className="bg-primary px-4 py-2">
              <h2 className="text-primary-foreground font-semibold">
                Dimension {dim.id.replace('d', '')}: {dim.name}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-[60px]" />
                  <col className="w-[30%]" />
                  <col />
                  <col className="w-[80px]" />
                </colgroup>
                <thead>
                  <tr className="bg-primary/90">
                    <th className="text-primary-foreground px-3 py-2 text-left">#</th>
                    <th className="text-primary-foreground px-3 py-2 text-left">Observable indicator</th>
                    <th className="text-primary-foreground px-3 py-2 text-center">Select answer</th>
                    <th className="text-primary-foreground px-3 py-2 text-center">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {dim.questions.map((q) => (
                    <tr key={q.id} className="border-b border-border hover:bg-muted/50 align-top">
                      <td className="px-3 py-3 font-semibold">{q.id}</td>
                      <td className="px-3 py-3">{q.text}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt) => {
                            const isSelected = answers[q.id] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => setAnswer(q.id, opt.value)}
                                className={cn(
                                  'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
                                  isSelected
                                    ? opt.risk === 'low'
                                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                                      : opt.risk === 'medium'
                                        ? 'bg-amber-100 border-amber-500 text-amber-800 ring-2 ring-amber-300'
                                        : 'bg-red-100 border-red-500 text-red-800 ring-2 ring-red-300'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-foreground/30'
                                )}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-emerald-700">
                        {answers[q.id] ? q.score(answers[q.id]) : 0}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-bold">
                    <td colSpan={2} className="px-3 py-2 text-right">Dimension raw score</td>
                    <td className="px-3 py-2">/20 points max</td>
                    <td className="px-3 py-2 text-center text-lg">{rawScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
        <Button size="lg" onClick={() => setStep(2)}>Revenue at Risk →</Button>
      </div>
    </div>
  );
}
