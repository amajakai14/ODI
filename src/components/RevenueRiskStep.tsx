import { useODIStore } from '@/lib/odi-store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function RevenueRiskStep() {
  const { clients, setClients, setStep, profile } = useODIStore();
  const totalRevenue = parseFloat(profile.annualRevenue) || 0;
  const totalTop10 = clients.reduce((s, c) => s + (c.annualRevenue || 0), 0);
  const atRisk = clients.filter(c => c.ownerDependent).reduce((s, c) => s + (c.annualRevenue || 0), 0);
  const atRiskPct = totalTop10 > 0 ? ((atRisk / totalTop10) * 100).toFixed(1) : '0';

  const updateClient = (i: number, field: string, value: any) => {
    const next = [...clients];
    next[i] = { ...next[i], [field]: value };
    setClients(next);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">REVENUE AT RISK ANALYSIS</h1>
        <p className="text-blue-700 mt-1">The single most powerful number in the ODI framework: what % of your revenue disappears if you disappear?</p>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Top 10 clients analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/90">
                {['Rank', 'Client name', 'Annual revenue (THB)', '% of total revenue', 'Owner-dependent? (Y/N)', 'Risk if owner leaves', 'Mitigation status'].map(h => (
                  <th key={h} className="text-primary-foreground px-3 py-2 text-center font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-3 py-2 text-center font-semibold">{i + 1}</td>
                  <td className="px-3 py-2"><Input value={c.clientName} onChange={e => updateClient(i, 'clientName', e.target.value)} className="bg-amber-50/50" /></td>
                  <td className="px-3 py-2"><Input type="number" value={c.annualRevenue || ''} onChange={e => updateClient(i, 'annualRevenue', parseFloat(e.target.value) || 0)} className="bg-amber-50/50" /></td>
                  <td className="px-3 py-2 text-center">{totalRevenue > 0 ? ((c.annualRevenue / totalRevenue) * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <Select value={c.ownerDependent ? 'Y' : 'N'} onValueChange={v => updateClient(i, 'ownerDependent', v === 'Y')}>
                      <SelectTrigger className="w-20 mx-auto bg-amber-50/50"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Y">Y</SelectItem><SelectItem value="N">N</SelectItem></SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2"><Input value={c.riskIfOwnerLeaves} onChange={e => updateClient(i, 'riskIfOwnerLeaves', e.target.value)} className="bg-amber-50/50" /></td>
                  <td className="px-3 py-2"><Input value={c.mitigationStatus} onChange={e => updateClient(i, 'mitigationStatus', e.target.value)} className="bg-amber-50/50" /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary text-primary-foreground font-bold">
                <td colSpan={2} className="px-3 py-2 text-right">TOTAL TOP 10 REVENUE</td>
                <td className="px-3 py-2 text-center">{totalTop10.toLocaleString()}</td>
                <td colSpan={4} />
              </tr>
              <tr className="font-bold text-destructive">
                <td colSpan={2} className="px-3 py-2 text-right">REVENUE AT RISK (owner-dependent)</td>
                <td className="px-3 py-2 text-center">{atRisk.toLocaleString()}</td>
                <td colSpan={4} />
              </tr>
              <tr className="font-bold text-destructive">
                <td colSpan={2} className="px-3 py-2 text-right text-lg">REVENUE AT RISK %</td>
                <td className="px-3 py-2 text-center text-lg">{atRiskPct}%</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
        <Button size="lg" onClick={() => setStep(3)}>View Scorecard →</Button>
      </div>
    </div>
  );
}
