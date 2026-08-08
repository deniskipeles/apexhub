'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { Mail, Lock, Github, ArrowRight, Loader2, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { loginAction } from '../actions';
import { APEX_HUB_TOKEN } from '@/lib/constants';

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.344-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.462,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

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
                if(typeof window !== 'undefined') localStorage.setItem(APEX_HUB_TOKEN, res.token);

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

    const handleGoogleLogin = async () => {
        await apex.auth.loginWithGoogle(window.location.origin);
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

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleGithubLogin}
                            className="w-full py-3 bg-background border border-border text-foreground rounded-xl flex items-center justify-center gap-2 hover:bg-surface/80 transition-all font-medium group"
                        >
                            <Github size={18} className="group-hover:scale-110 transition-transform" /> GitHub
                        </button>
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full py-3 bg-background border border-border text-foreground rounded-xl flex items-center justify-center gap-2 hover:bg-surface/80 transition-all font-medium group"
                        >
                            <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /> Google
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-sm text-muted">
                    Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline transition-colors">Create an account</Link>
                </p>
            </div>
        </div>
    );
}