'use client';

import React from 'react';
import { Briefcase, MapPin, Clock, ArrowRight, Code, Globe, Coffee, Smile } from 'lucide-react';

const JOBS = [
    {
        id: 'j1',
        title: 'Senior Rust Engineer (Core)',
        type: 'Full-time',
        location: 'Remote (Global)',
        department: 'Engineering',
        salary: '$140k - $180k',
        description: 'Help us optimize the query engine and implement distributed consensus for LiteFS integration.'
    },
    {
        id: 'j2',
        title: 'Developer Advocate',
        type: 'Full-time',
        location: 'Remote (US/EU)',
        department: 'Marketing',
        salary: '$100k - $140k',
        description: 'Create tutorials, speak at conferences, and help the community build amazing things with ApexKit.'
    }
];

export default function CareersPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold tracking-wide uppercase mb-6">
                    We are hiring
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                    Work on the tools that <br/><span className="text-primary">build the web</span>.
                </h1>
                <p className="text-xl text-muted leading-relaxed">
                    Join a team of obsessive engineers and designers building the vertical-scale future. 
                    Remote-first, open-source hearted, and performance obsessed.
                </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                <BenefitCard icon={<Globe size={24} />} title="100% Remote" desc="Work from anywhere. We care about output, not time zones." />
                <BenefitCard icon={<Code size={24} />} title="Open Source" desc="Most of your work will be public. Build your personal brand." />
                <BenefitCard icon={<Coffee size={24} />} title="Flexible Hours" desc="We operate asynchronously. Manage your own schedule." />
            </div>

            {/* Open Positions */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                    <Briefcase className="text-primary" /> Open Positions
                </h2>
                <div className="space-y-4">
                    {JOBS.map((job) => (
                        <div key={job.id} className="bg-surface border border-border rounded-xl p-6 md:p-8 hover:border-primary/40 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-background border border-border text-muted">
                                        {job.department}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted mb-4">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                                    <span className="flex items-center gap-1"><Smile size={14} /> {job.salary}</span>
                                </div>
                                <p className="text-muted text-sm leading-relaxed max-w-2xl">
                                    {job.description}
                                </p>
                            </div>
                            <button className="px-6 py-3 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                                Apply Now <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const BenefitCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:bg-surface/50 transition-colors">
        <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-foreground mb-4 border border-border shadow-sm">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{desc}</p>
    </div>
); 