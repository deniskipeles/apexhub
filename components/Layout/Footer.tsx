import Link from 'next/link';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

const SocialIcon = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noreferrer"
        className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-colors"
    >
        {icon}
    </a>
);

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <li>
        <Link href={href} className="hover:text-primary transition-colors">
            {children}
        </Link>
    </li>
);

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            {/* Branding Column */}
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                     <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                        <path d="M16 2L2 26H30L16 2Z" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 10L13.5 18H17.5L14.5 26L21.5 16H17L18.5 10Z" fill="currentColor" className="text-accent" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                    </svg>
                    <div className="font-bold text-lg text-foreground">Apex<span className="text-primary">Hub</span></div>
                </div>
                <p className="text-muted text-sm mb-6 max-w-xs">
                    The vertical-scale backend for modern applications. Built for speed, safety, and simplicity.
                </p>
                <div className="flex gap-4">
                    <SocialIcon href="https://github.com/apexkit" icon={<Github size={18} />} />
                    <SocialIcon href="https://twitter.com/apexkit" icon={<Twitter size={18} />} />
                    <SocialIcon href="https://linkedin.com/company/apexkit" icon={<Linkedin size={18} />} />
                </div>
            </div>
            
            {/* Links Columns */}
            <div>
                <h4 className="font-bold text-foreground mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted">
                    <FooterLink href="/features">Features</FooterLink>
                    <FooterLink href="/roadmap">Roadmap</FooterLink>
                    <FooterLink href="/changelog">Changelog</FooterLink>
                    <FooterLink href="/download">Download</FooterLink>
                </ul>
            </div>
             <div>
                <h4 className="font-bold text-foreground mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-muted">
                    <FooterLink href="/docs">Documentation</FooterLink>
                    <FooterLink href="/api-reference">API Reference</FooterLink>
                    <FooterLink href="/community">Community</FooterLink>
                    <FooterLink href="/optimizations">Optimizations</FooterLink>
                </ul>
            </div>
             <div>
                <h4 className="font-bold text-foreground mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-muted">
                    <FooterLink href="/about">About</FooterLink>
                    <FooterLink href="/blog">Blog</FooterLink>
                    <FooterLink href="/careers">Careers</FooterLink>
                    <FooterLink href="/contact">Contact</FooterLink>
                </ul>
            </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
            <div>
                &copy; {new Date().getFullYear()} ApexKit Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-1">
                Made with <Heart size={12} className="text-red-500 fill-red-500" /> by the ApexTeam
            </div>
        </div>
      </div>
    </footer>
  );
}