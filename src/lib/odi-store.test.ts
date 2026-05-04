import { describe, it, expect, beforeEach } from 'vitest';
import { useODIStore } from './odi-store';

const STORAGE_KEY = 'odi:assessment';

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
