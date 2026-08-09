import React, { useState, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { 
    Server, ArrowLeft, Loader2, CheckCircle, 
    AlertTriangle, Shield, Zap, ExternalLink, Check, X
} from 'lucide-react';
import { Link } from '@/lib/navigation';

export function RequestOfficialTenancyView() {
    const [appName, setAppName] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [isCustomTenantId, setIsCustomTenantId] = useState(false);
    const [tier, setTier] = useState('free');

    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availability, setAvailability] = useState<'available' | 'taken' | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<any | null>(null);

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleAppNameChange = (val: string) => {
        setAppName(val);
        if (!isCustomTenantId) {
            setTenantId(slugify(val));
        }
    };

    const handleTenantIdChange = (val: string) => {
        setIsCustomTenantId(true);
        setTenantId(slugify(val));
    };

    // Real-Time Availability Check using stringified JSON filter
    useEffect(() => {
        if (!tenantId.trim() || tenantId.length < 3) {
            setAvailability(null);
            setCheckingAvailability(false);
            return;
        }

        setCheckingAvailability(true);
        const timer = setTimeout(async () => {
            try {
                const res = await apex.collection('tenant_registry').list({
                    filter: JSON.stringify({ tenant_id: tenantId })
                }).catch(() => ({ total: 0 }));

                if (res && res.total > 0) {
                    setAvailability('taken');
                } else {
                    setAvailability('available');
                }
            } catch {
                setAvailability(null);
            } finally {
                setCheckingAvailability(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appName.trim() || !tenantId.trim()) return;
        if (availability === 'taken') {
            setError("The chosen Tenant ID is already taken. Please select another.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await apex.scripts.run('provision-tenant', {
                app_name: appName,
                tenant_id: tenantId,
                tier: tier
            });

            if (result && result.success) {
                setSuccessData(result);
            } else {
                throw new Error(result?.error || "Failed to provision tenant.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred. Ensure you are signed in.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="text-emerald-500 w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Tenant Provisioned!</h2>
                <p className="text-muted max-w-md mb-6 leading-relaxed text-sm">
                    Your isolated backend environment <strong>{successData.app_name}</strong> is live. 
                    We've generated your admin credentials and sent details to your registered email.
                </p>
                
                <div className="bg-surface border border-border rounded-2xl p-5 mb-8 flex flex-col gap-2 font-mono text-sm w-full max-w-sm">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-muted text-xs">App Name:</span>
                        <span className="text-foreground font-bold">{successData.app_name}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-muted text-xs">Tenant ID:</span>
                        <span className="text-primary font-bold">{successData.tenant_id}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <a 
                        href={successData.links?.dashboard || `/_dashboard/tenant/${successData.tenant_id}`} 
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        Go to Dashboard <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
            <div className="mb-10">
                <Link href="/ecosystem?tab=tenancy" className="text-sm text-muted hover:text-primary flex items-center gap-1 mb-6 w-fit transition-colors font-medium">
                    <ArrowLeft size={14} /> Back to Market
                </Link>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
                    <Zap size={14} /> Official Hosting
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                    Provision a Tenant Environment
                </h1>
                <p className="text-muted text-base leading-relaxed">
                    Instantly deploy an isolated ApexKit database and API. Free for community members (subject to quotas).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface/30 border border-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs sm:text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Provisioning Failed</p>
                            <p className="opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-5 relative z-10">
                    
                    {/* Display Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Display App Name</label>
                        <input 
                            type="text" 
                            required
                            value={appName}
                            onChange={e => handleAppNameChange(e.target.value)}
                            placeholder="e.g. Acme E-Commerce"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    {/* Tenant ID with Real-Time Availability Indicator */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted">Unique Tenant ID</label>
                            {checkingAvailability ? (
                                <span className="text-[11px] text-muted flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" /> Checking availability...
                                </span>
                            ) : availability === 'available' ? (
                                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <Check size={12} /> Available
                                </span>
                            ) : availability === 'taken' ? (
                                <span className="text-[11px] text-red-500 font-bold flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                    <X size={12} /> Already Taken
                                </span>
                            ) : null}
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                required
                                value={tenantId}
                                onChange={e => handleTenantIdChange(e.target.value)}
                                placeholder="acme-e-commerce"
                                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm font-mono text-foreground focus:ring-2 outline-none transition-all ${
                                    availability === 'taken' 
                                        ? 'border-red-500/50 focus:ring-red-500/40' 
                                        : availability === 'available' 
                                        ? 'border-emerald-500/50 focus:ring-emerald-500/40' 
                                        : 'border-border focus:ring-primary/40'
                                }`}
                            />
                        </div>
                        <p className="text-[11px] text-muted">
                            Used in your database isolation paths (<code className="font-mono text-primary">/tenant/{tenantId || 'tenant-id'}</code>).
                        </p>
                    </div>
                    
                    {/* Tier Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Select Tier</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div 
                                onClick={() => setTier('free')}
                                className={`cursor-pointer border rounded-2xl p-4 transition-all ${tier === 'free' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/50'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-foreground text-sm">Hobby Free</h3>
                                    {tier === 'free' && <CheckCircle className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="text-xs text-muted space-y-1">
                                    <p>• 500 MB SQLite Storage</p>
                                    <p>• Shared AI Embeddings</p>
                                    <p>• Max 3 Tenants per Account</p>
                                </div>
                            </div>

                            <div className="cursor-not-allowed border border-border bg-background/50 rounded-2xl p-4 opacity-50 relative overflow-hidden">
                                <div className="absolute top-3 right-3 text-[10px] font-bold uppercase bg-surface px-2 py-0.5 rounded text-muted border border-border">Pro</div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-foreground text-sm">Dedicated</h3>
                                </div>
                                <div className="text-xs text-muted space-y-1">
                                    <p>• 10 GB Storage</p>
                                    <p>• Dedicated Vector DB</p>
                                    <p>• Custom Domains</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Physically isolated SQLite WAL database.</span>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !appName.trim() || !tenantId.trim() || availability === 'taken'}
                        className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Server size={18} /> Provision Now</>}
                    </button>
                </div>
            </form>
        </div>
    );
}