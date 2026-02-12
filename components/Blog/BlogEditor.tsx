'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apex, getFileUrl } from '@/lib/apexkit';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

interface Props {
    initialData?: any;
}

export function BlogEditor({ initialData }: Props) {
    const router = useRouter();
    const isEdit = !!initialData;
    
    // Form State
    const [headline, setHeadline] = useState(initialData?.data.headline || "");
    const [subheadline, setSubheadline] = useState(initialData?.data.subheadline || "");
    const [body, setBody] = useState(initialData?.data.body || "");
    const [readTime, setReadTime] = useState(initialData?.data.read_time || "");
    const [tagsInput, setTagsInput] = useState(initialData?.data.tags ? initialData.data.tags.join(', ') : "");
    
    // File State
    const [coverImage, setCoverImage] = useState<string | null>(initialData?.data.cover_image || null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Handle File Upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploaded = await apex.files.upload(file);
            setCoverImage(uploaded.filename);
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            // Parse tags
            const tags = tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean);

            const payload = {
                headline,
                subheadline,
                body,
                read_time: readTime,
                tags,
                cover_image: coverImage,
                // author_id is handled by backend auth context (if type: owner)
            };

            if (isEdit) {
                await apex.collection('blog').update(initialData.id, payload);
            } else {
                await apex.collection('blog').create(payload);
            }
            
            router.push('/blog');
            router.refresh();

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save post");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
             <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/blog" className="text-sm text-muted hover:text-primary flex items-center gap-1 mb-2 transition-colors">
                        <ArrowLeft size={14} /> Cancel
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">{isEdit ? 'Edit Post' : 'New Blog Post'}</h1>
                </div>
                <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {isEdit ? 'Update' : 'Publish'}</>}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form className="space-y-8">
                {/* Meta Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Headline</label>
                            <input 
                                type="text" 
                                required
                                value={headline}
                                onChange={e => setHeadline(e.target.value)}
                                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-lg font-bold text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted/50"
                                placeholder="Enter a catchy title..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Subheadline</label>
                            <input 
                                type="text" 
                                value={subheadline}
                                onChange={e => setSubheadline(e.target.value)}
                                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Brief summary..."
                            />
                        </div>
                    </div>
                    
                    {/* Cover Image */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Cover Image</label>
                        <div className={`relative aspect-video w-full rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-surface/30 overflow-hidden group ${isUploading ? 'opacity-50' : 'hover:border-primary/50'}`}>
                            {coverImage ? (
                                <>
                                    <img src={getFileUrl(coverImage)} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                         <label className="cursor-pointer p-2 bg-white/10 rounded hover:bg-white/20 text-white">
                                            Change <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                         </label>
                                         <button type="button" onClick={() => setCoverImage(null)} className="p-2 bg-red-500/80 rounded hover:bg-red-500 text-white"><X size={16} /></button>
                                    </div>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2 text-muted hover:text-foreground transition-colors w-full h-full justify-center">
                                    {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={24} />}
                                    <span className="text-xs">Upload Image</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Body Content (Markdown)</label>
                    <div className="relative">
                        <textarea 
                            required
                            rows={20}
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            className="w-full bg-surface/50 border border-border rounded-lg px-6 py-4 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm resize-y leading-relaxed placeholder:text-muted/30"
                            placeholder="# Write your story here..."
                        />
                        <div className="absolute top-2 right-2 text-[10px] text-muted bg-background/50 px-2 py-1 rounded border border-border">Markdown Supported</div>
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface/30 border border-border rounded-xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tags</label>
                        <input 
                            type="text" 
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-1 focus:ring-primary outline-none text-sm"
                            placeholder="tech, rust, tutorial (comma separated)"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Read Time</label>
                        <input 
                            type="text" 
                            value={readTime}
                            onChange={e => setReadTime(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-1 focus:ring-primary outline-none text-sm"
                            placeholder="e.g. 5 min read"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}