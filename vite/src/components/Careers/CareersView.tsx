import React, { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, Clock, ArrowRight, Globe,
    Coffee, Code, Plus, X, Loader2, Building, DollarSign, Search
} from 'lucide-react';
import { apex } from '@/lib/apexkit';
import { Link, useRouter, useSearchParams, usePathname } from '@/lib/navigation';
import { Pagination } from '../ui/Pagination';

export function CareersView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentTab = searchParams.get('tab') || 'official';
    const currentQuery = searchParams.get('q') || '';
    const currentPage = Number(searchParams.get('page')) || 1;

    const [search, setSearch] = useState(currentQuery);
    const [jobs, setJobs] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const [isPostOpen, setIsPostOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', company: '', location: 'Remote', type: 'Full-time', salary: '', description: '', apply_url: ''
    });

    useEffect(() => {
        setLoading(true);
        const collection = currentTab === 'official' ? 'careers' : 'jobs';
        const perPage = 10;

        apex.collection(collection).list({
            sort: '-created',
            page: currentPage,
            per_page: perPage,
            expand: 'author_id'
        })
        .then((res: any) => {
            let items = res.items || [];
            if (currentQuery) {
                items = items.filter((j: any) => 
                    j.data?.title?.toLowerCase().includes(currentQuery.toLowerCase()) ||
                    j.data?.company?.toLowerCase().includes(currentQuery.toLowerCase()) ||
                    j.data?.description?.toLowerCase().includes(currentQuery.toLowerCase())
                );
            }
            setJobs(items);
            setTotalItems(res.total || items.length);
            setTotalPages(Math.ceil((res.total || items.length) / perPage));
        })
        .catch(() => {
            setJobs([]);
            setTotalItems(0);
            setTotalPages(0);
        })
        .finally(() => setLoading(false));
    }, [currentTab, currentQuery, currentPage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`${pathname}?tab=${currentTab}&q=${encodeURIComponent(search)}&page=1`);
    };

    const handleTabChange = (tab: string) => {
        setSearch('');
        router.push(`${pathname}?tab=${tab}&page=1`);
    };

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apex.collection('jobs').create(form);
            setIsPostOpen(false);
            setForm({ title: '', company: '', location: 'Remote', type: 'Full-time', salary: '', description: '', apply_url: '' });
            alert("Job posted successfully!");
            router.refresh();
        } catch (err: any) {
            alert(err.message || "Failed to post job. Please log in.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* HEADER */}
            <div className="text-center mb-12 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold tracking-wide uppercase mb-6">
                    Work with us
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                    Build the <span className="text-primary">future</span> of the web.
                </h1>
                <p className="text-xl text-muted leading-relaxed">
                    Join the core team or find opportunities in the ecosystem.
                </p>
            </div>

            {/* CONTROLS (TABS + SEARCH) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">

                <div className="bg-surface/50 p-1 rounded-xl border border-border inline-flex">
                    <button
                        type="button"
                        onClick={() => handleTabChange('official')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${currentTab === 'official' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'}`}
                    >
                        Official Careers
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('community')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${currentTab === 'community' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'}`}
                    >
                        Community Jobs
                    </button>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={currentTab === 'official' ? "Search roles..." : "Search community jobs..."}
                            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </form>

                    {currentTab === 'community' && (
                        <button
                            type="button"
                            onClick={() => setIsPostOpen(true)}
                            className="px-4 py-2.5 bg-surface hover:bg-surface/80 border border-border text-foreground font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                            <Plus size={16} /> Post Job
                        </button>
                    )}
                </div>
            </div>

            {currentTab === 'official' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <BenefitCard icon={<Globe size={24} />} title="100% Remote" desc="Work from anywhere. We care about output, not time zones." />
                    <BenefitCard icon={<Code size={24} />} title="Open Source" desc="Most of your work will be public. Build your personal brand." />
                    <BenefitCard icon={<Coffee size={24} />} title="Flexible Hours" desc="We operate asynchronously. Manage your own schedule." />
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-4 min-h-[400px]">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-lg font-bold text-foreground">
                        {totalItems} Openings {currentQuery && `for "${currentQuery}"`}
                    </h3>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted" /></div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 text-muted border-2 border-dashed border-border rounded-xl bg-surface/20">
                        <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No jobs found matching your criteria.</p>
                        {currentQuery && (
                            <button type="button" onClick={() => { setSearch(''); router.push(`${pathname}?tab=${currentTab}&page=1`); }} className="text-primary hover:underline text-sm mt-2">
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    jobs.map((job) => (
                        <JobCard key={job.id} job={job} isOfficial={currentTab === 'official'} />
                    ))
                )}
            </div>

            <div className="flex justify-center pt-8 border-t border-border mt-8">
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    basePath={`${pathname}?tab=${currentTab}${currentQuery ? `&q=${currentQuery}` : ''}`}
                />
            </div>

            {isPostOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button type="button" onClick={() => setIsPostOpen(false)} className="absolute top-4 right-4 text-muted hover:text-foreground"><X size={20} /></button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Post a Job</h2>
                            <p className="text-muted text-sm">Find talent in the ApexKit community.</p>
                        </div>

                        <form onSubmit={handlePostJob} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted tracking-wider">Job Title</label>
                                <input required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Rust Engineer" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted tracking-wider">Company</label>
                                    <input required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted tracking-wider">Location</label>
                                    <input required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / City" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted tracking-wider">Type</label>
                                    <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option>Full-time</option>
                                        <option>Contract</option>
                                        <option>Freelance</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted tracking-wider">Salary Range</label>
                                    <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="$100k - $140k" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted tracking-wider">Apply URL / Email</label>
                                <input required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" value={form.apply_url} onChange={e => setForm({ ...form, apply_url: e.target.value })} placeholder="https://... or mailto:..." />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted tracking-wider">Description</label>
                                <textarea required rows={4} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Role details..." />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Post Job'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function JobCard({ job, isOfficial = false }: { job: any; isOfficial?: boolean; key?: React.Key }) {
    const company = isOfficial ? "ApexHub" : job.data?.company;
    const applyLink = job.data?.apply_url || (isOfficial ? `/careers/${job.id}` : '#');

    return (
        <div className="bg-surface/40 border border-border rounded-xl p-6 hover:border-primary/40 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface/60">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.data?.title}</h3>
                    {isOfficial && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">OFFICIAL</span>}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted mb-4">
                    <span className="flex items-center gap-1 font-medium text-foreground"><Building size={14} className="text-muted" /> {company}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.data?.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {job.data?.type}</span>
                    {job.data?.salary && <span className="flex items-center gap-1"><DollarSign size={14} /> {job.data.salary}</span>}
                </div>

                <p className="text-sm text-muted leading-relaxed max-w-2xl line-clamp-2">
                    {job.data?.description}
                </p>
            </div>

            <Link
                href={applyLink}
                target={isOfficial ? "_self" : "_blank"}
                className={`px-6 py-3 font-bold rounded-lg whitespace-nowrap flex items-center justify-center gap-2 transition-colors ${isOfficial ? 'bg-foreground text-background hover:bg-foreground/90' : 'bg-surface border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30'}`}
            >
                Apply Now <ArrowRight size={16} />
            </Link>
        </div>
    );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:bg-surface/50 transition-colors">
            <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-foreground mb-4 border border-border shadow-sm">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
