import { useODIStore } from '@/lib/odi-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { weightProfiles, dimensions } from '@/lib/odi-data';

const industries = weightProfiles.map(p => p.name);

export default function CompanyProfileStep() {
  const { profile, setProfile, selectedProfile, setSelectedProfile, setStep } = useODIStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ODI v2 — COMPANY PROFILE & WEIGHT CONFIGURATION</h1>
        <p className="text-muted-foreground mt-1">Step 1: Fill in company details → Step 2: Select industry type → Weights auto-adjust</p>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Company information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['companyName', 'Company name'],
            ['numberOfEmployees', 'Number of employees'],
            ['yearEstablished', 'Year established'],
            ['assessmentDate', 'Assessment date'],
            ['annualRevenue', 'Annual revenue (THB)'],
            ['industry', 'Industry'],
            ['ownerAge', 'Owner age'],
            ['assessedBy', 'Assessed by'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="w-44 shrink-0 font-semibold">{label}:</Label>
              <Input
                value={(profile as any)[key] || ''}
                onChange={(e) => setProfile({ [key]: e.target.value })}
                className="bg-amber-50/50"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold text-sm">Adaptive weight profiles — select your industry type</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Label className="font-semibold">Selected profile:</Label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="bg-primary text-primary-foreground px-3 py-2 text-left font-semibold">Dimension</th>
                  {weightProfiles.map(p => (
                    <th key={p.name} className={`px-3 py-2 text-center font-semibold ${p.name === selectedProfile ? 'bg-amber-100 text-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {p.name}
                    </th>
                  ))}
                  <th className="bg-emerald-700 text-white px-3 py-2 text-center font-bold">Your weights (auto)</th>
                </tr>
              </thead>
              <tbody>
                {dimensions.map((d) => {
                  const activeWeights = weightProfiles.find(p => p.name === selectedProfile)?.weights || {};
                  return (
                    <tr key={d.id} className="border-b border-border">
                      <td className="px-3 py-2 font-semibold">{d.name}</td>
                      {weightProfiles.map(p => (
                        <td key={p.name} className={`px-3 py-2 text-center ${p.name === selectedProfile ? 'bg-amber-50' : ''}`}>
                          {p.weights[d.id]}%
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-bold bg-amber-50">{activeWeights[d.id]}%</td>
                    </tr>
                  );
                })}
                <tr className="font-bold bg-muted">
                  <td className="px-3 py-2">Total</td>
                  {weightProfiles.map(p => (
                    <td key={p.name} className="px-3 py-2 text-center">100%</td>
                  ))}
                  <td className="px-3 py-2 text-center">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={() => setStep(1)}>
          Start Assessment →
        </Button>
      </div>
    </div>
  );
}
