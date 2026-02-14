'use client';

import React from 'react';
import { 
    Users, Target, Zap, Heart, Globe, 
    Coffee, ArrowRight, ShieldCheck, Sparkles, 
    Code2, Rocket, Award 
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen space-y-32">
            
            {/* --- HERO SECTION --- */}
            <div className="text-center max-w-4xl mx-auto pt-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles size={14} /> The Evolution of Backend
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tighter leading-tight">
                    Powering the <span className="text-primary">Extreme</span>, <br/>
                    Delivering the <span className="text-primary">Excellent</span>.
                </h1>
                <p className="text-xl text-muted leading-relaxed max-w-2xl mx-auto">
                    ApexHub is the home of <strong>ApexKit</strong>—the specialized toolkit designed to collapse the complexity of the modern cloud into a single, high-performance runtime.
                </p>
            </div>

            {/* --- THE NAME DECONSTRUCTION --- */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/30 p-8 md:p-16">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Award size={300} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">What is ApexKit?</h2>
                        <p className="text-lg text-muted leading-relaxed">
                            The name isn't just a brand—it's our technical manifesto.
                        </p>
                        <div className="space-y-4">
                            <AcronymRow 
                                letter="A" 
                                word="API" 
                                desc="A unified interface providing REST, GraphQL, and Real-time WebSockets out of the box." 
                            />
                            <AcronymRow 
                                letter="P" 
                                word="Platform" 
                                desc="A complete environment for data, files, and AI-driven automation." 
                            />
                            <AcronymRow 
                                letter="EX" 
                                word="Extreme" 
                                desc="Extreme performance powered by Rust and optimized SQLite, delivering sub-millisecond response times." 
                            />
                            <AcronymRow 
                                letter="KIT" 
                                word="Excellent Kit" 
                                desc="An excellent, developer-first toolkit that simplifies scaling from zero to millions." 
                            />
                        </div>
                    </div>
                    
                    <div className="bg-[#0d0d0d] rounded-2xl p-8 border border-white/5 shadow-2xl font-mono text-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                            <div className="h-3 w-3 rounded-full bg-red-500/20"></div>
                            <div className="h-3 w-3 rounded-full bg-yellow-500/20"></div>
                            <div className="h-3 w-3 rounded-full bg-green-500/20"></div>
                            <span className="ml-4 text-zinc-500">definition.json</span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-zinc-400">{"{"}</p>
                            <p className="pl-4 text-primary">"name": <span className="text-emerald-400">"ApexKit"</span>,</p>
                            <p className="pl-4 text-primary">"stands_for": <span className="text-emerald-400">"API Extreme and Excellent Kit"</span>,</p>
                            <p className="pl-4 text-primary">"core": [<span className="text-amber-400">"Rust"</span>, <span className="text-amber-400">"SQLite"</span>, <span className="text-amber-400">"AI"</span>],</p>
                            <p className="pl-4 text-primary">"mission": <span className="text-emerald-400">"Vertical Scale to the Limit"</span></p>
                            <p className="text-zinc-400">{"}"}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- OUR MISSION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="bg-surface/50 border border-border rounded-3xl p-8 aspect-square md:aspect-auto flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                    <Target size={120} className="text-primary opacity-20 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute bottom-8 left-8 right-8 p-6 bg-background/80 backdrop-blur-md rounded-xl border border-border shadow-xl">
                        <div className="text-sm font-bold text-foreground mb-1 italic">"Vertical scaling is the new horizontal."</div>
                        <div className="text-xs text-muted-foreground">— The Apex Manifesto</div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">Our Philosophy</h2>
                    <p className="text-muted leading-relaxed text-lg">
                        In a world obsessed with complex microservices, we dared to ask: 
                        <span className="text-foreground font-medium italic"> "What if a single node was all you ever needed?"</span>
                    </p>
                    <p className="text-muted leading-relaxed">
                        ApexKit was born from the obsession to maximize modern hardware. By using Rust's safety and SQLite's simplicity, we've built a <strong>kit</strong> that allows you to build <strong>excellent</strong> applications with <strong>extreme</strong> efficiency.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <BadgeItem icon={<Zap className="text-yellow-500" />} text="High Performance" />
                        <BadgeItem icon={<ShieldCheck className="text-emerald-500" />} text="Memory Safety" />
                        <BadgeItem icon={<Rocket className="text-primary" />} text="Single Binary" />
                    </div>
                </div>
            </div>

            {/* --- VALUES GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ValueCard 
                    icon={<Globe size={24} />} 
                    title="Open by Default" 
                    desc="Our core runtime is MIT licensed. We believe the future of the web should be built in public, for everyone." 
                />
                <ValueCard 
                    icon={<Award size={24} />} 
                    title="Excellent DX" 
                    desc="We prioritize developer experience. From automated SDK generation to AI debugging, we make the backend effortless." 
                />
                <ValueCard 
                    icon={<Users size={24} />} 
                    title="Community Driven" 
                    desc="Our roadmap is defined by our users. Every optimization shared on our platform helps build a faster web." 
                />
            </div>

            {/* --- CALL TO ACTION --- */}
            <div className="bg-gradient-to-br from-primary/10 to-surface border border-primary/20 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                <h2 className="text-4xl font-bold text-foreground mb-4">Join the Vertical Revolution</h2>
                <p className="text-muted max-w-xl mx-auto mb-10 text-lg">
                    Ready to build with the most excellent kit in the industry? 
                    Explore the ecosystem or contribute to the core.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/ecosystem" className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                        Get Started <ArrowRight size={18} />
                    </Link>
                    <Link href="/careers" className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-foreground font-bold rounded-xl hover:bg-surface/80 transition-all">
                        Join the Team
                    </Link>
                </div>
            </div>
        </div>
    );
}

// --- HELPER COMPONENTS ---

function AcronymRow({ letter, word, desc }: { letter: string, word: string, desc: string }) {
    return (
        <div className="flex gap-4 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary font-black text-xl shrink-0 transition-transform group-hover:scale-110">
                {letter}
            </div>
            <div>
                <h4 className="font-bold text-foreground text-lg leading-none mb-1">{word}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 bg-surface/30 border border-border rounded-2xl hover:border-primary/40 hover:bg-surface/50 transition-all duration-300">
            <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-primary mb-6 border border-border shadow-inner">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
            <p className="text-muted text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function BadgeItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-2 text-sm font-bold text-foreground bg-surface/50 px-4 py-2 rounded-full border border-border shadow-sm">
            {icon}
            {text}
        </div>
    );
}