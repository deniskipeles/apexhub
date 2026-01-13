'use client';

import React from 'react';
import { Users, Target, Zap, Heart, Globe, Coffee, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold tracking-wide uppercase mb-6">
                    Our Story
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                    Building the <span className="text-primary">backbone</span> of the next web.
                </h1>
                <p className="text-xl text-muted leading-relaxed">
                    We believe backend development has become unnecessarily complex. 
                    ApexHub is our answer: a return to simplicity, performance, and sanity.
                </p>
            </div>

            {/* Mission Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                    <p className="text-muted leading-7 text-lg">
                        In a world obsessed with microservices and kubernetes clusters, we dared to ask: 
                        <span className="text-foreground font-medium italic"> "What if a single server was enough?"</span>
                    </p>
                    <p className="text-muted leading-7">
                        ApexKit was born from the frustration of managing distributed systems for products that didn't need them. 
                        We set out to build a tool that maximizes the power of modern hardware using Rust, SQLite, and 
                        smart architecture to empower developers to ship faster.
                    </p>
                    <div className="flex gap-6 pt-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground bg-surface px-4 py-2 rounded-lg border border-border">
                            <Zap className="text-yellow-500" size={18} /> High Performance
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground bg-surface px-4 py-2 rounded-lg border border-border">
                            <Heart className="text-red-500" size={18} /> Developer Joy
                        </div>
                    </div>
                </div>
                <div className="bg-surface/50 border border-border rounded-3xl p-8 aspect-video md:aspect-auto flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                    <Target size={120} className="text-primary opacity-20 group-hover:scale-110 transition-transform duration-500" />
                </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                <ValueCard 
                    icon={<Globe size={24} />} 
                    title="Open by Default" 
                    desc="We believe in open source. Our core runtime is MIT licensed and always will be. We build in public." 
                />
                <ValueCard 
                    icon={<Coffee size={24} />} 
                    title="Pragmatism" 
                    desc="We choose boring technology that works (SQLite) over hype trains that break in production." 
                />
                <ValueCard 
                    icon={<Users size={24} />} 
                    title="Community First" 
                    desc="Our roadmap is driven by the people using the tool, not VC demands. We listen to every issue." 
                />
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-surface to-background border border-border rounded-2xl p-12 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">Join the Revolution</h2>
                <p className="text-muted max-w-xl mx-auto mb-8">
                    We are always looking for contributors. Check out our repositories or join the discussion.
                </p>
                <Link href="/careers" className="px-8 py-3 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 transition-colors inline-flex items-center gap-2">
                    View Open Positions <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}

const ValueCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-8 bg-surface/30 border border-border rounded-2xl hover:bg-surface/50 transition-colors">
        <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center text-foreground mb-4 border border-border shadow-sm">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted leading-relaxed">{desc}</p>
    </div>
);