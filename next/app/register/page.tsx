// =========================== /app/register/page.tsx ===========================
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { User, Mail, Lock, Github, ArrowRight, Loader2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { loginAction } from '../actions';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Register
            await apex.auth.register(formData.email, formData.password);

            // 2. Auto Login to get Token
            const res = await apex.auth.login(formData.email, formData.password);

            if (res && res.token) {
                // 1. Set Cookie (Persist for Server/Next Visit)
                await loginAction(res.token);

                // 2. Set SDK (Immediate Client Use)
                apex.setToken(res.token);

                router.push('/');
                router.refresh(); // Syncs Server Components
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Registration failed. Email might be taken.");
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        await apex.auth.loginWithGithub(window.location.origin)
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden font-sans">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-10"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border mb-6 shadow-xl hover:scale-105 transition-transform duration-300">
                        <UserPlus className="h-8 w-8 text-primary" />
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Create an account</h1>
                    <p className="text-muted mt-2">Join the vertical-scale revolution</p>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl relative">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                                    placeholder="Alex Chen"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                                    placeholder="Min. 6 characters"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
                            <CheckCircle2 size={18} className="text-primary shrink-0" />
                            <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest font-bold">
                                By creating an account, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Create Account</>}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-4 text-muted font-bold tracking-wider">Or join with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGithubLogin}
                        className="w-full py-3 bg-background border border-border text-foreground rounded-xl flex items-center justify-center gap-3 hover:bg-surface/80 hover:border-muted transition-all font-medium group"
                    >
                        <Github size={20} className="group-hover:scale-110 transition-transform" /> GitHub
                    </button>
                </div>

                <p className="text-center mt-8 text-sm text-muted">
                    Already have an account? <Link href="/login" className="text-primary font-bold hover:underline transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
}