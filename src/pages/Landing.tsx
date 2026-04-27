import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertTriangle, TrendingDown, Users, Briefcase, Clock, ShieldCheck,
  ArrowRight, CheckCircle2, BarChart3,
} from 'lucide-react';

const Landing = () => {
  const { user, signOut } = useAuth();

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
            {user ? (
              <>
                <Link to="/assessment">
                  <Button variant="ghost" size="sm">My Assessment</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
                <Link to="/assessment">
                  <Button size="sm">Start free assessment</Button>
                </Link>
              </>
            )}
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
                body: 'Selling, stepping back, or even taking a holiday becomes impossible when the business can\'t run without you.',
              },
              {
                icon: Clock,
                title: '60-hour weeks, forever',
                body: 'Every decision routes back to you. Growth caps out at your personal capacity — and burnout becomes the ceiling.',
              },
              {
                icon: AlertTriangle,
                title: 'One illness from collapse',
                body: 'Insurance won\'t replace your judgement. Owner-dependent businesses face existential risk from a single life event.',
              },
              {
                icon: BarChart3,
                title: 'Growth that stalls at you',
                body: 'You can\'t scale a bottleneck. Until you reduce dependency, the business plateaus at the limit of one person.',
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
      <section className="py-24 bg-gradient-soft border-y border-border">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-accent mb-3">The assessment</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              Six dimensions. One honest score. <em className="italic">A clear path forward.</em>
            </h2>
            <p className="text-muted-foreground mb-8">
              Built for owners of SMEs doing $1M–$50M in revenue. Each question is mapped to a specific
              dependency risk — and each result comes with quick wins, short-term fixes, and long-term
              moves to make your business more independent.
            </p>
            <ul className="space-y-3">
              {[
                'Operations & Process Independence',
                'Client & Revenue Concentration',
                'Team Capability & Delegation',
                'Financial Controls & Visibility',
                'Strategic Knowledge & IP',
                'Succession & Continuity',
              ].map(d => (
                <li key={d} className="flex items-center gap-3 text-sm">
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
              { step: '04', title: 'Save & download', body: 'Sign in to keep your report, track progress, and download a PDF.' },
            ].map(s => (
              <div key={s.step} className="flex gap-5 p-5 rounded-xl bg-card border border-border shadow-card">
                <div className="font-serif text-3xl text-accent leading-none w-12 shrink-0">{s.step}</div>
                <div>
                  <h4 className="font-semibold text-base mb-1">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ShieldCheck className="w-8 h-8 text-accent mx-auto mb-6" strokeWidth={1.5} />
          <blockquote className="font-serif text-3xl md:text-4xl leading-snug">
            "The goal isn't to work less in your business. It's to build a business that
            <em className="italic"> doesn't need you to work in it at all.</em>"
          </blockquote>
          <p className="text-sm text-muted-foreground mt-6 uppercase tracking-wider">— The premise of the ODI</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-5 leading-tight">
            Find out your Owner Dependency score in 5 minutes.
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Free. No sign-up needed to take it. Sign in only if you want to save your results
            and download a PDF report.
          </p>
          <Link to="/assessment">
            <Button size="lg" className="bg-background text-primary hover:bg-background/90 gap-2 h-12 px-6">
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
            {!user && <Link to="/auth" className="hover:text-foreground">Sign in</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
