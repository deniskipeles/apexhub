'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { Mail, Lock, Github, ArrowRight, Loader2, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { loginAction } from '../actions';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await apex.auth.login(email, password);
            if (res.token) {
                // 1. Set Cookie (Persist for Server/Next Visit)
                await loginAction(res.token);

                // 2. Set SDK (Immediate Client Use)
                apex.setToken(res.token);

                router.push('/');
                router.refresh(); // Syncs Server Components
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        await apex.auth.loginWithGithub(window.location.origin);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden font-sans">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full -z-10"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border mb-6 shadow-xl hover:scale-105 transition-transform duration-300">
                        <LogIn className="h-8 w-8 text-primary" />
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h1>
                    <p className="text-muted mt-2">Sign in to your ApexHub account</p>
                </div>

                <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-muted">Password</label>
                                <button type="button" className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Sign In</>}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-4 text-muted font-bold tracking-wider">Or continue with</span>
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
                    Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline transition-colors">Create an account</Link>
                </p>
            </div>
        </div>
    );
}