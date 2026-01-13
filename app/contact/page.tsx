'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                    <CheckCircle className="text-green-500" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Message Sent!</h2>
                <p className="text-muted max-w-md mb-8">
                    Thanks for reaching out. We'll get back to you as soon as possible.
                </p>
                <button 
                    onClick={() => setSent(false)}
                    className="px-6 py-3 bg-surface border border-border text-foreground font-medium rounded-lg hover:border-primary/50 transition-colors"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
                    Contact Us
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Get in touch
                </h1>
                <p className="text-xl text-muted leading-relaxed">
                    Have a question about enterprise plans, partnerships, or just want to say hi? We're all ears.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Contact Form */}
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Name</label>
                                <input type="text" required className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">Email</label>
                                <input type="email" required className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Subject</label>
                            <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none">
                                <option>General Inquiry</option>
                                <option>Enterprise Support</option>
                                <option>Partnership</option>
                                <option>Bug Report</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Message</label>
                            <textarea required rows={5} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none" placeholder="How can we help you?"></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Info Cards */}
                <div className="space-y-6">
                    <div className="p-8 bg-surface/30 border border-border rounded-2xl hover:bg-surface/50 transition-colors">
                        <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-foreground mb-4 border border-border shadow-sm">
                            <Mail size={24} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Email Us</h3>
                        <p className="text-muted mb-4">For general inquiries and support.</p>
                        <a href="mailto:hello@apexkit.io" className="text-primary font-medium hover:underline">hello@apexkit.io</a>
                    </div>

                    <div className="p-8 bg-surface/30 border border-border rounded-2xl hover:bg-surface/50 transition-colors">
                        <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center text-foreground mb-4 border border-border shadow-sm">
                            <MessageSquare size={24} className="text-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Community Support</h3>
                        <p className="text-muted mb-4">Join our Discord for real-time help from the community.</p>
                        <a href="#" className="text-primary font-medium hover:underline">Join Discord Server</a>
                    </div>
                </div>
            </div>
        </div>
    );
}