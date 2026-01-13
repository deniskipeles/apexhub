import { 
    Cpu, Database, Shield, Zap, Globe, Code, ArrowRight, Lock, Server, FileJson, Terminal 
  } from 'lucide-react';
  import Link from 'next/link';
  
  export const metadata = {
    title: 'Features - ApexHub',
    description: 'The vertical-scale backend architecture.',
  };
  
  export default function FeaturesPage() {
    return (
      <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            The <span className="text-primary">Vertical Scale</span> Architecture
          </h1>
          <p className="text-xl text-muted leading-relaxed">
            ApexKit collapses the traditional multi-tier backend stack into a single, high-performance binary. No Docker, no Kubernetes, just raw Rust speed.
          </p>
        </div>
  
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          
          {/* Card 1: Core Engine (Large) */}
          <div className="col-span-1 md:col-span-2 bg-surface border border-border rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <Cpu size={120} />
              </div>
              <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <Zap size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Hyper-Optimized Rust Runtime</h3>
                  <p className="text-muted mb-6 max-w-lg">
                      Built on Tokio and Hyper, the ApexKit runtime processes requests with sub-millisecond latency. By embedding the database directly into the application memory space, we eliminate network round-trips entirely.
                  </p>
                  <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                      <StatItem label="Cold Start" value="<1ms" />
                      <StatItem label="Req/Sec" value="10k+" />
                      <StatItem label="RAM Usage" value="15MB" />
                  </div>
              </div>
          </div>
  
          {/* Card 2: Database */}
          <div className="col-span-1 bg-surface border border-border rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
              <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                      <Database size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">SQLite with WAL</h3>
                  <p className="text-muted text-sm">
                      Running in Write-Ahead Logging mode by default. Supports concurrent reads and high-throughput writes without locking the world.
                  </p>
              </div>
              <div className="mt-8 bg-background rounded-xl p-4 border border-border font-mono text-xs text-muted">
                  db.enable_wal();<br/>
                  db.set_synchronous(NORMAL);<br/>
                  <span className="text-green-500">// Zero-latency queries</span>
              </div>
          </div>
  
          {/* Card 3: Security */}
          <div className="col-span-1 bg-surface border border-border rounded-3xl p-8 hover:border-green-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                  <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Schema-based RLS</h3>
              <p className="text-muted text-sm mb-4">
                  Row-Level Security is baked into the schema definition. You don't write SQL rules; you define access policies in your struct macros.
              </p>
              <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
                  <Lock size={12} />
                  <span>Compile-time verification</span>
              </div>
          </div>
  
          {/* Card 4: Edge Ready (Large) */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-surface to-background border border-border rounded-3xl p-8 relative overflow-hidden">
               <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                  <div className="flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6">
                          <Globe size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Deploy Anywhere</h3>
                      <p className="text-muted mb-6">
                          Since ApexKit compiles to a single binary with zero dependencies, you can deploy it to a $5 VPS, a Raspberry Pi, or huge bare-metal servers. 
                      </p>
                      <Link href="/docs" className="text-primary font-medium flex items-center gap-2 hover:underline group">
                          View Deployment Guides <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                  </div>
                  <div className="w-full md:w-1/2 bg-zinc-950 rounded-lg border border-border p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-2">
                          <Terminal size={12} className="text-muted" />
                          <span className="text-[10px] text-muted">terminal</span>
                      </div>
                      <pre className="font-mono text-[10px] text-zinc-300 overflow-x-auto">
  {`$ scp ./apexkit user@vps:/bin/
  $ ssh user@vps
  $ ./apexkit serve
  > Listening on 0.0.0.0:8080
  > Database connected (WAL)
  > Vector extension loaded`}
                      </pre>
                  </div>
               </div>
          </div>
        </div>
  
        {/* Developer Experience Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
           <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Type-Safe from DB to UI</h2>
              <div className="space-y-6">
                  <StepItem 
                      icon={<FileJson size={20} className="text-purple-500" />}
                      title="1. Define Schema"
                      desc="Define your collections using simple Rust structs or JSON."
                  />
                  <div className="w-0.5 h-8 bg-border ml-6"></div>
                  <StepItem 
                      icon={<Server size={20} className="text-blue-500" />}
                      title="2. Server Auto-Gen"
                      desc="ApexKit generates the SQL migrations and API endpoints automatically."
                  />
                   <div className="w-0.5 h-8 bg-border ml-6"></div>
                   <StepItem 
                      icon={<Code size={20} className="text-green-500" />}
                      title="3. Generate SDK"
                      desc="Run `apex gen sdk` to get fully typed TypeScript clients for your frontend."
                  />
              </div>
           </div>
           <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted font-mono">src/lib/api.ts</span>
                  <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20">Generated</span>
              </div>
              <pre className="font-mono text-sm overflow-x-auto text-zinc-300 bg-background/50 p-4 rounded-lg border border-border/50">
  {`// Auto-generated Types
  export interface User {
    id: string;
    email: string;
    role: 'admin' | 'user';
    created: string;
  }
  
  // Strictly Typed Client
  const user = await client
    .collection('users')
    .get<User>('user_123');
  
  // TypeScript Error if field doesn't exist!
  console.log(user.phonenumber); 
  //           ~~~~~~~~~~~ Error`}
              </pre>
           </div>
        </div>
  
        <div className="text-center py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to perform?</h2>
            <Link href="/ecosystem" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                Start Building Now
            </Link>
        </div>
  
      </div>
    );
  }
  
  // --- Helper Components ---
  
  function StatItem({ label, value }: { label: string, value: string }) {
      return (
          <div>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
          </div>
      );
  }
  
  function StepItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
      return (
          <div className="flex gap-4">
              <div className="mt-1 bg-surface p-2 rounded-lg border border-border h-fit shadow-sm">
                  {icon}
              </div>
              <div>
                  <h4 className="text-lg font-bold text-foreground">{title}</h4>
                  <p className="text-muted text-sm">{desc}</p>
              </div>
          </div>
      );
  }