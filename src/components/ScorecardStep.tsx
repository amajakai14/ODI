import { useODIStore } from '@/lib/odi-store';
import { dimensions, weightProfiles, getRiskLevel, getOverallClassification, getRecommendation } from '@/lib/odi-data';
import { Button } from '@/components/ui/button';

export default function ScorecardStep() {
  const { answers, selectedProfile, clients, setStep, profile } = useODIStore();
  const weights = weightProfiles.find(p => p.name === selectedProfile)?.weights || weightProfiles[0].weights;

  const dimScores = dimensions.map(dim => {
    const raw = dim.questions.reduce((s, q) => s + q.score(answers[q.id] || ''), 0);
    const normalized = (raw / 20) * 100;
    const weight = weights[dim.id];
    const weighted = (normalized * weight) / 100;
    return { dim, raw, normalized, weight, weighted, riskLevel: getRiskLevel(weighted / (weight / 100)) };
  });

  const totalWeighted = dimScores.reduce((s, d) => s + d.weighted, 0);
  const classification = getOverallClassification(totalWeighted);
  const recommendation = getRecommendation(totalWeighted);

  const highestDim = dimScores.reduce((max, d) => d.weighted > max.weighted ? d : max, dimScores[0]);

  const totalRevenue = parseFloat(profile.annualRevenue) || 0;
  const totalTop10 = clients.reduce((s, c) => s + (c.annualRevenue || 0), 0);
  const atRisk = clients.filter(c => c.ownerDependent).reduce((s, c) => s + (c.annualRevenue || 0), 0);
  const atRiskPct = totalTop10 > 0 ? ((atRisk / totalTop10) * 100).toFixed(1) : '0';

  const riskColor = (level: string) => {
    if (level === 'LOW') return 'text-emerald-700';
    if (level === 'MODERATE') return 'text-amber-600';
    if (level === 'HIGH') return 'text-orange-600';
    return 'text-destructive';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ODI v2 SCORECARD — FINAL REPORT</h1>
        <p className="text-muted-foreground mt-1">Auto-calculated from Assessment and Revenue at Risk data</p>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Dimension scores</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/90">
              {['Dimension', 'Raw score (/20)', 'Normalized (/100)', 'Weight (%)', 'Weighted score', 'Risk level'].map(h => (
                <th key={h} className="text-primary-foreground px-4 py-2 text-center font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimScores.map(({ dim, raw, normalized, weight, weighted, riskLevel }) => (
              <tr key={dim.id} className="border-b border-border">
                <td className="px-4 py-3 font-semibold">{dim.name}</td>
                <td className="px-4 py-3 text-center font-bold">{raw}</td>
                <td className="px-4 py-3 text-center">{normalized.toFixed(0)}</td>
                <td className="px-4 py-3 text-center">{weight}%</td>
                <td className="px-4 py-3 text-center font-bold text-destructive bg-blue-50">{weighted.toFixed(1)}</td>
                <td className={`px-4 py-3 text-center font-bold ${riskColor(riskLevel)}`}>{riskLevel}</td>
              </tr>
            ))}
            <tr className="bg-primary text-primary-foreground font-bold text-lg">
              <td className="px-4 py-3">ODI TOTAL</td>
              <td /><td /><td />
              <td className="px-4 py-3 text-center">{totalWeighted.toFixed(1)}</td>
              <td className="px-4 py-3 text-center">{classification}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Revenue at risk (from Revenue Analysis)</h2>
        </div>
        <div className="p-4 flex items-center gap-4">
          <span className="font-semibold">Revenue at risk %</span>
          <span className="text-lg font-bold text-destructive">{atRiskPct}%</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Spike analysis — highest single dimension (the real risk)</h2>
        </div>
        <div className="p-4 flex items-center gap-6">
          <span className="font-semibold">Highest dimension:</span>
          <span className="text-destructive font-bold">{highestDim.dim.name}</span>
          <span className="font-bold">{highestDim.weighted.toFixed(0)}/100</span>
          <span className="text-sm text-muted-foreground">This is where the existential risk sits — fix this first regardless of blended score</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Recommendation</h2>
        </div>
        <div className="p-6">
          <p className="text-primary italic font-medium">{recommendation}</p>
        </div>
      </div>

      {/* Combined Action Plan per dimension (sorted by risk) */}
      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Action Plan by Dimension</h2>
        </div>
        <div className="p-4 space-y-6">
          {dimScores
            .sort((a, b) => b.weighted - a.weighted)
            .map(({ dim, riskLevel, weighted }) => {
              const flaggedQuickWins = dim.questions
                .filter(q => q.score(answers[q.id] || '') >= 3)
                .map(q => q.quickWin);
              const quickWins = flaggedQuickWins.length > 0 ? flaggedQuickWins : [dim.questions[0].quickWin];

              return (
                <div key={dim.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                    <h3 className="font-bold text-sm">{dim.name}</h3>
                    <span className={`text-xs font-bold ${riskColor(riskLevel)}`}>{riskLevel} — {weighted.toFixed(1)}pts</span>
                  </div>
                  <div className="p-4 grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-destructive mb-1">🔥 Quick Wins (This Week)</h4>
                      <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                        {quickWins.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-600 mb-1">📋 Short-Term (1–3 Months)</h4>
                      <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                        {dim.shortTermRecs.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-700 mb-1">🎯 Long-Term (6–12 Months)</h4>
                      <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                        {dim.longTermRecs.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
        <Button variant="outline" onClick={() => useODIStore.getState().reset()}>Start Over</Button>
      </div>
    </div>
  );
}
