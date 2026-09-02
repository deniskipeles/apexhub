import React, { useState } from 'react';
import { 
    Cpu, Database, Shield, Zap, Globe, Code2, ArrowRight, 
    Server, Terminal, Layers, BrainCircuit, Search, 
    Split, RefreshCw, HardDrive, Sparkles, CheckCircle2, 
    Radio, Play, Image as ImageIcon, Box, FileText, Lock, 
    ArrowUpRight, Monitor, Laptop
} from 'lucide-react';
import { Link } from '@/lib/navigation';

export function FeaturesView() {
    const [activeTab, setActiveTab] = useState<'ts' | 'ai' | 'replication'>('ts');

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen space-y-28">

            {/* --- 1. HERO SECTION --- */}
            <div className="text-center max-w-4xl mx-auto pt-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase shadow-sm">
                    <Sparkles size={14} className="text-amber-500" /> ApexKit 0.3.0 Architectural Overview
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                    The Complete <span className="text-primary">Extreme</span> Backend Platform.
                </h1>
                
                <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-3xl mx-auto">
                    ApexKit collapses your entire infrastructure into a single, compiled Rust binary. 
                    Multi-database SQLite, in-memory HNSW vector search, native ONNX & Candle ML, zero-build TypeScript execution, Tantivy full-text search, and real-time distributed replication.
                </p>

                {/* Binary Specs & Performance Pill Bar */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                    <div className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-foreground flex items-center gap-2 shadow-sm">
                        <Monitor size={14} className="text-primary" />
                        <span>Windows Binary: <strong>~50 MB</strong> (Pure Rust Candle)</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-foreground flex items-center gap-2 shadow-sm">
                        <Laptop size={14} className="text-emerald-500" />
                        <span>Linux Binary: <strong>~75 MB</strong> (Candle + ONNX Runtime)</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold flex items-center gap-1.5">
                        <Zap size={14} />
                        <span>Cold Start &lt; 5ms</span>
                    </div>
                </div>
            </div>

            {/* --- 2. THE BENTO GRID OF CORE PLATFORM PILLARS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                
                {/* PILLAR 1: Multi-Database SQLite & JSONB Engine (2-Column Span) */}
                <div className="col-span-1 md:col-span-2 bg-surface/40 border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Database size={220} />
                    </div>
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
                            <Database size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Multi-DB SQLite & Zero-Copy JSONB</h3>
                        <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
                            Instead of a monolithic database file, ApexKit distributes transactions across dedicated physical databases: <code className="text-primary font-mono text-xs">core.db</code>, <code className="text-primary font-mono text-xs">data.db</code>, <code className="text-primary font-mono text-xs">system.db</code>, <code className="text-primary font-mono text-xs">vectors.db</code>, and <code className="text-primary font-mono text-xs">logs.db</code>. All writes run in high-speed WAL mode with write-buffering and direct SQLite JSONB binary serialization.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border/60 pt-6 text-xs">
                        <div className="bg-background/60 p-3 rounded-xl border border-border">
                            <span className="text-muted block text-[10px] uppercase font-bold">Document Storage</span>
                            <span className="font-bold text-foreground">Native JSONB</span>
                        </div>
                        <div className="bg-background/60 p-3 rounded-xl border border-border">
                            <span className="text-muted block text-[10px] uppercase font-bold">Write Throughput</span>
                            <span className="font-bold text-foreground">10,000+ OPS</span>
                        </div>
                        <div className="bg-background/60 p-3 rounded-xl border border-border col-span-2 sm:col-span-1">
                            <span className="text-muted block text-[10px] uppercase font-bold">Graph Relational</span>
                            <span className="font-bold text-foreground">Recursive CTEs</span>
                        </div>
                    </div>
                </div>

                {/* PILLAR 2: Dual Vector Engine (Candle + ONNX) (2-Column Span) */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-surface/60 via-surface/40 to-background border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-6 shadow-inner">
                            <BrainCircuit size={24} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold text-foreground">Dual Vector Engine</h3>
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase border border-purple-500/20">Candle + ONNX</span>
                        </div>
                        <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
                            Run semantic and cross-modal search right on your CPU without external vector DBs. Supports <strong>BERT</strong> (<code className="text-purple-300 font-mono text-xs">BGE-small</code>, <code className="text-purple-300 font-mono text-xs">GTE</code>), <strong>Gemma-300M</strong> (bidirectional masked mean pool), <strong>Qwen3-0.6B</strong> (causal last-token pool), and <strong>SigLIP2</strong> / <strong>CLIP</strong> / <strong>DINOv2</strong> vision encoders paired with in-memory <strong>HNSW</strong> index graphs.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg font-mono">Image-to-Image</span>
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg font-mono">Text-to-Image</span>
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg font-mono">Sliding-Window Text</span>
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg font-mono">In-Memory HNSW</span>
                    </div>
                </div>

                {/* PILLAR 3: Zero-Build TypeScript & QuickJS Runtime */}
                <div className="col-span-1 md:col-span-2 bg-surface/40 border border-border rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-sm">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 shadow-inner">
                            <Code2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Zero-Build TypeScript Runtime</h3>
                        <p className="text-muted text-sm leading-relaxed mb-4">
                            Write native TypeScript (<code className="text-amber-400 font-mono text-xs">.ts</code>, <code className="text-amber-400 font-mono text-xs">.tsx</code>) with zero Node.js toolchains or build steps. Transpiled at runtime via Rust's <strong>Oxc</strong> compiler and executed inside an isolated, secure <strong>QuickJS</strong> sandbox.
                        </p>
                    </div>
                    <div className="bg-background/80 p-3 rounded-xl border border-border font-mono text-xs text-amber-400/90 flex items-center gap-2">
                        <Terminal size={14} className="shrink-0 text-muted" />
                        <span>Native ES Modules + WebAssembly (WASI)</span>
                    </div>
                </div>

                {/* PILLAR 4: Tantivy Full-Text Search Engine (OSE) */}
                <div className="col-span-1 bg-surface/40 border border-border rounded-3xl p-8 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-sm">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mb-6 shadow-inner">
                            <Search size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Embedded Tantivy Search</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            Memory-mapped inverted index with English stemming (<code className="text-cyan-400 font-mono text-xs">en_stem</code>), prefix typeahead, and Levenshtein typo-tolerance. Returns highlighted result snippets in under 10ms.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-border/50 text-[11px] font-bold uppercase text-cyan-400">
                        Zero External Elasticsearch
                    </div>
                </div>

                {/* PILLAR 5: Master-Replica Distributed Replication */}
                <div className="col-span-1 bg-surface/40 border border-border rounded-3xl p-8 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-inner">
                            <Radio size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Distributed Replication</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            Sync read replicas globally with binary SQLite changesets via high-throughput <strong>gRPC</strong> with automatic fallback to <strong>WebSocket streams</strong>. Write-forwarding sends mutations back to Master automatically.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-border/50 text-[11px] font-bold uppercase text-primary">
                        Binary Changeset Sync
                    </div>
                </div>

                {/* PILLAR 6: Physical Multi-Tenancy & Ephemeral Sandboxes (Full Span) */}
                <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-surface/40 border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-primary/30 transition-all">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                            <Layers size={12} /> Isolation Architecture
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Physical Multi-Tenancy & Ephemeral Sandboxes</h3>
                        <p className="text-muted text-sm sm:text-base leading-relaxed">
                            Zero data leakage across customers. Every Tenant and Sandbox receives its own physical folder, SQLite databases, vector indexes, and asset stores. Route requests automatically via subdomains (<code className="text-primary font-mono text-xs">tenant-123.domain.com</code>) or paths (<code className="text-primary font-mono text-xs">/tenant/tenant-123</code>). Spin up ephemeral Sandboxes in 5ms with selective data cloning for AI agents and test environments.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                        <div className="p-4 bg-background rounded-2xl border border-border text-center min-w-[140px]">
                            <span className="text-2xl font-black text-foreground block">5ms</span>
                            <span className="text-[10px] text-muted uppercase font-bold">Sandbox Spin-Up</span>
                        </div>
                        <div className="p-4 bg-background rounded-2xl border border-border text-center min-w-[140px]">
                            <span className="text-2xl font-black text-emerald-500 block">100%</span>
                            <span className="text-[10px] text-muted uppercase font-bold">Physical Isolation</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- 3. INTERACTIVE CODE DEEP DIVE TABS --- */}
            <div className="border border-border bg-surface/30 rounded-3xl p-6 md:p-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                            Built for Modern Workflows
                        </h2>
                        <p className="text-sm text-muted mt-1">
                            Explore how ApexKit powers developer ergonomics, edge AI, and distributed architectures.
                        </p>
                    </div>

                    {/* Tab Selector */}
                    <div className="flex bg-background border border-border p-1 rounded-xl gap-1">
                        <button 
                            type="button"
                            onClick={() => setActiveTab('ts')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'ts' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
                            }`}
                        >
                            TypeScript Webhooks
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('ai')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'ai' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
                            }`}
                        >
                            Cross-Modal AI & Vectors
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('replication')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'replication' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
                            }`}
                        >
                            Distributed Replication
                        </button>
                    </div>
                </div>

                {/* Tab Content Display */}
                {activeTab === 'ts' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-foreground">Zero-Build Serverless Scripts & Webhooks</h3>
                            <p className="text-muted text-sm leading-relaxed">
                                Write clean TypeScript or JavaScript using familiar Web Standards (<code className="text-primary font-mono text-xs">Request</code>, <code className="text-primary font-mono text-xs">Response</code>, <code className="text-primary font-mono text-xs">fetch</code>, <code className="text-primary font-mono text-xs">URL</code>). Deploy instantly via the dashboard or through VS Code live sync with full typings.
                            </p>
                            <ul className="space-y-2 text-xs text-muted">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                                    <span><strong>Global Built-ins:</strong> Access <code className="text-foreground font-mono">$db</code>, <code className="text-foreground font-mono">$files</code>, <code className="text-foreground font-mono">$cache</code>, <code className="text-foreground font-mono">$realtime</code>, <code className="text-foreground font-mono">$mail</code>, <code className="text-foreground font-mono">$util</code>.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                                    <span><strong>Quantum Round-Robin CPU Scheduler:</strong> Non-cooperative scripts are preempted to prevent infinite loops.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                                    <span><strong>42+ Lifecycle Event Hooks:</strong> Intercept DB operations, auth logins, file uploads, and schema migrations.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#0d0d0d] rounded-2xl p-5 border border-white/10 font-mono text-xs text-blue-100 overflow-x-auto shadow-2xl">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px] text-zinc-500">
                                <span>webhooks/process-order.ts</span>
                                <span className="text-amber-400">TypeScript</span>
                            </div>
                            <pre className="leading-relaxed">{`import { Hono } from "https://esm.sh/hono";

const app = new Hono();

interface OrderRequest {
    userId: number;
    amount: number;
    items: string[];
}

app.post("/checkout", async (c) => {
    const body: OrderRequest = await c.req.json();
    
    // 1. Insert into data.db with strict JSONB validation
    const order = await $db.records.create("orders", {
        customer_id: body.userId,
        total: body.amount,
        items: body.items,
        status: "paid"
    });

    // 2. Broadcast real-time WebSocket event
    await $realtime.send("orders", "order_created", { order_id: order.id });

    // 3. Dispatch transactional email
    await $mail.send("customer@acme.com", "Order Confirmed", "Thank you!");

    return c.json({ success: true, order_id: order.id });
});

export default async function (req: Request): Promise<Response> {
    return app.fetch(req);
}`}</pre>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-foreground">Cross-Modal AI & In-Memory HNSW Search</h3>
                            <p className="text-muted text-sm leading-relaxed">
                                Transform text, documents, and images into normalized vector representations. Search text against text, image against image, or text queries directly against images in joint semantic spaces.
                            </p>
                            <ul className="space-y-2 text-xs text-muted">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                                    <span><strong>SigLIP2 Vision Encoder:</strong> Quantized ONNX models running sub-50ms image embeddings.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                                    <span><strong>Qwen3 & Gemma Embedders:</strong> 8,192 token windows with automatic sliding-window chunking.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                                    <span><strong>Streaming LLM Actions:</strong> Built-in prompt runner with Google Gemini, Groq, and OpenAI with SSE token streaming.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#0d0d0d] rounded-2xl p-5 border border-white/10 font-mono text-xs text-purple-200 overflow-x-auto shadow-2xl">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px] text-zinc-500">
                                <span>examples/vector-search.js</span>
                                <span className="text-purple-400">Cross-Modal API</span>
                            </div>
                            <pre className="leading-relaxed">{`// 1. Search products by uploading an image photo
const photoHits = await client.collection('products')
    .searchImageVectorWithImage(base64ImageData, 5);

// 2. Search images using natural language text queries
const textToImageHits = await client.collection('catalog')
    .searchImageVectorWithText("vintage red leather jacket", 10);

// 3. Run semantic semantic document search
const docHits = await client.collection('documentation')
    .searchVectorWithText("how to configure master replication", { per_page: 5 });

console.log(docHits.items); // Sorted by distance ascending`}</pre>
                        </div>
                    </div>
                )}

                {activeTab === 'replication' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-foreground">Active-Active Distributed Replication</h3>
                            <p className="text-muted text-sm leading-relaxed">
                                Deploy lightweight read-replicas near your users while keeping writes centralized on Master. Changes stream instantaneously via binary SQLite changesets.
                            </p>
                            <ul className="space-y-2 text-xs text-muted">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                    <span><strong>Dual Protocol:</strong> High-performance gRPC multiplexed on port 5000 with automatic fallback to WebSocket streams.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                    <span><strong>Transparent Write-Forwarding:</strong> Replicas automatically forward write queries to Master without client-side logic.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                    <span><strong>Zero-Downtime Snapshot Sync:</strong> Replicas auto-download and hydrate missing tenant/system databases on first request.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-[#0d0d0d] rounded-2xl p-5 border border-white/10 font-mono text-xs text-emerald-200 overflow-x-auto shadow-2xl">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px] text-zinc-500">
                                <span>docker-compose.yml</span>
                                <span className="text-emerald-400">Cluster Architecture</span>
                            </div>
                            <pre className="leading-relaxed">{`# Master Node
services:
  apex-master:
    image: apexkit:latest
    environment:
      - PORT=5000
      - APEXKIT_MASTER_KEY=your_32_byte_base64_master_key

  # Global Read-Replica Node (e.g. Edge, US-West, EU)
  apex-replica:
    image: apexkit:latest
    environment:
      - PORT=5001
      - APEXKIT_MASTER_URL=http://apex-master:5000
      - APEXKIT_MASTER_KEY=your_32_byte_base64_master_key`}</pre>
                        </div>
                    </div>
                )}
            </div>

            {/* --- 4. ADDITIONAL BUILT-IN CAPABILITIES --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-6 bg-surface/30 border border-border rounded-2xl hover:bg-surface/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary mb-4 border border-border">
                        <HardDrive size={20} />
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-2">Tus 1.0.0 Resumable Uploads</h4>
                    <p className="text-muted text-xs leading-relaxed">
                        Stream massive multi-gigabyte files via chunked Tus protocol (<code className="text-primary font-mono text-xs">/storage/upload/tus</code>) with instant pause, resume, and S3 / Local storage auto-routing.
                    </p>
                </div>

                <div className="p-6 bg-surface/30 border border-border rounded-2xl hover:bg-surface/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-amber-500 mb-4 border border-border">
                        <ImageIcon size={20} />
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-2">Dynamic OpenGraph & Image Tuning</h4>
                    <p className="text-muted text-xs leading-relaxed">
                        On-the-fly AVIF, WebP, JPEG image conversion, Gaussian blurring, and dynamic SVG-to-PNG social share image rendering via embedded tiny-skia and resvg.
                    </p>
                </div>

                <div className="p-6 bg-surface/30 border border-border rounded-2xl hover:bg-surface/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-emerald-500 mb-4 border border-border">
                        <Shield size={20} />
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-2">AES-256-GCM Vault & RBAC</h4>
                    <p className="text-muted text-xs leading-relaxed">
                        Hardware-encrypted system secrets, Brevo / SMTP integrations, composite fast-fail API keys, and declarative row-level access control (RLS) pushed down directly to SQLite.
                    </p>
                </div>

            </div>

            {/* --- 5. CALL TO ACTION --- */}
            <div className="bg-gradient-to-br from-primary/10 via-surface/80 to-background border border-primary/20 rounded-3xl p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-purple-500"></div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                    Deploy Once. Scale Vertically.
                </h2>
                <p className="text-muted max-w-xl mx-auto mb-8 text-base md:text-lg leading-relaxed">
                    Ready to build high-performance applications with the unified Rust binary? Download the standalone executable or browse the documentation.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        href="/download" 
                        className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Download Binary</span> <ArrowRight size={18} />
                    </Link>
                    <Link 
                        href="/docs" 
                        className="w-full sm:w-auto px-8 py-3.5 bg-surface border border-border text-foreground font-bold rounded-xl hover:bg-surface/80 transition-all flex items-center justify-center gap-2"
                    >
                        Read Documentation
                    </Link>
                </div>
            </div>

        </div>
    );
}