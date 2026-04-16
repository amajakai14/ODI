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
  loadAssessment: (userId: string) => Promise<void>;
  saveAssessment: (userId: string) => Promise<void>;
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

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(userId: string, get: () => ODIState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    get().saveAssessment(userId);
  }, 1500);
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
  reset: () => set({
    step: 0, profile: { ...defaultProfile }, selectedProfile: 'Balanced (Default)',
    answers: {}, clients: defaultClients.map(c => ({ ...c })), assessmentId: null,
  }),
  assessmentId: null,
  loaded: false,

  loadAssessment: async (userId: string) => {
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
      set({ loaded: true });
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

