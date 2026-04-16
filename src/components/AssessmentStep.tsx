import { useODIStore } from '@/lib/odi-store';
import { dimensions } from '@/lib/odi-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function AssessmentStep() {
  const { answers, setAnswer, setStep } = useODIStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ODI v2 ASSESSMENT — OBSERVABLE INDICATORS</h1>
        <p className="text-muted-foreground mt-1">Each question uses Y/N or countable indicators. No subjective judgment needed.</p>
        <p className="text-sm text-muted-foreground">For each indicator, enter Y (yes, dependency exists) or N (no, system handles it). Count-based questions: enter the number.</p>
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/90">
                    <th className="text-primary-foreground px-3 py-2 text-left w-12">#</th>
                    <th className="text-primary-foreground px-3 py-2 text-left">Observable indicator</th>
                    <th className="text-primary-foreground px-3 py-2 text-center w-28">Answer (Y/N or #)</th>
                    <th className="text-primary-foreground px-3 py-2 text-left">Scoring guide</th>
                    <th className="text-primary-foreground px-3 py-2 text-center w-20">Points (auto)</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {dim.questions.map((q) => (
                    <tr key={q.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-3 py-3 font-semibold">{q.id}</td>
                      <td className="px-3 py-3 max-w-xs">{q.text}</td>
                      <td className="px-3 py-3 text-center">
                        {q.answerType === 'yn' ? (
                          <Select value={answers[q.id] || ''} onValueChange={(v) => setAnswer(q.id, v)}>
                            <SelectTrigger className="w-20 mx-auto"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Y">Y</SelectItem>
                              <SelectItem value="N">N</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswer(q.id, e.target.value)}
                            className="w-20 mx-auto text-center"
                          />
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-pre-line max-w-xs">{q.scoringGuide}</td>
                      <td className="px-3 py-3 text-center font-bold text-emerald-700">
                        {answers[q.id] ? q.score(answers[q.id]) : 0}
                      </td>
                      
                    </tr>
                  ))}
                  <tr className="bg-muted font-bold">
                    <td colSpan={3} className="px-3 py-2 text-right">Dimension raw score</td>
                    <td className="px-3 py-2">/20 points max</td>
                    <td className="px-3 py-2 text-center text-lg">{rawScore}</td>
                    <td />
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
