// ODI v2 Assessment Framework Data

export type AnswerType = 'yn' | 'number' | 'percentage';

export interface Question {
  id: string;
  text: string;
  answerType: AnswerType;
  scoringGuide: string;
  quickWin: string;
  score: (answer: string) => number;
}

export interface Dimension {
  id: string;
  name: string;
  color: string;
  questions: Question[];
  shortTermRecs: string[];
  longTermRecs: string[];
}

export interface WeightProfile {
  name: string;
  weights: Record<string, number>;
}

export const weightProfiles: WeightProfile[] = [
  { name: 'Balanced (Default)', weights: { d1: 20, d2: 20, d3: 15, d4: 15, d5: 15, d6: 15 } },
  { name: 'Trading / Distribution', weights: { d1: 15, d2: 30, d3: 10, d4: 15, d5: 15, d6: 15 } },
  { name: 'Manufacturing', weights: { d1: 20, d2: 10, d3: 25, d4: 20, d5: 15, d6: 10 } },
  { name: 'Professional Services', weights: { d1: 15, d2: 30, d3: 15, d4: 10, d5: 20, d6: 10 } },
  { name: 'Retail / F&B', weights: { d1: 20, d2: 15, d3: 10, d4: 25, d5: 15, d6: 15 } },
  { name: 'Tech / Digital', weights: { d1: 15, d2: 20, d3: 20, d4: 15, d5: 20, d6: 10 } },
];

function ynScore(answer: string): number {
  const a = answer.trim().toUpperCase();
  if (a === 'Y') return 4;
  if (a === 'N') return 0;
  return 0;
}

function ynReverseScore(answer: string): number {
  const a = answer.trim().toUpperCase();
  if (a === 'Y') return 0;
  if (a === 'N') return 4;
  return 0;
}

function rangeScore(answer: string, ranges: [number, number, number][]): number {
  const n = parseInt(answer);
  if (isNaN(n)) return 0;
  for (const [min, max, score] of ranges) {
    if (n >= min && n <= max) return score;
  }
  return 0;
}

export const dimensions: Dimension[] = [
  {
    id: 'd1', name: 'Decision making', color: 'hsl(0, 60%, 95%)',
    shortTermRecs: [
      'Create a Decision Authority Matrix with clear thresholds by role',
      'Appoint an acting decision-maker for owner absences',
      'Set spending approval limits (e.g., managers approve <50K THB)',
    ],
    longTermRecs: [
      'Embed decision-making culture: reward initiative, remove fear of good-faith errors',
      'Build a leadership team that owns strategic decisions in their domains',
      'Phase out owner involvement in all routine operational decisions',
    ],
    questions: [
      { id: 'D1.1', text: 'Is there a written Decision Authority Matrix?', answerType: 'yn',
        scoringGuide: 'Y = document exists and is used (low risk)\nN = no document exists (high risk)',
        quickWin: 'Write one this week',
        score: ynReverseScore },
      { id: 'D1.2', text: 'How many decisions did the owner make in the past week that were under 50K THB?', answerType: 'number',
        scoringGuide: '0 = 0pt, 1-5 = 1pt, 6-10 = 2pt, 11-20 = 3pt, 21+ = 4pt',
        quickWin: 'Set approval threshold: manager approves <50K',
        score: (a) => rangeScore(a, [[0, 0, 0], [1, 5, 1], [6, 10, 2], [11, 20, 3], [21, 9999, 4]]) },
      { id: 'D1.3', text: 'Can the business process payroll without the owner?', answerType: 'yn',
        scoringGuide: 'Y = HR/accountant handles it (low risk)\nN = owner must approve/sign (high risk)',
        quickWin: 'Delegate payroll to finance + spot-check monthly',
        score: ynReverseScore },
      { id: 'D1.4', text: 'If the owner is unreachable for 4 hours, do urgent decisions wait?', answerType: 'yn',
        scoringGuide: 'Y = they wait (high risk)\nN = someone else decides (low risk)',
        quickWin: 'Appoint a designated decision-maker for absences',
        score: ynScore },
      { id: 'D1.5', text: 'Has any employee been reprimanded for making a decision without the owner in the past 6 months?', answerType: 'yn',
        scoringGuide: 'Y = yes, it happened (high risk)\nN = no, employees are encouraged to decide (low risk)',
        quickWin: 'Institute a no-blame policy for good-faith decisions',
        score: ynScore },
    ]
  },
  {
    id: 'd2', name: 'Client relationships', color: 'hsl(30, 60%, 95%)',
    shortTermRecs: [
      'Deploy a CRM and migrate all client history from personal channels',
      'Start co-selling: pair owner with team member on every client interaction',
      'Schedule solo client visits for account managers with top 5 clients',
    ],
    longTermRecs: [
      'Complete relationship transfer for all top 10 clients within 12 months',
      'Build a client success team that owns renewals and upsells independently',
      'Establish institutional brand trust that outlasts any individual relationship',
    ],
    questions: [
      { id: 'D2.1', text: 'What % of top-10 client revenue is from clients who contact the owner\'s personal phone first?', answerType: 'number',
        scoringGuide: 'Enter % (e.g. 70)\nScore: 0-20%=0, 21-40%=1, 41-60%=2, 61-80%=3, 81-100%=4',
        quickWin: 'Start routing through company channels',
        score: (a) => rangeScore(a, [[0, 20, 0], [21, 40, 1], [41, 60, 2], [61, 80, 3], [81, 100, 4]]) },
      { id: 'D2.2', text: 'Does the company have a CRM system with all client history?', answerType: 'yn',
        scoringGuide: 'Y = CRM exists with full records (low risk)\nN = no CRM / data in owner\'s LINE (high risk)',
        quickWin: 'Deploy a simple CRM (even Google Sheets)',
        score: ynReverseScore },
      { id: 'D2.3', text: 'Who closed the last 5 deals? (owner vs team)', answerType: 'number',
        scoringGuide: 'Enter # closed by owner (0-5)\n0=0pt, 1=1pt, 2=2pt, 3=3pt, 4-5=4pt',
        quickWin: 'Co-sell: owner + team member on every deal',
        score: (a) => rangeScore(a, [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 5, 4]]) },
      { id: 'D2.4', text: 'Has any team member met the top 5 clients without the owner present?', answerType: 'yn',
        scoringGuide: 'Y = team meets clients independently (low risk)\nN = owner always present (high risk)',
        quickWin: 'Schedule solo client visits for account managers',
        score: ynReverseScore },
      { id: 'D2.5', text: 'If the owner left, how many of the top 10 clients would likely leave within 12 months?', answerType: 'number',
        scoringGuide: 'Enter # (0-10)\n0-1=0pt, 2-3=1pt, 4-5=2pt, 6-7=3pt, 8-10=4pt',
        quickWin: 'Start relationship transfer program now',
        score: (a) => rangeScore(a, [[0, 1, 0], [2, 3, 1], [4, 5, 2], [6, 7, 3], [8, 10, 4]]) },
    ]
  },
  {
    id: 'd3', name: 'Knowledge & IP', color: 'hsl(120, 40%, 95%)',
    shortTermRecs: [
      'Document the top 5 critical processes as written SOPs this month',
      'Record any trade secrets/formulations in a secure vault with backup access',
      'Launch monthly knowledge-transfer sessions between key staff',
    ],
    longTermRecs: [
      'Build a structured onboarding program reducing ramp-up to under 4 weeks',
      'Create a living knowledge base accessible to all team members',
      'Cross-train every critical role so no single departure causes knowledge loss',
    ],
    questions: [
      { id: 'D3.1', text: 'Are the company\'s top 5 processes documented in written SOPs?', answerType: 'yn',
        scoringGuide: 'Y = SOPs exist and are current (low risk)\nN = no SOPs exist (high risk)',
        quickWin: 'Document top 5 processes this month',
        score: ynReverseScore },
      { id: 'D3.2', text: 'Is there any trade secret / formulation / method known only to the owner?', answerType: 'yn',
        scoringGuide: 'Y = yes, critical IP in owner\'s head only (high risk)\nN = documented or known by 2+ people (low risk)',
        quickWin: 'Record in secure vault + train backup person',
        score: ynScore },
      { id: 'D3.3', text: 'How long does it take to onboard a new employee to be productive? (weeks)', answerType: 'number',
        scoringGuide: 'Enter weeks\n1-2=0pt, 3-4=1pt, 5-8=2pt, 9-12=3pt, 13+=4pt',
        quickWin: 'Build structured onboarding program',
        score: (a) => rangeScore(a, [[1, 2, 0], [3, 4, 1], [5, 8, 2], [9, 12, 3], [13, 999, 4]]) },
      { id: 'D3.4', text: 'If a key employee quit today, would critical knowledge be lost?', answerType: 'yn',
        scoringGuide: 'Y = yes, knowledge walks out the door (high risk)\nN = documented / cross-trained (low risk)',
        quickWin: 'Implement knowledge transfer sessions monthly',
        score: ynScore },
      { id: 'D3.5', text: 'Does the owner personally train every new hire?', answerType: 'yn',
        scoringGuide: 'Y = yes, owner does all training (high risk)\nN = structured training by team (low risk)',
        quickWin: 'Create training curriculum + assign trainers',
        score: ynScore },
    ]
  },
  {
    id: 'd4', name: 'Operations & systems', color: 'hsl(200, 50%, 95%)',
    shortTermRecs: [
      'Build a daily revenue/KPI dashboard the owner can check without asking anyone',
      'Create opening/closing checklists and delegate to team',
      'Set up a password manager with shared access for critical systems',
    ],
    longTermRecs: [
      'Automate the top 3 most time-consuming manual tasks (invoicing, reporting, inventory)',
      'Institute a weekly standup + monthly operating review rhythm',
      'Achieve full operational independence: business runs without owner for 30+ days',
    ],
    questions: [
      { id: 'D4.1', text: 'Can the owner see today\'s revenue without asking anyone? (real-time dashboard)', answerType: 'yn',
        scoringGuide: 'Y = dashboard exists (low risk)\nN = no dashboard, must ask (high risk)',
        quickWin: 'Build a simple daily dashboard',
        score: ynReverseScore },
      { id: 'D4.2', text: 'Does the owner have to open/close the business daily?', answerType: 'yn',
        scoringGuide: 'Y = owner must be there (high risk)\nN = team handles it (low risk)',
        quickWin: 'Create opening/closing checklist + delegate',
        score: ynScore },
      { id: 'D4.3', text: 'How many critical system passwords are known only to the owner?', answerType: 'number',
        scoringGuide: 'Enter count\n0=0pt, 1-2=1pt, 3-5=2pt, 6-10=3pt, 11+=4pt',
        quickWin: 'Set up password manager with shared access',
        score: (a) => rangeScore(a, [[0, 0, 0], [1, 2, 1], [3, 5, 2], [6, 10, 3], [11, 999, 4]]) },
      { id: 'D4.4', text: 'Is there a weekly/monthly operating rhythm (scheduled meetings, reports)?', answerType: 'yn',
        scoringGuide: 'Y = regular rhythm exists (low risk)\nN = no rhythm, ad-hoc (high risk)',
        quickWin: 'Institute weekly standup + monthly review',
        score: ynReverseScore },
      { id: 'D4.5', text: 'What % of recurring tasks are still done manually? (invoicing, reporting, inventory)', answerType: 'number',
        scoringGuide: 'Enter % manual\n0-20%=0, 21-40%=1, 41-60%=2, 61-80%=3, 81-100%=4',
        quickWin: 'Automate the 3 most time-consuming manual tasks',
        score: (a) => rangeScore(a, [[0, 20, 0], [21, 40, 1], [41, 60, 2], [61, 80, 3], [81, 100, 4]]) },
    ]
  },
  {
    id: 'd5', name: 'People & leadership', color: 'hsl(270, 40%, 95%)',
    shortTermRecs: [
      'Identify and begin developing your No.2 (COO/GM) immediately',
      'Design KPIs for every role: company → department → individual',
      'Set hiring authority levels so the owner only interviews senior hires',
    ],
    longTermRecs: [
      'Map successors for all key positions and invest in their development',
      'Create cross-department communication rhythms (no more hub-and-spoke)',
      'Build a self-managing leadership team capable of running the business independently',
    ],
    questions: [
      { id: 'D5.1', text: 'Is there a designated No.2 (COO/GM) who can run the business for 1 month?', answerType: 'yn',
        scoringGuide: 'Y = clear No.2 exists (low risk)\nN = no one can run it alone (high risk)',
        quickWin: 'Identify and develop your No.2',
        score: ynReverseScore },
      { id: 'D5.2', text: 'Do all employees have written KPIs with quarterly reviews?', answerType: 'yn',
        scoringGuide: 'Y = KPIs exist and are reviewed (low risk)\nN = no KPIs / informal only (high risk)',
        quickWin: 'Design KPI tree: company → department → individual',
        score: ynReverseScore },
      { id: 'D5.3', text: 'For each key position, is there an identified successor?', answerType: 'yn',
        scoringGuide: 'Y = successors identified (low risk)\nN = no succession plan (high risk)',
        quickWin: 'Map successors for top 5 positions',
        score: ynReverseScore },
      { id: 'D5.4', text: 'Does the owner interview every new hire?', answerType: 'yn',
        scoringGuide: 'Y = yes, all hires go through owner (high risk)\nN = hiring delegated by level (low risk)',
        quickWin: 'Set hiring authority: manager hires <level X',
        score: ynScore },
      { id: 'D5.5', text: 'Do departments communicate directly or only through the owner?', answerType: 'yn',
        scoringGuide: 'Y = cross-functional communication exists (low risk)\nN = everything goes through owner (high risk)',
        quickWin: 'Create cross-department meeting rhythm',
        score: ynReverseScore },
    ]
  },
  {
    id: 'd6', name: 'Finance & control', color: 'hsl(45, 60%, 95%)',
    shortTermRecs: [
      'Set a payment authority matrix: delegate signing by amount level',
      'Create an annual budget document with monthly variance tracking',
      'Fully separate company and personal finances; set a fixed owner salary',
    ],
    longTermRecs: [
      'Achieve financial close within 5 days of month-end',
      'Build a self-service financial dashboard (cash, P&L, AR/AP)',
      'Establish financial governance that operates without owner involvement',
    ],
    questions: [
      { id: 'D6.1', text: 'Does the owner sign every payment/check regardless of amount?', answerType: 'yn',
        scoringGuide: 'Y = owner signs all (high risk)\nN = payment authority delegated by level (low risk)',
        quickWin: 'Set payment authority matrix by amount',
        score: ynScore },
      { id: 'D6.2', text: 'Is there an annual budget document?', answerType: 'yn',
        scoringGuide: 'Y = written budget exists (low risk)\nN = no budget / in owner\'s head (high risk)',
        quickWin: 'Create annual budget with monthly tracking',
        score: ynReverseScore },
      { id: 'D6.3', text: 'How many days after month-end are financials available?', answerType: 'number',
        scoringGuide: 'Enter days\n1-5=0pt, 6-10=1pt, 11-15=2pt, 16-25=3pt, 26+=4pt',
        quickWin: 'Set financial close calendar: day 5 hard deadline',
        score: (a) => rangeScore(a, [[1, 5, 0], [6, 10, 1], [11, 15, 2], [16, 25, 3], [26, 999, 4]]) },
      { id: 'D6.4', text: 'Are company and personal finances fully separated?', answerType: 'yn',
        scoringGuide: 'Y = fully separated with owner salary (low risk)\nN = mixed / owner draws freely (high risk)',
        quickWin: 'Separate accounts + set fixed owner salary',
        score: ynReverseScore },
      { id: 'D6.5', text: 'Can the owner see cash position and P&L without calling the accountant?', answerType: 'yn',
        scoringGuide: 'Y = self-service dashboard (low risk)\nN = must call/ask (high risk)',
        quickWin: 'Build owner financial dashboard',
        score: ynReverseScore },
    ]
  },
];

export interface CompanyProfile {
  companyName: string;
  numberOfEmployees: string;
  yearEstablished: string;
  assessmentDate: string;
  annualRevenue: string;
  industry: string;
  ownerAge: string;
  assessedBy: string;
}

export interface ClientRisk {
  clientName: string;
  annualRevenue: number;
  ownerDependent: boolean;
  riskIfOwnerLeaves: string;
  mitigationStatus: string;
}

export function getRiskLevel(weightedScore: number): string {
  if (weightedScore <= 20) return 'LOW';
  if (weightedScore <= 40) return 'MODERATE';
  if (weightedScore <= 60) return 'HIGH';
  if (weightedScore <= 80) return 'VERY HIGH';
  return 'CRITICAL';
}

export function getOverallClassification(totalScore: number): string {
  if (totalScore <= 20) return 'INDEPENDENT';
  if (totalScore <= 40) return 'MOSTLY INDEPENDENT';
  if (totalScore <= 60) return 'DEPENDENT';
  if (totalScore <= 80) return 'HIGHLY DEPENDENT';
  return 'CRITICALLY DEPENDENT';
}

export function getRecommendation(totalScore: number): string {
  if (totalScore <= 20) return 'Business is well-structured. Focus on maintaining systems, growth strategy, and exit planning when ready.';
  if (totalScore <= 40) return 'Good foundation in place. Address remaining dependency areas to strengthen resilience and increase business value.';
  if (totalScore <= 60) return 'Significant owner dependency exists. Prioritize delegation, documentation, and developing your leadership team.';
  if (totalScore <= 80) return 'High risk of disruption if owner is unavailable. Urgent action needed on multiple fronts — start with the highest-scoring dimension.';
  return 'Business cannot function without the owner. Immediate intervention required. Begin with quick wins from the top-scoring dimension this week.';
}
