import React, { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { logoutAction } from '@/app/actions';
import { APEX_HUB_TOKEN } from '@/lib/constants';
import { useRouter, Link } from '@/lib/navigation';
import { User, Key, Shield, LogOut, Server, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';

export function ProfileView() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [apiKeys, setApiKeys] = useState<string[]>([
    'apk_live_99214a1a89bf00a98214',
    'apk_test_10823c72b1298a0021ee'
  ]);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const token = apex.getToken();
        if (token) {
          const u = await apex.auth.getMe();
          setUser(u || {
            id: 'usr_demo_882',
            name: 'Apex Developer',
            email: 'dev@apexkit.io',
            role: 'developer',
            joined: 'August 2026'
          });
        } else {
          setUser({
            id: 'usr_guest_301',
            name: 'Guest Developer',
            email: 'guest@apexkit.io',
            role: 'developer',
            joined: 'August 2026'
          });
        }
      } catch {
        setUser({
          id: 'usr_dev_101',
          name: 'Apex Developer',
          email: 'dev@apexkit.io',
          role: 'developer',
          joined: 'August 2026'
        });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    apex.setToken('');
    if (typeof window !== 'undefined') localStorage.removeItem(APEX_HUB_TOKEN);
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const generateNewKey = () => {
    const newKey = `apk_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 10)}`;
    setApiKeys([newKey, ...apiKeys]);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-amber-400"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold shadow-inner">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{user?.name || 'Developer'}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide border border-primary/20">
                  {user?.role || 'Developer'}
                </span>
              </div>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-xl border border-red-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer w-full md:w-auto"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Account Details */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <User size={18} className="text-primary" /> Profile Settings
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">User ID</span>
              <code className="text-xs font-mono bg-background px-2.5 py-1 rounded-lg border border-border block text-foreground">
                {user?.id || 'usr_demo_101'}
              </code>
            </div>

            <div>
              <span className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Account Scope</span>
              <span className="text-foreground font-semibold flex items-center gap-2">
                <Shield size={14} className="text-amber-500" /> Full Tenant Administrator
              </span>
            </div>

            <div>
              <span className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Joined</span>
              <span className="text-foreground">{user?.joined || 'August 2026'}</span>
            </div>
          </div>
        </div>

        {/* Middle & Right Column - API Keys & Multi-tenant instances */}
        <div className="md:col-span-2 space-y-6">
          {/* API Token Box */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Key size={18} className="text-primary" /> Active API Keys
              </h2>
              <button 
                type="button" 
                onClick={generateNewKey}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles size={12} /> Generate Key
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Use these keys in your <code className="text-primary font-mono">ApexKit</code> client headers or environment variables to execute queries server-side.
            </p>

            <div className="space-y-2">
              {apiKeys.map((key, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl text-xs font-mono">
                  <span className="text-foreground font-semibold truncate max-w-[260px] md:max-w-md">{key}</span>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(key)}
                    className="p-1.5 text-muted hover:text-primary transition-colors cursor-pointer"
                    title="Copy API key"
                  >
                    {copiedKey ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tenancies */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Server size={18} className="text-primary" /> Managed Tenancies
              </h2>
              <Link 
                href="/ecosystem?tab=tenancy" 
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Marketplace <ExternalLink size={12} />
              </Link>
            </div>

            <div className="p-4 bg-background border border-border rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">primary.apexkit.dev</h4>
                  <p className="text-xs text-muted">Core Sandbox • SQLite WAL Engine</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-lg uppercase">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
