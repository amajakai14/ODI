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
