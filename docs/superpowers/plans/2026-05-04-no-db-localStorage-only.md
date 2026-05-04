# No-DB Local Storage Assessment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip all Supabase/auth infrastructure from the ODI app so it runs entirely in the browser with localStorage persistence and deploys as a static site on Vercel.

**Architecture:** Delete all auth pages, contexts, and Supabase integration files. Rewrite `odi-store.ts` to be localStorage-only (synchronous `load`/`save` instead of async Supabase calls). Remove auth-related UI from every page. Add `vercel.json` for SPA routing.

**Tech Stack:** Vite + React 18, Zustand, react-router-dom v6, Tailwind + shadcn/ui, Vitest + Testing Library, Vercel static hosting.

---

## File Map

**Delete:**
- `src/contexts/AuthContext.tsx`
- `src/pages/Auth.tsx`
- `src/pages/ResetPassword.tsx`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/integrations/lovable/index.ts`

**Modify:**
- `src/lib/odi-store.ts` — strip Supabase, pure synchronous localStorage
- `src/App.tsx` — remove AuthProvider, remove /auth and /reset-password routes
- `src/pages/Index.tsx` — remove auth UI (sign-in banner, sign out button)
- `src/pages/Landing.tsx` — remove auth links from nav and footer
- `src/components/ScorecardStep.tsx` — remove auth gate on PDF download
- `package.json` — remove `@supabase/supabase-js` and `@lovable.dev/cloud-auth-js`

**Create:**
- `src/lib/odi-store.test.ts` — store unit tests
- `vercel.json` — SPA rewrite rule

---

## Task 1: Write failing store tests

**Files:**
- Create: `src/lib/odi-store.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/lib/odi-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useODIStore } from './odi-store';

const STORAGE_KEY = 'odi:assessment';

const defaultProfile = {
  companyName: '', numberOfEmployees: '', yearEstablished: '',
  assessmentDate: expect.any(String),
  annualRevenue: '', industry: '', ownerAge: '', assessedBy: '',
};

describe('useODIStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useODIStore.setState({
      step: 0,
      profile: {
        companyName: '', numberOfEmployees: '', yearEstablished: '',
        assessmentDate: new Date().toISOString().split('T')[0],
        annualRevenue: '', industry: '', ownerAge: '', assessedBy: '',
      },
      selectedProfile: 'Balanced (Default)',
      answers: {},
      clients: Array.from({ length: 10 }, () => ({
        clientName: '', annualRevenue: 0, ownerDependent: false,
        riskIfOwnerLeaves: '', mitigationStatus: '',
      })),
      loaded: false,
    });
  });

  it('marks loaded and keeps defaults when localStorage is empty', () => {
    useODIStore.getState().load();
    const state = useODIStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.step).toBe(0);
    expect(state.answers).toEqual({});
  });

  it('persists state to localStorage when save is called', () => {
    useODIStore.getState().setStep(2);
    useODIStore.getState().setAnswer('q1', 'yes');
    useODIStore.getState().save();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.step).toBe(2);
    expect(saved.answers).toEqual({ q1: 'yes' });
  });

  it('restores saved state from localStorage when load is called', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      step: 3,
      answers: { q1: 'no' },
      selectedProfile: 'Balanced (Default)',
      profile: {
        companyName: 'Acme', numberOfEmployees: '', yearEstablished: '',
        assessmentDate: '2026-01-01', annualRevenue: '', industry: '',
        ownerAge: '', assessedBy: '',
      },
      clients: [],
    }));

    useODIStore.getState().load();
    const state = useODIStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.step).toBe(3);
    expect(state.answers).toEqual({ q1: 'no' });
    expect(state.profile.companyName).toBe('Acme');
  });

  it('clears localStorage and resets state when reset is called', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: 2 }));
    useODIStore.getState().reset();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(useODIStore.getState().step).toBe(0);
    expect(useODIStore.getState().answers).toEqual({});
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail**

```bash
npx vitest run src/lib/odi-store.test.ts
```

Expected: FAIL — `useODIStore.getState().load is not a function` (the current store has `loadAssessment`, not `load`).

---

## Task 2: Rewrite odi-store.ts (localStorage-only)

**Files:**
- Modify: `src/lib/odi-store.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
// src/lib/odi-store.ts
import { create } from 'zustand';
import { CompanyProfile, ClientRisk } from './odi-data';

interface ODIState {
  step: number;
  setStep: (s: number) => void;
  profile: CompanyProfile;
  setProfile: (p: Partial<CompanyProfile>) => void;
  selectedProfile: string;
  setSelectedProfile: (p: string) => void;
  answers: Record<string, string>;
  setAnswer: (id: string, value: string) => void;
  clients: ClientRisk[];
  setClients: (c: ClientRisk[]) => void;
  reset: () => void;
  loaded: boolean;
  load: () => void;
  save: () => void;
}

const defaultProfile: CompanyProfile = {
  companyName: '', numberOfEmployees: '', yearEstablished: '',
  assessmentDate: new Date().toISOString().split('T')[0],
  annualRevenue: '', industry: '', ownerAge: '', assessedBy: '',
};

const defaultClients: ClientRisk[] = Array.from({ length: 10 }, () => ({
  clientName: '', annualRevenue: 0, ownerDependent: false,
  riskIfOwnerLeaves: '', mitigationStatus: '',
}));

const STORAGE_KEY = 'odi:assessment';

export const useODIStore = create<ODIState>((set, get) => ({
  step: 0,
  setStep: (s) => set({ step: s }),
  profile: { ...defaultProfile },
  setProfile: (p) => set((state) => ({ profile: { ...state.profile, ...p } })),
  selectedProfile: 'Balanced (Default)',
  setSelectedProfile: (p) => set({ selectedProfile: p }),
  answers: {},
  setAnswer: (id, value) => set((state) => ({ answers: { ...state.answers, [id]: value } })),
  clients: defaultClients.map(c => ({ ...c })),
  setClients: (c) => set({ clients: c }),
  reset: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    set({
      step: 0, profile: { ...defaultProfile }, selectedProfile: 'Balanced (Default)',
      answers: {}, clients: defaultClients.map(c => ({ ...c })),
    });
  },
  loaded: false,

  load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          profile: saved.profile ?? { ...defaultProfile },
          answers: saved.answers ?? {},
          selectedProfile: saved.selectedProfile ?? 'Balanced (Default)',
          step: saved.step ?? 0,
          clients: saved.clients ?? defaultClients.map(c => ({ ...c })),
          loaded: true,
        });
        return;
      }
    } catch { /* ignore */ }
    set({ loaded: true });
  },

  save: () => {
    const state = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step: state.step,
        profile: state.profile,
        selectedProfile: state.selectedProfile,
        answers: state.answers,
        clients: state.clients,
      }));
    } catch { /* ignore */ }
  },
}));
```

- [ ] **Step 2: Run tests — expect them to pass**

```bash
npx vitest run src/lib/odi-store.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/odi-store.ts src/lib/odi-store.test.ts
git commit -m "refactor: replace supabase store with localStorage-only persistence"
```

---

## Task 3: Remove Supabase and Lovable packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove the two packages**

```bash
npm uninstall @supabase/supabase-js @lovable.dev/cloud-auth-js
```

Expected: `package.json` and `package-lock.json` updated, no errors.

- [ ] **Step 2: Verify build still compiles (it won't yet — that's fine)**

```bash
npm run build 2>&1 | head -30
```

Expected: Build errors about missing supabase imports in files we haven't updated yet. That's expected at this point.

---

## Task 4: Delete unused auth/supabase files

**Files:**
- Delete: `src/contexts/AuthContext.tsx`
- Delete: `src/pages/Auth.tsx`
- Delete: `src/pages/ResetPassword.tsx`
- Delete: `src/integrations/supabase/client.ts`
- Delete: `src/integrations/supabase/types.ts`
- Delete: `src/integrations/lovable/index.ts`

- [ ] **Step 1: Delete the files**

```bash
rm src/contexts/AuthContext.tsx \
   src/pages/Auth.tsx \
   src/pages/ResetPassword.tsx \
   src/integrations/supabase/client.ts \
   src/integrations/supabase/types.ts \
   src/integrations/lovable/index.ts
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: delete supabase integration and auth pages"
```

---

## Task 5: Rewrite App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the file**

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assessment" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

---

## Task 6: Rewrite Index.tsx

**Files:**
- Modify: `src/pages/Index.tsx`

The current `Index.tsx` calls `loadAssessment(user?.id)` and branches on `user` for sign-in UI. We replace with `load()` and `save()`, and remove all auth UI.

- [ ] **Step 1: Replace the file**

```tsx
// src/pages/Index.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useODIStore } from '@/lib/odi-store';
import CompanyProfileStep from '@/components/CompanyProfileStep';
import AssessmentStep from '@/components/AssessmentStep';
import RevenueRiskStep from '@/components/RevenueRiskStep';
import ScorecardStep from '@/components/ScorecardStep';

const steps = ['Company Profile', 'Assessment', 'Revenue at Risk', 'Scorecard'];

const Index = () => {
  const { step, loaded, load, save } = useODIStore();

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

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
        timer = setTimeout(() => save(), 1200);
      }
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [loaded, save]);

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

          <div className="w-24 shrink-0" />
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
```

---

## Task 7: Rewrite Landing.tsx

**Files:**
- Modify: `src/pages/Landing.tsx`

Remove `useAuth`, auth nav buttons, and `/auth` links. Update step 04 and CTA copy to reflect no sign-in.

- [ ] **Step 1: Replace the file**

```tsx
// src/pages/Landing.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, TrendingDown, Users, Briefcase, Clock, ShieldCheck,
  ArrowRight, CheckCircle2, BarChart3,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-lg leading-none">O</span>
            </div>
            <span className="font-serif text-xl">Owner Dependency Index</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/assessment">
              <Button size="sm">Start free assessment</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-7">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/80">
              <AlertTriangle className="w-3.5 h-3.5" /> The hidden risk inside most SMEs
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary-foreground">
              If you stepped away tomorrow, <em className="italic font-normal text-primary-foreground/85">how much of your business would walk out with you?</em>
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/85 max-w-xl leading-relaxed">
              Most owner-led businesses carry a silent dependency on one person — you.
              The Owner Dependency Index measures that risk in 5 minutes and shows you
              exactly where to fix it first.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/assessment">
                <Button size="lg" className="bg-background text-primary hover:bg-background/90 gap-2 h-12 px-6 font-medium">
                  Take the free assessment <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <span className="text-sm text-primary-foreground/75">
                No sign-up required · ~5 minutes
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-primary-foreground/75">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> 6 risk dimensions</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Personalised action plan</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> PDF report</span>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="relative rounded-2xl bg-background/10 backdrop-blur border border-primary-foreground/20 p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-primary-foreground/60">Your scorecard</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/30 text-primary-foreground">Sample</span>
              </div>
              <div className="font-serif text-5xl mb-1">72<span className="text-2xl text-primary-foreground/60">/100</span></div>
              <div className="text-sm text-primary-foreground/70 mb-6">Owner Dependency — <span className="text-destructive-foreground font-semibold">HIGH RISK</span></div>
              <div className="space-y-3">
                {[
                  { label: 'Operations', val: 85 },
                  { label: 'Client Relationships', val: 78 },
                  { label: 'Financial Control', val: 64 },
                  { label: 'Team & Delegation', val: 70 },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs text-primary-foreground/80 mb-1">
                      <span>{r.label}</span><span>{r.val}</span>
                    </div>
                    <div className="h-1.5 bg-primary-foreground/15 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-foreground/80" style={{ width: `${r.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The risk */}
      <section className="py-20 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">The problem</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              A business that depends on one person <em className="italic font-normal text-foreground/75">isn't a business — it's a job with overhead.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingDown,
                title: 'Valuation discount of 25–50%',
                body: 'Buyers and investors heavily discount businesses where revenue, clients, or operations rely on the owner being in the room.',
              },
              {
                icon: Users,
                title: 'Clients who only trust you',
                body: 'When key relationships sit in your head and your inbox, a single absence can wipe out years of recurring revenue.',
              },
              {
                icon: Briefcase,
                title: 'No exit, no break, no Plan B',
                body: "Selling, stepping back, or even taking a holiday becomes impossible when the business can't run without you.",
              },
              {
                icon: Clock,
                title: '60-hour weeks, forever',
                body: "Every decision routes back to you. Growth caps out at your personal capacity — and burnout becomes the ceiling.",
              },
              {
                icon: AlertTriangle,
                title: 'One illness from collapse',
                body: "Insurance won't replace your judgement. Owner-dependent businesses face existential risk from a single life event.",
              },
              {
                icon: BarChart3,
                title: 'Growth that stalls at you',
                body: "You can't scale a bottleneck. Until you reduce dependency, the business plateaus at the limit of one person.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-7 rounded-xl border border-border bg-card shadow-card">
                <Icon className="w-6 h-6 text-accent mb-5" strokeWidth={1.75} />
                <h3 className="font-serif text-xl md:text-[1.375rem] mb-3 text-foreground">{title}</h3>
                <p className="text-[0.95rem] text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 md:py-24 bg-gradient-soft border-y border-border">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">The assessment</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
              Six dimensions. One honest score. <em className="italic font-normal text-foreground/75">A clear path forward.</em>
            </h2>
            <p className="text-[0.95rem] md:text-base text-muted-foreground leading-relaxed mb-8">
              Built for owners of SMEs doing $1M–$50M in revenue. Each question is mapped to a specific
              dependency risk — and each result comes with quick wins, short-term fixes, and long-term
              moves to make your business more independent.
            </p>
            <ul className="space-y-3.5">
              {[
                'Operations & Process Independence',
                'Client & Revenue Concentration',
                'Team Capability & Delegation',
                'Financial Controls & Visibility',
                'Strategic Knowledge & IP',
                'Succession & Continuity',
              ].map(d => (
                <li key={d} className="flex items-center gap-3 text-[0.95rem] text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {[
              { step: '01', title: 'Answer', body: 'Six dimensions, ~30 questions. Honest answers, no judgement.' },
              { step: '02', title: 'See your score', body: 'A weighted Owner Dependency Index from LOW to CRITICAL.' },
              { step: '03', title: 'Get your action plan', body: 'Quick wins this week, fixes this quarter, structural changes this year.' },
              { step: '04', title: 'Download your report', body: 'Your results are saved on this device. Download a PDF of your full scorecard.' },
            ].map(s => (
              <div key={s.step} className="flex gap-5 p-5 rounded-xl bg-card border border-border shadow-card">
                <div className="font-serif text-3xl text-accent leading-none w-12 shrink-0">{s.step}</div>
                <div>
                  <h4 className="font-sans font-semibold text-base mb-1.5 text-foreground">{s.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 md:py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ShieldCheck className="w-8 h-8 text-accent mx-auto mb-6" strokeWidth={1.5} />
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-snug">
            "The goal isn't to work less in your business. It's to build a business that
            <em className="italic font-normal text-foreground/75"> doesn't need you to work in it at all.</em>"
          </blockquote>
          <p className="text-xs font-semibold text-muted-foreground mt-6 uppercase tracking-[0.18em]">— The premise of the ODI</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 bg-gradient-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-5 text-primary-foreground">
            Find out your Owner Dependency score in 5 minutes.
          </h2>
          <p className="text-base text-primary-foreground/85 mb-8 max-w-xl mx-auto leading-relaxed">
            Free. No sign-up needed. Results are saved on this device and you can download a full PDF report.
          </p>
          <Link to="/assessment">
            <Button size="lg" className="bg-background text-primary hover:bg-background/90 gap-2 h-12 px-6 font-medium">
              Start your assessment <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Owner Dependency Index</span>
          <div className="flex items-center gap-6">
            <Link to="/assessment" className="hover:text-foreground">Take assessment</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
```

---

## Task 8: Rewrite ScorecardStep.tsx (remove auth gate on PDF download)

**Files:**
- Modify: `src/components/ScorecardStep.tsx`

Remove `useAuth` import and `user` usage. The download button is always shown; no sign-in required.

- [ ] **Step 1: Replace the file**

```tsx
// src/components/ScorecardStep.tsx
import { useRef, useCallback } from 'react';
import { useODIStore } from '@/lib/odi-store';
import { dimensions, weightProfiles, getRiskLevel, getOverallClassification, getRecommendation } from '@/lib/odi-data';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import HexMap from '@/components/HexMap';

export default function ScorecardStep() {
  const { answers, selectedProfile, clients, setStep, profile } = useODIStore();
  const reportRef = useRef<HTMLDivElement>(null);
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

  const totalTop10 = clients.reduce((s, c) => s + (c.annualRevenue || 0), 0);
  const atRisk = clients.filter(c => c.ownerDependent).reduce((s, c) => s + (c.annualRevenue || 0), 0);
  const atRiskPct = totalTop10 > 0 ? ((atRisk / totalTop10) * 100).toFixed(1) : '0';

  const hexData = dimScores.map(d => ({
    id: d.dim.id,
    label: d.dim.name,
    score: d.normalized,
    riskLevel: d.riskLevel,
  }));

  const riskColor = (level: string) => {
    if (level === 'LOW') return 'text-emerald-700';
    if (level === 'MODERATE') return 'text-amber-600';
    if (level === 'HIGH') return 'text-orange-600';
    return 'text-destructive';
  };

  const handleDownload = useCallback(async () => {
    if (!reportRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgW = canvas.width;
    const imgH = canvas.height;

    const pdf = new jsPDF({
      orientation: imgW > imgH ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgW, imgH],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
    pdf.save(`ODI_Scorecard_${profile.companyName || 'Report'}.pdf`);
  }, [profile.companyName]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Your Owner Dependency Scorecard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Auto-calculated from your assessment and revenue analysis</p>
        </div>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <div ref={reportRef} className="space-y-8 bg-white p-6 rounded-lg">
        {/* Company header */}
        {profile.companyName && (
          <div className="text-center pb-4 border-b border-border">
            <h2 className="text-xl font-bold">{profile.companyName}</h2>
            <p className="text-sm text-muted-foreground">Assessment Date: {profile.assessmentDate} | Industry: {profile.industry || 'N/A'}</p>
          </div>
        )}

        {/* Hex Map Visualization */}
        <HexMap data={hexData} totalScore={totalWeighted} classification={classification} />

        <div className="rounded-lg overflow-hidden border border-border">
          <div className="bg-primary px-4 py-2">
            <h2 className="text-primary-foreground font-semibold">Dimension scores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-primary/90">
                  {['Dimension', 'Raw (/20)', 'Norm (/100)', 'Weight', 'Weighted', 'Risk'].map(h => (
                    <th key={h} className="text-primary-foreground px-3 py-2 text-center font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dimScores.map(({ dim, raw, normalized, weight, weighted, riskLevel }) => (
                  <tr key={dim.id} className="border-b border-border">
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{dim.name}</td>
                    <td className="px-3 py-2.5 text-center font-bold">{raw}</td>
                    <td className="px-3 py-2.5 text-center">{normalized.toFixed(0)}</td>
                    <td className="px-3 py-2.5 text-center">{weight}%</td>
                    <td className="px-3 py-2.5 text-center font-bold text-destructive bg-blue-50">{weighted.toFixed(1)}</td>
                    <td className={`px-3 py-2.5 text-center font-bold whitespace-nowrap ${riskColor(riskLevel)}`}>{riskLevel}</td>
                  </tr>
                ))}
                <tr className="bg-primary text-primary-foreground font-bold">
                  <td className="px-3 py-2.5">ODI TOTAL</td>
                  <td /><td /><td />
                  <td className="px-3 py-2.5 text-center">{totalWeighted.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-center">{classification}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
            <h2 className="text-primary-foreground font-semibold">Spike analysis — highest single dimension</h2>
          </div>
          <div className="p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-semibold">Highest dimension:</span>
            <span className="text-destructive font-bold">{highestDim.dim.name}</span>
            <span className="font-bold">{highestDim.weighted.toFixed(0)}/100</span>
            <span className="text-sm text-muted-foreground basis-full mt-1">Fix this first regardless of blended score — this is where the existential risk sits.</span>
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

        {/* Action Plan per dimension */}
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
                        <h4 className="font-semibold text-destructive mb-1">Quick Wins (This Week)</h4>
                        <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                          {quickWins.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-600 mb-1">Short-Term (1–3 Months)</h4>
                        <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                          {dim.shortTermRecs.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-700 mb-1">Long-Term (6–12 Months)</h4>
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
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
        <Button variant="outline" onClick={() => useODIStore.getState().reset()}>Start Over</Button>
      </div>
    </div>
  );
}
```

---

## Task 9: Add vercel.json for SPA routing

**Files:**
- Create: `vercel.json`

Vercel serves the built Vite app as a static site. Without a rewrite rule, direct navigation to `/assessment` returns a 404 because there's no `assessment/index.html`. This rule sends all requests to `index.html` so react-router handles routing client-side.

- [ ] **Step 1: Create vercel.json**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Task 10: Commit remaining changes and verify build

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: All tests pass (including the 4 new store tests).

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: Build completes with no TypeScript or import errors. Output goes to `dist/`.

- [ ] **Step 3: Smoke-test the preview locally**

```bash
npm run preview
```

Open `http://localhost:4173` in a browser. Verify:
- Landing page loads with no auth links
- Clicking "Start free assessment" goes to `/assessment`
- Progress through all 4 steps works
- Scorecard shows Download PDF button (no sign-in gate)
- Clicking Download PDF generates and saves a PDF
- Refreshing `/assessment` mid-flow preserves your answers (localStorage persisting)
- Starting over clears localStorage and resets the form

- [ ] **Step 4: Commit all changes**

```bash
git add src/App.tsx src/pages/Index.tsx src/pages/Landing.tsx \
        src/components/ScorecardStep.tsx vercel.json
git commit -m "feat: remove auth/supabase, assessment now fully localStorage + Vercel-ready"
```

---

## Verification Checklist

- [ ] `npm test` — all 4 store tests pass
- [ ] `npm run build` — zero TypeScript errors
- [ ] No remaining imports of `@supabase/supabase-js`, `AuthContext`, `useAuth`, or `supabase`
- [ ] PDF download works without being signed in
- [ ] Page refresh on `/assessment` restores saved progress
- [ ] `vercel.json` present at repo root with the rewrite rule
