import { 
    Book, Code, FileText, Layers, Cpu, Database, 
    Shield, Zap, Globe, Server, Terminal, Layout, 
    Smartphone, MessageSquare, Bug, LifeBuoy
} from 'lucide-react';

/**
 * Maps a category string ID/Slug to a Lucide Icon component.
 * Uses heuristics if no direct match is found.
 */
export const getCategoryIcon = (id: string) => {
    if (!id) return FileText;
    
    const lower = id.toLowerCase();

    // Documentation Categories
    if (lower.includes('start') || lower.includes('intro')) return Book;
    if (lower.includes('integration') || lower.includes('api')) return Code;
    if (lower.includes('core') || lower.includes('concept')) return Cpu;
    if (lower.includes('deploy') || lower.includes('hosting')) return Layers;
    
    // Feature Categories
    if (lower.includes('db') || lower.includes('data')) return Database;
    if (lower.includes('auth') || lower.includes('security')) return Shield;
    if (lower.includes('speed') || lower.includes('perform')) return Zap;
    if (lower.includes('edge') || lower.includes('global')) return Globe;
    
    // Community
    if (lower.includes('chat') || lower.includes('discuss')) return MessageSquare;
    if (lower.includes('bug') || lower.includes('issue')) return Bug;
    if (lower.includes('help')) return LifeBuoy;

    // Fallback
    return FileText;
};