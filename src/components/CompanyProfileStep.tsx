import { useODIStore } from '@/lib/odi-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { weightProfiles, dimensions } from '@/lib/odi-data';

export default function CompanyProfileStep() {
  const { profile, setProfile, selectedProfile, setSelectedProfile, setStep } = useODIStore();

  const handleIndustryChange = (value: string) => {
    setSelectedProfile(value);
    setProfile({ industry: value });
  };

  const activeWeights = weightProfiles.find(p => p.name === selectedProfile)?.weights || weightProfiles[0].weights;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ODI v2 — COMPANY PROFILE & WEIGHT CONFIGURATION</h1>
        <p className="text-muted-foreground mt-1">Fill in company details and select your industry — weights auto-adjust</p>
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
            ['ownerAge', 'Owner age'],
            ['assessedBy', 'Assessed by'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="w-44 shrink-0 font-semibold">{label}:</Label>
              <Input
                value={(profile as any)[key] || ''}
                onChange={(e) => setProfile({ [key]: e.target.value })}
                className="bg-muted/30"
              />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Label className="w-44 shrink-0 font-semibold">Annual revenue (THB):</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={profile.annualRevenue || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setProfile({ annualRevenue: val });
              }}
              className="bg-muted/30"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-44 shrink-0 font-semibold">Industry type:</Label>
            <Select value={selectedProfile} onValueChange={handleIndustryChange}>
              <SelectTrigger className="w-full bg-muted/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                {weightProfiles.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <div className="bg-primary px-4 py-2">
          <h2 className="text-primary-foreground font-semibold">Adaptive weights — {selectedProfile}</h2>
        </div>
        <div className="p-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="bg-primary text-primary-foreground px-3 py-2 text-left font-semibold">Dimension</th>
                <th className="bg-primary text-primary-foreground px-3 py-2 text-center font-semibold">Weight (%)</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((d) => (
                <tr key={d.id} className="border-b border-border">
                  <td className="px-3 py-2 font-semibold">{d.name}</td>
                  <td className="px-3 py-2 text-center font-bold">{activeWeights[d.id]}%</td>
                </tr>
              ))}
              <tr className="font-bold bg-muted">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-center">100%</td>
              </tr>
            </tbody>
          </table>
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
