import { create } from 'zustand';
import { CompanyProfile, ClientRisk } from './odi-data';
import { supabase } from '@/integrations/supabase/client';

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
  assessmentId: string | null;
  loaded: boolean;
  loadAssessment: (userId: string | null) => Promise<void>;
  saveAssessment: (userId: string) => Promise<void>;
  saveGuestLocal: () => void;
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

const GUEST_KEY = 'odi:guest';

function readGuestLocal() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeGuestLocal(state: Partial<ODIState>) {
  try {
    localStorage.setItem(
      GUEST_KEY,
      JSON.stringify({
        step: state.step,
        profile: state.profile,
        selectedProfile: state.selectedProfile,
        answers: state.answers,
        clients: state.clients,
      }),
    );
  } catch {
    /* ignore */
  }
}

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
    try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
    set({
      step: 0, profile: { ...defaultProfile }, selectedProfile: 'Balanced (Default)',
      answers: {}, clients: defaultClients.map(c => ({ ...c })), assessmentId: null,
    });
  },
  assessmentId: null,
  loaded: false,

  saveGuestLocal: () => writeGuestLocal(get()),

  loadAssessment: async (userId: string | null) => {
    // Guest: load from localStorage
    if (!userId) {
      const local = readGuestLocal();
      if (local) {
        set({
          profile: local.profile ?? { ...defaultProfile },
          answers: local.answers ?? {},
          selectedProfile: local.selectedProfile ?? 'Balanced (Default)',
          step: local.step ?? 0,
          clients: local.clients ?? defaultClients.map(c => ({ ...c })),
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
      return;
    }

    // Logged-in: load from Supabase, falling back to any local guest data
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      set({
        assessmentId: data.id,
        profile: data.profile as unknown as CompanyProfile,
        answers: data.answers as unknown as Record<string, string>,
        selectedProfile: data.selected_profile,
        step: data.step,
        loaded: true,
      });
    } else {
      // Migrate guest data into the user's account, if present
      const local = readGuestLocal();
      if (local) {
        set({
          profile: local.profile ?? { ...defaultProfile },
          answers: local.answers ?? {},
          selectedProfile: local.selectedProfile ?? 'Balanced (Default)',
          step: local.step ?? 0,
          clients: local.clients ?? defaultClients.map(c => ({ ...c })),
          loaded: true,
        });
        // Persist immediately so it's saved to the account
        await get().saveAssessment(userId);
        try { localStorage.removeItem(GUEST_KEY); } catch { /* ignore */ }
      } else {
        set({ loaded: true });
      }
    }
  },

  saveAssessment: async (userId: string) => {
    const state = get();
    const payload = {
      user_id: userId,
      profile: state.profile as any,
      answers: state.answers as any,
      selected_profile: state.selectedProfile,
      step: state.step,
    };

    if (state.assessmentId) {
      await supabase
        .from('assessments')
        .update(payload)
        .eq('id', state.assessmentId);
    } else {
      const { data } = await supabase
        .from('assessments')
        .insert(payload)
        .select('id')
        .single();
      if (data) {
        set({ assessmentId: data.id });
      }
    }
  },
}));
