'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { ApexKitRealtimeWSClient } from '@apexkit/sdk';
import { Send, User, Loader2, ArrowLeft, MessageSquareDashed } from 'lucide-react';
import Link from 'next/link';

interface Props {
    parentId: string;
    parentData: any;
    initialComments: any[];
    collectionName: string;
    parentField: string;
    channel: string;
}

interface TypingBubble {
    id: string;
    text: string;
    leftOffset: number; // Random horizontal position for visual variety
}

export function RealtimeChat({ parentId, parentData, initialComments, collectionName, parentField, channel }: Props) {
    const [comments, setComments] = useState(initialComments);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [typingBubbles, setTypingBubbles] = useState<TypingBubble[]>([]);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<ApexKitRealtimeWSClient | null>(null);
    
    // Generate a temporary ID for this client session to filter out our own echo
    const myClientId = useRef(Math.random().toString(36).substring(7));

    // 1. WebSocket Connection
    useEffect(() => {
        const token = apex.getToken();
        
        // Initialize the client
        const wsClient = new ApexKitRealtimeWSClient(apex.baseUrl, token);
        wsRef.current = wsClient;
        
        wsClient.connect();

        setTimeout(() => {
            // Subscribe to DB Inserts
            wsClient.subscribe({
                eventType: 'Insert',
                dataFilter: { [parentField]: parentId }
            });

            // Subscribe to Custom Channel (for typing events)
            wsClient.subscribe({ channel: channel });
        }, 500);

        // Handle Incoming Events
        const unsubscribe = wsClient.onEvent((msg: any) => {
            // A. Handle DB Insert (Real messages)
            if (msg.type === 'Insert') {
                const newRecord = msg.payload.data;
                setComments(prev => {
                    if (prev.find(c => c.id === msg.payload.record_id)) return prev;
                    return [...prev, { 
                        id: msg.payload.record_id, 
                        data: newRecord, 
                        created: new Date().toISOString(),
                        expand: { author_id: { email: 'New Message' } } 
                    }];
                });
            }
            
            // B. Handle Typing Signal
            if (msg.type === 'Custom' && msg.payload.event === 'typing') {
                const { text, senderId } = msg.payload.data;
                
                // Don't show our own typing bubbles
                if (senderId === myClientId.current) return;

                const bubbleId = Math.random().toString(36).substring(7);
                
                // Add bubble to state
                setTypingBubbles(prev => [...prev, { 
                    id: bubbleId, 
                    text: text,
                    leftOffset: Math.floor(Math.random() * 40) // Random variance 0-40px
                }]);

                // Auto-remove after animation completes (2s)
                setTimeout(() => {
                    setTypingBubbles(prev => prev.filter(b => b.id !== bubbleId));
                }, 2000);
            }
        });

        return () => {
            unsubscribe();
            wsClient.disconnect();
        };
    }, [parentId, channel, parentField]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    // Handle Input Change & Typing Signal
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);

        // Fire signal if length > 0 and length % 3 == 0
        if (val.length > 0 && val.length % 3 === 0) {
            wsRef.current?.sendSignal(channel, 'typing', {
                text: val,
                senderId: myClientId.current
            });
        }
    };

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
        <div className="flex flex-col h-[calc(100vh-200px)] relative overflow-hidden">
            {/* CSS Animation for Bubbles */}
            <style jsx>{`
                @keyframes floatUpFade {
                    0% { transform: translateY(0) scale(0.9); opacity: 0; }
                    10% { transform: translateY(-10px) scale(1); opacity: 1; }
                    80% { opacity: 0.8; }
                    100% { transform: translateY(-80px) scale(1); opacity: 0; }
                }
                .animate-float {
                    animation: floatUpFade 2s ease-out forwards;
                }
            `}</style>

            {/* Header */}
            <div className="mb-6 border-b border-border pb-6 flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 custom-scrollbar relative">
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

            {/* Floating Typing Bubbles Container */}
            <div className="absolute bottom-20 left-4 right-4 h-0 pointer-events-none z-10">
                {typingBubbles.map(bubble => (
                    <div 
                        key={bubble.id}
                        className="absolute bottom-0 animate-float bg-primary/90 text-white px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur-sm flex items-center gap-2 max-w-[300px] truncate border border-primary/50"
                        style={{ left: `${bubble.leftOffset}px` }}
                    >
                        <MessageSquareDashed size={12} className="shrink-0" />
                        <span className="truncate">"{bubble.text}"</span>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="relative flex-shrink-0 bg-background pt-2">
                <input 
                    className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted/50"
                    placeholder="Write a comment..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={sending}
                />
                <button 
                    type="submit" 
                    disabled={sending || !input.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
                >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
}