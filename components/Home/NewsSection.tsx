import Link from 'next/link';

interface NewsItem {
    id: string;
    data: {
        headline: string;
        body: string;
        date: string;
    };
}

export function NewsSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;

  return (
    <div className="border-t border-border pt-12">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Latest Updates</h2>
            <Link href="/roadmap" className="text-primary hover:text-primary-hover text-sm font-medium">
                View Roadmap
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item) => (
                <Link key={item.id} href="/changelog" className="flex gap-6 p-6 rounded-xl bg-surface/30 border border-border/50 hover:bg-surface/50 transition-colors group">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                             <div className="text-xs text-primary font-mono bg-primary/5 px-2 py-1 rounded border border-primary/10">
                                {new Date(item.data.date).toLocaleDateString()}
                             </div>
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {item.data.headline}
                        </h4>
                        <p className="text-sm text-muted line-clamp-2">
                            {item.data.body}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
}