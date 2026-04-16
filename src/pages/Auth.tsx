import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Check your email for a password reset link');
        setMode('login');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Check your email for a confirmation link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">ODI v2 Assessment</h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'forgot' ? 'Reset your password' : mode === 'register' ? 'Create an account' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {mode !== 'forgot' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'register' ? 'Register' : 'Sign in'}
          </Button>
        </form>

        {mode === 'login' && (
          <button onClick={() => setMode('forgot')} className="block w-full text-center text-sm text-muted-foreground hover:text-primary underline">
            Forgot password?
          </button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'forgot' ? (
            <button onClick={() => setMode('login')} className="text-primary underline">Back to sign in</button>
          ) : mode === 'register' ? (
            <>Already have an account?{' '}<button onClick={() => setMode('login')} className="text-primary underline">Sign in</button></>
          ) : (
            <>Don't have an account?{' '}<button onClick={() => setMode('register')} className="text-primary underline">Register</button></>
          )}
        </p>
      </div>
    </div>
  );
}
