'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { 
    Server, ArrowLeft, Loader2, CheckCircle, 
    AlertTriangle, Shield, Zap, ExternalLink 
} from 'lucide-react';
import Link from 'next/link';

export default function RequestOfficialTenancyPage() {
    const router = useRouter();
    
    // Form State
    const [appName, setAppName] = useState('');
    const [tier, setTier] = useState('free');
    
    // Process State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await apex.scripts.run('provision-tenant', {
                name: appName,
                tier: tier
            });

            if (result.success) {
                setSuccessData(result);
            } else {
                throw new Error(result.error || "Failed to provision tenant.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred. Ensure you are logged in.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <CheckCircle className="text-green-500 w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">App Provisioned!</h2>
                <p className="text-muted max-w-md mb-6 leading-relaxed">
                    Your isolated backend environment <strong>{successData.app_name}</strong> is live. 
                    We've sent an email with your temporary admin password.
                </p>
                
                <div className="bg-surface border border-border rounded-xl p-4 mb-8 flex flex-col gap-2 font-mono text-sm w-full max-w-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Tenant ID:</span>
                        <span className="text-primary font-bold">{successData.tenant_id}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <a 
                        href={successData.links?.dashboard || `/_dashboard/tenant/${successData.tenant_id}`} 
                        className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
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
                <Link href="/ecosystem?tab=tenancy" className="text-sm text-muted hover:text-primary flex items-center gap-1 mb-6 w-fit transition-colors">
                    <ArrowLeft size={14} /> Back to Market
                </Link>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
                    <Zap size={14} /> Official Hosting
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                    Provision an Environment
                </h1>
                <p className="text-muted text-lg leading-relaxed">
                    Instantly deploy an isolated ApexKit database and API. Free for community members (subject to quotas).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface/30 border border-border p-6 md:p-8 rounded-3xl shadow-sm space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1">Provisioning Failed</p>
                            <p className="opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">Application Name</label>
                        <input 
                            type="text" 
                            required
                            value={appName}
                            onChange={e => setAppName(e.target.value)}
                            placeholder="e.g. My Next Big SaaS"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                        />
                        <p className="text-xs text-muted">This will be used to generate your unique Tenant ID.</p>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">Select Tier</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div 
                                onClick={() => setTier('free')}
                                className={`cursor-pointer border rounded-xl p-4 transition-all ${tier === 'free' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/50'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-foreground">Hobby</h3>
                                    {tier === 'free' && <CheckCircle className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="text-xs text-muted space-y-1.5">
                                    <p>• 50 MB Storage</p>
                                    <p>• Shared AI Models</p>
                                    <p>• Standard Support</p>
                                </div>
                            </div>

                            <div className="cursor-not-allowed border border-border bg-background/50 rounded-xl p-4 opacity-60 relative overflow-hidden">
                                <div className="absolute top-3 right-3 text-[10px] font-bold uppercase bg-surface px-2 py-0.5 rounded text-muted">Coming Soon</div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-foreground">Pro</h3>
                                </div>
                                <div className="text-xs text-muted space-y-1.5">
                                    <p>• 10 GB Storage</p>
                                    <p>• Dedicated Vector DB</p>
                                    <p>• Custom Domains</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>Physically isolated database.</span>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !appName.trim()}
                        className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Server size={18} /> Provision Now</>}
                    </button>
                </div>
            </form>
        </div>
    );
}