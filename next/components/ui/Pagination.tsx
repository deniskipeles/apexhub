import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    totalPages: number;
    currentPage: number;
    basePath: string; // e.g. "/ecosystem?tab=community"
}

export function Pagination({ totalPages, currentPage, basePath }: Props) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center gap-2">
            <Link 
                href={currentPage > 1 ? `${basePath}&page=${currentPage - 1}` : '#'}
                className={`p-2 rounded-lg border border-border transition-colors ${currentPage > 1 ? 'hover:bg-surface text-foreground' : 'opacity-50 cursor-not-allowed text-muted pointer-events-none'}`}
                aria-disabled={currentPage <= 1}
            >
                <ChevronLeft size={16} />
            </Link>
            
            <span className="text-sm font-medium text-muted px-2">
                Page <span className="text-foreground font-bold">{currentPage}</span> of {totalPages}
            </span>

            <Link 
                href={currentPage < totalPages ? `${basePath}&page=${currentPage + 1}` : '#'}
                className={`p-2 rounded-lg border border-border transition-colors ${currentPage < totalPages ? 'hover:bg-surface text-foreground' : 'opacity-50 cursor-not-allowed text-muted pointer-events-none'}`}
                aria-disabled={currentPage >= totalPages}
            >
                <ChevronRight size={16} />
            </Link>
        </div>
    );
}