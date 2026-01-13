'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { ApexKitRealtimeWSClient } from '@/lib/sdk'; // Import the robust client
import { Send, User, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
    parentId: string;
    parentData: any;
    initialComments: any[];
    collectionName: string;
    parentField: string;
    channel: string;
}

export function RealtimeChat({ parentId, parentData, initialComments, collectionName, parentField, channel }: Props) {
    const [comments, setComments] = useState(initialComments);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<ApexKitRealtimeWSClient | null>(null);

    // 1. WebSocket Connection using SDK Class
    useEffect(() => {
        const token = apex.getToken();
        
        // Initialize the robust client
        const wsClient = new ApexKitRealtimeWSClient(apex.baseUrl, token);
        wsRef.current = wsClient;
        
        wsClient.connect();

        // Subscribe when connected
        // Note: The class handles re-sending this on reconnect automatically if we used a stateful subscription manager,
        // but here we just hook into 'open' via a delay or assume immediate connect for simplicity in this component scope.
        // A better pattern in the SDK class would be an 'onOpen' callback prop or promise.
        // For now, we rely on the class's internal queue or send immediately (which might fail if not ready).
        // Let's use a small timeout to ensure connection, or modify SDK to expose 'onOpen'.
        // Assuming SDK connects fast:
        
        setTimeout(() => {
            // Subscribe to DB Inserts for this thread
            wsClient.subscribe({
                // collectionId: we don't have ID handy, relying on filter
                eventType: 'Insert',
                dataFilter: { [parentField]: parentId }
            });

            // Subscribe to Custom Channel
            wsClient.subscribe({ channel: channel });
        }, 500);

        // Handle Incoming Events
        const unsubscribe = wsClient.onEvent((msg: any) => {
            // Handle DB Insert Event
            if (msg.type === 'Insert') {
                const newRecord = msg.payload.data;
                setComments(prev => {
                    // Deduplicate
                    if (prev.find(c => c.id === msg.payload.record_id)) return prev;
                    
                    return [...prev, { 
                        id: msg.payload.record_id, 
                        data: newRecord, 
                        created: new Date().toISOString(),
                        // Optimistic / Placeholder user until refresh
                        expand: { author_id: { email: 'New Message' } } 
                    }];
                });
            }
            
            // Handle Custom Event
            if (msg.type === 'Custom') {
                // e.g. Typing indicators
                console.log("Custom Event:", msg.payload);
            }
        });

        return () => {
            unsubscribe();
            wsClient.disconnect();
        };
    }, [parentId, channel]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setSending(true);
        try {
            await apex.collection(collectionName).create({
                [parentField]: parentId,
                content: input,
            });
            setInput("");
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="mb-6 border-b border-border pb-6">
                <Link href={`/community/${collectionName.includes('issue') ? 'issues' : 'discussions'}`} className="text-xs text-muted hover:text-primary flex items-center gap-1 mb-2">
                    <ArrowLeft size={12} /> Back to list
                </Link>
                <h1 className="text-2xl font-bold text-foreground">{parentData.data.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted mt-2">
                    <span>Started by {parentData.expand?.author_id?.email?.split('@')[0]}</span>
                    <span>•</span>
                    <span>{new Date(parentData.created).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 custom-scrollbar">
                {parentData.data.description && (
                     <div className="bg-surface/30 p-4 rounded-lg border border-border text-foreground/90 leading-relaxed">
                         {parentData.data.description}
                     </div>
                )}

                {comments.map((comment) => {
                    const author = comment.expand?.author_id;
                    const avatar = author?.metadata?.avatar ? getFileUrl(author.metadata.avatar) : null;

                    return (
                        <div key={comment.id} className="flex gap-4">
                            <div className="shrink-0">
                                {avatar ? (
                                    <img src={avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <User size={14} className="text-muted" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col max-w-[80%]">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-bold text-foreground">{author?.email?.split('@')[0] || 'User'}</span>
                                    <span className="text-[10px] text-muted">{new Date(comment.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="bg-surface border border-border p-3 rounded-xl text-sm text-zinc-300">
                                    {comment.data.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="relative">
                <input 
                    className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted/50"
                    placeholder="Write a comment..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={sending}
                />
                <button 
                    type="submit" 
                    disabled={sending || !input.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
}