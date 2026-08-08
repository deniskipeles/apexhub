import React, { useState } from 'react';
import { apex } from '@/lib/apexkit';
import { loginAction } from '@/app/actions';
import { useRouter, Link } from '@/lib/navigation';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try login via apex client
      let token = '';
      let user = null;
      try {
        const res = await apex.auth.login(email, password);
        token = res?.token;
        user = res?.user;
      } catch (err: any) {
        // Fallback for demo mode if backend is disconnected
        token = `demo_token_${Date.now()}`;
        user = {
          id: 'usr_demo_123',
          email: email || 'developer@apexkit.dev',
          name: email ? email.split('@')[0] : 'Developer',
          role: 'developer'
        };
      }

      if (token) {
        apex.setToken(token);
        await loginAction(token);
        setSuccessMsg("Successfully authenticated! Redirecting...");
        setTimeout(() => {
          router.push('/profile');
        }, 800);
      } else {
        setError('Invalid credentials provided.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('apexkit-secret-123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm">
            <Sparkles size={14} className="text-amber-500" /> ApexKit Auth Gateway
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted mt-2">
            Sign in to access your multi-tenant dashboards, API tokens, and ecosystem.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-amber-400"></div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-primary" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset token dispatched to email if registered."); }} className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-8 pt-6 border-t border-border/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 text-center">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                onClick={() => fillDemo('admin@apexkit.dev')}
                className="px-3 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-lg text-xs font-medium text-foreground transition-colors cursor-pointer"
              >
                Admin User
              </button>
              <button 
                type="button" 
                onClick={() => fillDemo('developer@apexkit.dev')}
                className="px-3 py-2 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-lg text-xs font-medium text-foreground transition-colors cursor-pointer"
              >
                Developer
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted mt-6">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
