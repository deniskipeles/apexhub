import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';

interface HeroData {
    headline?: string;
    subheadline?: string;
    version?: string;
}

export function HeroSection({ data }: { data: HeroData | null }) {
  // Fallback defaults
  const headline = data?.headline || "The Single-Node Speed King";
  const subheadline = data?.subheadline || "Build vertical-scale apps with Rust, SQLite, and In-Memory Vector Search.";
  const version = data?.version || "v0.1.0";

  return (
    <div className="text-center space-y-8 max-w-4xl mx-auto py-12 relative">
        {/* Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 opacity-60 pointer-events-none"></div>
        
        <Link href="/roadmap" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase hover:bg-primary/20 transition-colors">
          <span>{version} Release</span>
          <ArrowRight size={12} />
        </Link>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
          {headline}
        </h1>
        
        <p className="text-xl text-muted leading-relaxed max-w-2xl mx-auto">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
                href="/download"
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-3 transform hover:scale-105"
            >
                <Download size={20} /> Download for Linux
            </Link>
            <Link 
                href="/ecosystem"
                className="px-8 py-4 bg-surface hover:bg-surface/80 text-foreground border border-border rounded-xl font-medium transition-all flex items-center gap-2"
            >
                Explore Ecosystem <ArrowRight size={18} />
            </Link>
        </div>
    </div>
  );
}