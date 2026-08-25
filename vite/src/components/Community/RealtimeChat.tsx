import React, { useState, useEffect, useRef } from 'react';
import { apex, getFileUrl } from '@/lib/apexkit';
import { ApexKitRealtimeWSClient } from '@apexkit/sdk';
import { Send, User, Loader2, ArrowLeft, MessageSquareDashed } from 'lucide-react';
import { Link } from '@/lib/navigation';

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
    leftOffset: number;
}

export function RealtimeChat({ parentId, parentData, initialComments, collectionName, parentField, channel }: Props) {
    const [comments, setComments] = useState(initialComments);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [typingBubbles, setTypingBubbles] = useState<TypingBubble[]>([]);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<ApexKitRealtimeWSClient | null>(null);
    
    const myClientId = useRef(Math.random().toString(36).substring(7));

    useEffect(() => {
        const token = apex.getToken();
        
        const wsClient = new ApexKitRealtimeWSClient(apex.baseUrl, token);
        wsRef.current = wsClient;
        
        wsClient.connect();

        const timer = setTimeout(() => {
            wsClient.subscribe({
                eventType: 'Insert',
                dataFilter: { [parentField]: Number(parentId) || parentId }
            });

            wsClient.subscribe({ channel: channel });
        }, 500);

        const unsubscribe = wsClient.onEvent((msg: any) => {
            if (msg.type === 'Insert' || msg.event === 'Insert') {
                const newRecord = msg.payload?.data || msg.data;
                const recId = msg.payload?.record_id || msg.record_id || newRecord?.id;
                
                if (newRecord) {
                    setComments(prev => {
                        if (recId && prev.find(c => c.id === recId)) return prev;
                        return [...prev, { 
                            id: recId || Date.now(), 
                            data: newRecord, 
                            created: new Date().toISOString(),
                            expand: { author_id: { data: { username: 'Community Member' } } } 
                        }];
                    });
                }
            }
            
            if ((msg.type === 'Custom' || msg.event === 'Custom') && (msg.payload?.event === 'typing' || msg.event === 'typing')) {
                const eventData = msg.payload?.data || msg.data;
                if (eventData) {
                    const { text, senderId } = eventData;
                    if (senderId === myClientId.current) return;

                    const bubbleId = Math.random().toString(36).substring(7);
                    
                    setTypingBubbles(prev => [...prev, { 
                        id: bubbleId, 
                        text: text,
                        leftOffset: Math.floor(Math.random() * 40)
                    }]);

                    setTimeout(() => {
                        setTypingBubbles(prev => prev.filter(b => b.id !== bubbleId));
                    }, 2000);
                }
            }
        });

        return () => {
            clearTimeout(timer);
            unsubscribe();
            wsClient.disconnect();
        };
    }, [parentId, channel, parentField]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);

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

        if (!apex.getToken()) {
            alert("Please sign in to post comments.");
            return;
        }

        setSending(true);
        try {
            const numId = Number(parentId);
            await apex.collection(collectionName).create({
                [parentField]: !isNaN(numId) ? numId : parentId,
                content: input,
            });
            setInput("");
        } catch (err: any) {
            console.error("Error posting comment:", err);
            alert(err.message || "Failed to post comment. Make sure you are signed in.");
        } finally {
            setSending(false);
        }
    };

    // Extract username from Profile record
    const authorProfile = parentData.expand?.author_id;
    const authorUsername = authorProfile?.data?.username || 'Community Member';
    const title = parentData.data?.title || parentData.data?.topic || 'Discussion Item';

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] relative overflow-hidden">
            <style>{`
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

            <div className="mb-6 border-b border-border pb-6 flex-shrink-0">
                <Link 
                    href={parentData.data?.type === 'issue' ? '/ecosystem?tab=issues' : '/ecosystem?tab=discussions'} 
                    className="text-xs text-muted hover:text-primary flex items-center gap-1 mb-2 font-medium transition-colors"
                >
                    <ArrowLeft size={14} /> Back to list
                </Link>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                <div className="flex items-center gap-2 text-xs text-muted mt-2">
                    <span>Started by <strong className="text-foreground">{authorUsername}</strong></span>
                    <span>•</span>
                    <span>{new Date(parentData.created).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 custom-scrollbar relative">
                {parentData.data?.content && (
                     <div className="bg-surface/50 p-4 rounded-2xl border border-border text-foreground/90 leading-relaxed text-sm whitespace-pre-wrap">
                         {parentData.data.content}
                     </div>
                )}

                {comments.map((comment) => {
                    const author = comment.expand?.author_id;
                    const avatar = author?.data?.avatar ? getFileUrl(author.data.avatar) : null;
                    const name = author?.data?.username || 'Community Member';

                    return (
                        <div key={comment.id} className="flex gap-3 items-start">
                            <div className="shrink-0">
                                {avatar ? (
                                    <img src={avatar} className="w-8 h-8 rounded-full object-cover border border-border" alt="" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 text-xs font-bold">
                                        {name[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col max-w-[80%]">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-bold text-foreground">{name}</span>
                                    <span className="text-[10px] text-muted">{new Date(comment.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="bg-surface border border-border px-4 py-3 rounded-2xl text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {comment.data?.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            <div className="absolute bottom-20 left-4 right-4 h-0 pointer-events-none z-10">
                {typingBubbles.map(bubble => (
                    <div 
                        key={bubble.id}
                        className="absolute bottom-0 animate-float bg-primary/90 text-white px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur-sm flex items-center gap-2 max-w-[300px] truncate border border-primary/50 font-sans"
                        style={{ left: `${bubble.leftOffset}px` }}
                    >
                        <MessageSquareDashed size={12} className="shrink-0" />
                        <span className="truncate">"{bubble.text}"</span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="relative flex-shrink-0 bg-background pt-2">
                <input 
                    className="w-full bg-surface border border-border rounded-2xl pl-4 pr-12 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all placeholder:text-muted/50"
                    placeholder="Write a comment..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={sending}
                />
                <button 
                    type="submit" 
                    disabled={sending || !input.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 mt-1 p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </form>
        </div>
    );
}