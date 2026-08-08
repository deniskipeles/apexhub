import { 
    Book, Code, FileText, Layers, Cpu, Database, 
    Shield, Zap, Globe, Server, Terminal, Layout, 
    Smartphone, MessageSquare, Bug, LifeBuoy
} from 'lucide-react';

export const getCategoryIcon = (id: string) => {
    if (!id) return FileText;
    
    const lower = id.toLowerCase();

    if (lower.includes('start') || lower.includes('intro')) return Book;
    if (lower.includes('integration') || lower.includes('api')) return Code;
    if (lower.includes('core') || lower.includes('concept')) return Cpu;
    if (lower.includes('deploy') || lower.includes('hosting')) return Layers;
    
    if (lower.includes('db') || lower.includes('data')) return Database;
    if (lower.includes('auth') || lower.includes('security')) return Shield;
    if (lower.includes('speed') || lower.includes('perform')) return Zap;
    if (lower.includes('edge') || lower.includes('global')) return Globe;
    
    if (lower.includes('chat') || lower.includes('discuss')) return MessageSquare;
    if (lower.includes('bug') || lower.includes('issue')) return Bug;
    if (lower.includes('help')) return LifeBuoy;

    return FileText;
};
