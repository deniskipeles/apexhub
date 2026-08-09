import React, { useEffect, useState } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { loginAction } from '@/app/actions';
import { APEX_HUB_TOKEN } from '@/lib/constants';
import { useRouter, Link } from '@/lib/navigation';
import { User, Key, Shield, LogOut, Server, Copy, Check, Sparkles, ExternalLink, Plus, Loader2 } from 'lucide-react';

export function ProfileView() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // 1. Intercept OAuth Token from URL if returning from GitHub
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
          apex.setToken(urlToken);
          await loginAction(urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const token = apex.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // 2. Fetch Real Authenticated User
        const u = await apex.auth.getMe().catch(() => null);
        if (!u) {
          router.push('/login');
          return;
        }

        if (isMounted) setUser(u);

        // 3. Fetch User's Registered Tenants directly from `tenant_registry` collection
        const registryRes = await apex.collection('tenant_registry').list({
          filter: { owner_id: u.id }
        }).catch(() => ({ items: [] }));

        if (isMounted) {
          setTenancies(registryRes.items || []);
        }

        // 4. Server-Side Webhook Execution for Profile Keys & Extended Data
        try {
          const profileScriptRes = await apex.scripts.run('get-user-profile-data', { user_id: u.id });
          if (isMounted && profileScriptRes) {
            if (Array.isArray(profileScriptRes.keys)) {
              setApiKeys(profileScriptRes.keys);
            }
            if (Array.isArray(profileScriptRes.tenants) && profileScriptRes.tenants.length > 0) {
              setTenancies(profileScriptRes.tenants);
            }
          }
        } catch (scriptErr) {
          // Fallback for Root Admins if script webhook is not installed
          if (u.role === 'admin') {
            const fetchedKeys = await apex.admins.listApiKeys().catch(() => []);
            if (isMounted) setApiKeys(fetchedKeys || []);
          }
        }

      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    apex.setToken('');
    if (typeof window !== 'undefined') localStorage.removeItem(APEX_HUB_TOKEN);
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateNewKey = async () => {
    setGenerating(true);
    const keyName = `Key_${Math.floor(Math.random() * 1000)}`;

    try {
      // 1. Try Server-side Webhook Script
      const scriptRes = await apex.scripts.run('create-tenant-api-key', { name: keyName });
      if (scriptRes && (scriptRes.key || scriptRes.info)) {
        setApiKeys([{ ...scriptRes.info, raw_key: scriptRes.key }, ...apiKeys]);
        return;
      }
      
      // 2. Fallback to Admin API if user is Root Admin
      if (user?.role === 'admin') {
        const res = await apex.admins.createApiKey(keyName);
        setApiKeys([{ ...res.info, raw_key: res.key }, ...apiKeys]);
      } else {
        alert("API Key creation requires tenant authorization.");
      }
    } catch (e: any) {
      alert(e.message || "Failed to generate key.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs text-muted font-mono">Loading profile data...</span>
      </div>
    );
  }

  const avatar = user?.metadata?.avatar ? getFileUrl(user.metadata.avatar) : null;
  const userName = user?.metadata?.name || user?.email?.split('@')[0] || 'Developer';

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-amber-400"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-2xl border border-border object-cover shadow-inner" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold shadow-inner">
                {userName[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide border border-primary/20">
                  {user?.role || 'User'}
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
            <User size={18} className="text-primary" /> Account Info
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">User ID</span>
              <code className="text-xs font-mono bg-background px-2.5 py-1 rounded-lg border border-border block text-foreground truncate">
                {user?.id}
              </code>
            </div>

            <div>
              <span className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Account Scope</span>
              <span className="text-foreground font-semibold flex items-center gap-2">
                <Shield size={14} className="text-amber-500" /> {user?.scope === 'root' ? 'Root Administrator' : 'Tenant Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Middle & Right Column - API Keys & Registered Tenancies */}
        <div className="md:col-span-2 space-y-6">
          
          {/* API Token Box */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Key size={18} className="text-primary" /> API Keys
              </h2>
              <button 
                type="button" 
                onClick={generateNewKey}
                disabled={generating}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={12} /> {generating ? 'Generating...' : 'Generate Key'}
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Use these keys in your <code className="text-primary font-mono">ApexKit</code> client headers or environment variables to execute queries server-side.
            </p>

            <div className="space-y-2">
              {apiKeys.length === 0 ? (
                 <div className="text-center py-6 text-muted text-sm border border-dashed border-border rounded-xl">No active API keys found.</div>
              ) : (
                apiKeys.map((key) => {
                  const displayStr = key.raw_key ? key.raw_key : `${key.env_type || 'key'}_...${key.key_id || key.id}`;
                  
                  return (
                    <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background border border-border rounded-xl text-xs gap-2">
                      <div>
                         <div className="font-bold text-foreground mb-1">{key.name || 'API Key'}</div>
                         <code className="text-muted font-mono truncate max-w-[200px] md:max-w-[300px] block">{displayStr}</code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {key.raw_key && (
                            <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">Copy Now</span>
                        )}
                        <button 
                          type="button"
                          onClick={() => copyToClipboard(key.raw_key || key.key_id || key.id)}
                          className="p-1.5 bg-surface text-muted hover:text-primary rounded transition-colors cursor-pointer border border-border"
                          title="Copy API key"
                        >
                          {copiedKey === (key.raw_key || key.key_id || key.id) ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tenancies (from tenant_registry Collection) */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Server size={18} className="text-primary" /> Registered Tenancies
              </h2>
              <Link 
                href="/ecosystem/tenancy/request-apexkit-official-tenancy" 
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Provision New
              </Link>
            </div>

            <div className="space-y-3">
              {tenancies.length === 0 ? (
                <div className="text-center py-6 text-muted text-sm border border-dashed border-border rounded-xl">
                  No registered tenancies found in <code className="font-mono text-primary">tenant_registry</code>.
                </div>
              ) : (
                tenancies.map(tenant => {
                  const appName = tenant.data?.app_name || tenant.name || tenant.id;
                  const description = tenant.data?.usage_or_description || tenant.tier || 'Active Tenant';

                  return (
                    <div key={tenant.id} className="p-4 bg-background border border-border rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            {appName} 
                            <a href={`/_dashboard/tenant/${tenant.id}`} target="_blank" rel="noreferrer" className="text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink size={12} />
                            </a>
                          </h4>
                          <p className="text-xs text-muted">{description}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}