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
}

const defaultProfile: CompanyProfile = {
  companyName: '', numberOfEmployees: '', yearEstablished: '',
  assessmentDate: new Date().toISOString().split('T')[0],
  annualRevenue: '', industry: '', ownerAge: '', assessedBy: '',
};

const defaultClients = Array.from({ length: 10 }, () => ({
  clientName: '', annualRevenue: 0, ownerDependent: false,
  riskIfOwnerLeaves: '', mitigationStatus: '',
}));

export const useODIStore = create<ODIState>((set) => ({
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
  reset: () => set({ step: 0, profile: { ...defaultProfile }, selectedProfile: 'Balanced (Default)', answers: {}, clients: defaultClients.map(c => ({ ...c })) }),
}));
