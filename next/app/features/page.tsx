import { 
    Cpu, Database, Shield, Zap, Globe, Code, ArrowRight, 
    Lock, Server, FileJson, Terminal, Layers, BrainCircuit, 
    Search, Workflow, Split 
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Features - ApexHub',
    description: 'The API Extreme and Excellent Kit.',
};

export default function FeaturesPage() {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen space-y-24">

            {/* --- HERO SECTION --- */}
            <div className="text-center max-w-4xl mx-auto pt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
                    <Cpu size={12} /> The "Extreme" Architecture
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                    The <span className="text-primary">All-in-One</span> API Kit.
                </h1>
                <p className="text-xl text-muted leading-relaxed max-w-2xl mx-auto">
                    ApexKit collapses the modern backend stack into a single, high-performance binary. Database, Vector Search, AI Runtime, and Edge Logic—unified in Rust.
                </p>
            </div>

            {/* --- CORE PILLARS (BENTO GRID) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. The Core Engine */}
                <div className="col-span-1 md:col-span-2 bg-surface/50 border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-primary/40 transition-colors">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Server size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Hyper-Optimized Rust Runtime</h3>
                        <p className="text-muted mb-6 max-w-lg leading-relaxed">
                            Built on Axum and Tokio. ApexKit isn't just a wrapper; it's a compiled binary that handles high-concurrency workloads with minimal memory footprint. No garbage collection pauses, just raw speed.
                        </p>
                        <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-6">
                            <StatItem label="Cold Start" value="<5ms" />
                            <StatItem label="Throughput" value="10k+ RPS" />
                            <StatItem label="Binary Size" value="~30MB" />
                        </div>
                    </div>
                </div>

                {/* 2. Database Strategy */}
                <div className="col-span-1 bg-surface/50 border border-border rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Hybrid Relational-Document Store</h3>
                        <p className="text-muted text-sm leading-relaxed">
                            Powered by <strong>LibSQL</strong> in WAL mode. ApexKit combines the structure of SQL with the flexibility of JSON document storage, linked by a graph-based <code>_relations</code> table.
                        </p>
                    </div>
                    <div className="mt-8">
                        <div className="flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-500/5 px-3 py-2 rounded-lg border border-blue-500/10">
                            <Split size={14} />
                            <span>Recursive CTE Expansion</span>
                        </div>
                    </div>
                </div>

                {/* 3. Multi-Tenancy */}
                <div className="col-span-1 bg-surface/50 border border-border rounded-3xl p-8 hover:border-orange-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 border border-orange-500/20">
                        <Layers size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Native Multi-Tenancy</h3>
                    <p className="text-muted text-sm leading-relaxed mb-4">
                        Physical isolation per customer. ApexKit manages separate SQLite files and storage folders for every tenant, routed automatically via subdomains.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
                        <Shield size={12} />
                        <span>Zero-Leakage Architecture</span>
                    </div>
                </div>

                {/* 4. Embedded AI */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-surface to-background border border-border rounded-3xl p-8 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 border border-purple-500/20">
                                <BrainCircuit size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-3">Embedded Vector Engine</h3>
                            <p className="text-muted mb-6">
                                ApexKit integrates <strong>Candle</strong> (Rust ML framework) to run BERT/Jina embeddings directly on the CPU, coupled with an in-memory <strong>HNSW Index</strong> for millisecond-fast semantic search. No Pinecone required.
                            </p>
                            <Link href="/docs" className="text-primary font-medium flex items-center gap-2 hover:underline group text-sm">
                                Explore Vector APIs <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="w-full md:w-1/2 bg-[#0d0d0d] rounded-xl border border-border p-4 shadow-2xl">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                                <Terminal size={12} className="text-muted" />
                                <span className="text-[10px] text-muted font-mono">search_vector.rs</span>
                            </div>
                            <pre className="font-mono text-[10px] text-purple-300 overflow-x-auto leading-relaxed">
{`// Generate embedding locally
let vec = candle.embed(query);

// HNSW Approximate Nearest Neighbor
let hits = index.search(vec, 10);

// Hydrate results from DB
return db.get_records(hits);`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DEEP DIVE SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                        Logic at the Edge via <span className="text-yellow-500">Boa</span>
                    </h2>
                    <p className="text-lg text-muted leading-relaxed">
                        Extend the backend without recompiling. ApexKit embeds the Boa JavaScript engine to run server-side logic in a secure sandbox.
                    </p>
                    
                    <div className="space-y-4">
                        <FeatureRow 
                            title="Event Hooks" 
                            desc="Intercept DB operations (before_create, after_update) to enforce validation or trigger side-effects."
                        />
                        <FeatureRow 
                            title="Cron Jobs" 
                            desc="Built-in scheduler allows you to run maintenance scripts on a defined interval per tenant."
                        />
                        <FeatureRow 
                            title="Custom Endpoints" 
                            desc="Define manual routes accessible via /api/v1/run/{script_name}."
                        />
                    </div>
                </div>

                {/* Code Block Visual */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="bg-[#1e1e1e] border border-border rounded-2xl p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-muted font-mono">scripts/validate_order.js</span>
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">Active</span>
                        </div>
                        <pre className="font-mono text-xs sm:text-sm text-gray-300 overflow-x-auto leading-relaxed">
{`export default async function(e) {
  const { amount, user_id } = e.data;

  // 1. Database Lookup
  const user = await $db.find_one('users', user_id);

  // 2. Business Logic
  if (amount > 1000 && !user.is_verified) {
      throw new Error("Verification required.");
  }

  // 3. Side Effect
  if (amount > 5000) {
      await $http.post(process.env.SLACK_HOOK, {
          text: "Big whale alert!"
      });
  }

  return e.data;
}`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* --- SEARCH & DISCOVERY --- */}
            <div className="bg-surface/30 border border-border rounded-3xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold tracking-wide uppercase">
                            <Search size={12} /> Instant Search
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">Dual-Engine Discovery</h2>
                        <p className="text-muted leading-relaxed">
                            ApexKit combines <strong>Tantivy</strong> for lightning-fast full-text search (typo tolerance, faceting) with a <strong>Vector Store</strong> for semantic understanding.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-muted">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span><strong>Instant Search:</strong> Memory-mapped inverted indexes for &lt; 10ms response times.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-muted">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                <span><strong>Semantic Search:</strong> "Find shoes for running" returns results even if the word "running" isn't present.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-muted">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span><strong>Real-time Indexing:</strong> Data is searchable milliseconds after insertion via WAL hooks.</span>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Visual representation of Search */}
                    <div className="w-full md:w-1/2 flex flex-col gap-4">
                        <div className="bg-background border border-border rounded-xl p-4 shadow-lg flex items-center gap-4">
                            <Search className="text-muted" />
                            <div className="h-4 w-32 bg-secondary rounded animate-pulse"></div>
                            <div className="h-4 w-12 bg-secondary rounded ml-auto"></div>
                        </div>
                        <div className="pl-8 space-y-2">
                             <div className="bg-background/80 border border-border/50 rounded-lg p-3 text-xs font-mono text-blue-400">
                                &gt; Match: "Nike Air Zoom" (Score: 4.8)
                             </div>
                             <div className="bg-background/80 border border-border/50 rounded-lg p-3 text-xs font-mono text-purple-400">
                                &gt; Semantic: "Marathon Gear" (Distance: 0.12)
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CTA --- */}
            <div className="text-center py-12 border-t border-border">
                <h2 className="text-3xl font-bold text-foreground mb-4">Ready to go extreme?</h2>
                <p className="text-muted mb-8 max-w-xl mx-auto">
                    Download the binary, drop it on your server, and start building. No external dependencies required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/download" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                        <ArrowRight size={20} /> Download for Linux
                    </Link>
                    <Link href="/docs" className="px-8 py-3 bg-surface border border-border text-foreground font-bold rounded-xl hover:bg-surface/80 transition-colors">
                        Read Documentation
                    </Link>
                </div>
            </div>

        </div>
    );
}

// --- Helper Components ---

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider font-semibold">{label}</div>
        </div>
    );
}

function FeatureRow({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            <div>
                <h4 className="text-lg font-bold text-foreground leading-none mb-1">{title}</h4>
                <p className="text-sm text-muted">{desc}</p>
            </div>
        </div>
    );
}