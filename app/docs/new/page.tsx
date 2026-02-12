'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apex } from '@/lib/apexkit';
import { Loader2, Plus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NewDocPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fetch Categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Fetch collection schema to get options
                // Note: Assuming public access to schema or logged in user
                const docCol = await apex.admins.getCollection('docs');
                
                let options: string[] = [];
                if (docCol?.schema?.fields?.['category']?.options) {
                    options = docCol.schema.fields['category'].options;
                } else if (Array.isArray(docCol?.schema)) {
                    // Legacy check
                    const f = docCol.schema.find((f: any) => f.name === 'category');
                    if (f?.options) options = f.options;
                }
                
                setCategories(options);
                if (options.length > 0) setCategory(options[0]);
            } catch (e) {
                console.error("Failed to load categories", e);
            }
        };
        loadCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !category) return;

        setIsSubmitting(true);
        setError("");

        try {
            const res = await apex.collection('docs').create({
                title,
                content,
                category,
            });
            
            // Redirect to the new doc page
            router.push(`/docs/${res.id}`);
            router.refresh(); 

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create guide. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto">
            
            <div className="mb-8">
                <Link href="/docs" className="text-sm text-muted hover:text-primary flex items-center gap-1 mb-4 w-fit transition-colors">
                    <ArrowLeft size={14} /> Back to Docs
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Contribute a Guide</h1>
                <p className="text-muted mt-1">Share your knowledge with the community.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-surface/30 border border-border p-6 md:p-8 rounded-2xl shadow-sm">
                
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Guide Title</label>
                        <input 
                            type="text" 
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Deploying on Vercel"
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted/50"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Category</label>
                        <div className="relative">
                            <select 
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                            >
                                {categories.length > 0 ? (
                                    categories.map(c => (
                                        <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
                                    ))
                                ) : (
                                    <option value="general">General</option>
                                )}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Content (Markdown)</label>
                    <textarea 
                        required
                        rows={15}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="# Introduction&#10;&#10;Explain the topic here..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none font-mono text-sm resize-y placeholder:text-muted/50 leading-relaxed"
                    />
                    <p className="text-xs text-muted text-right">Supports GitHub Flavored Markdown</p>
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <Link href="/docs" className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-surface font-medium transition-colors">
                        Cancel
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Publish Guide</>}
                    </button>
                </div>

            </form>
        </div>
    );
}