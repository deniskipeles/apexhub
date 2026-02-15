'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Monitor, Check, Copy, Download, ShieldCheck, Apple, Loader2, RefreshCw } from 'lucide-react';

type OS = 'linux' | 'windows' | 'macos';

export default function DownloadPage() {
    const [copied, setCopied] = useState(false);
    const [selectedOS, setSelectedOS] = useState<'unix' | 'windows'>('unix');
    const [downloadingOS, setDownloadingOS] = useState<OS | null>(null);
    
    // Release Metadata State
    const [releaseInfo, setReleaseInfo] = useState<{
        version: string;
        date: string;
        checksums: string;
    } | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);

    const installCmd = selectedOS === 'unix' 
        ? 'curl -fsSL https://api.apexkit.io/api/v1/run/get-install-script | sh' 
        : 'irm https://api.apexkit.io/api/v1/run/get-install-ps1 | iex';

    // --- FETCH RELEASE INFO ---
    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.apexkit.io';
                const res = await fetch(`${apiUrl}/api/v1/run/get-release-info`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({})
                });
                if (res.ok) {
                    const data = await res.json();
                    setReleaseInfo(data);
                }
            } catch (err) {
                console.error("Failed to fetch release info", err);
            } finally {
                setIsLoadingInfo(false);
            }
        };
        fetchInfo();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(installCmd);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const triggerDownload = async (os: OS) => {
        setDownloadingOS(os);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.apexkit.io';
            
            // 1. Get the Signed URL
            const res = await fetch(`${apiUrl}/api/v1/run/get-latest-binary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ os })
            });
            
            const data = await res.json();
            
            if (!res.ok || !data.success) {
                alert(data.error || "Download failed.");
                return;
            }

            // 2. Trigger Download via Hidden Anchor
            // This ensures the browser handles the file stream natively
            const a = document.createElement('a');
            a.href = data.downloadUrl;
            a.download = data.filename; // Hint filename (though browser might prioritize header)
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (err) {
            console.error(err);
            alert("Network error.");
        } finally {
            setDownloadingOS(null);
        }
    };

    // Helper to find specific hash in the checksums text
    const getHashForPattern = (pattern: string) => {
        if (!releaseInfo?.checksums) return "Hash pending...";
        const lines = releaseInfo.checksums.split('\n');
        const match = lines.find(line => line.includes(pattern));
        return match ? match.split(/\s+/)[0] : "Hash not found in manifest";
    };

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
                    {isLoadingInfo ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : (
                        `Latest Release: ${releaseInfo?.version || 'v0.1.0'}`
                    )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
                    Install <span className="text-primary">ApexKit</span>
                </h1>
                <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                    Get the single-binary backend. No external dependencies, just download and run.
                </p>
            </div>

            {/* Quick Install Section */}
            <div className="max-w-3xl mx-auto mb-20">
                <div className="bg-surface border border-border rounded-2xl p-1.5 mb-6 flex justify-center w-fit mx-auto shadow-sm">
                    <button onClick={() => setSelectedOS('unix')} className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${selectedOS === 'unix' ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted hover:text-foreground'}`}>Linux / macOS</button>
                    <button onClick={() => setSelectedOS('windows')} className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${selectedOS === 'windows' ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted hover:text-foreground'}`}>Windows</button>
                </div>

                <div className="bg-zinc-950 border border-border rounded-2xl p-6 md:p-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleCopy} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors">
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                    <div className="font-mono text-sm md:text-base text-zinc-300 break-all pr-12 flex gap-3">
                        <span className="text-primary select-none">$</span>
                        <span>{installCmd}</span>
                    </div>
                </div>
            </div>

            {/* Manual Downloads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                <DownloadCard 
                    os="Linux" arch="x86_64" filename="apexkit-linux-musl" icon={<Terminal size={24} />} 
                    onDownload={() => triggerDownload('linux')} isDownloading={downloadingOS === 'linux'}
                />
                <DownloadCard 
                    os="macOS" arch="Universal" filename="apexkit-apple-darwin" icon={<Apple size={24} />} 
                    onDownload={() => triggerDownload('macos')} isDownloading={downloadingOS === 'macos'}
                />
                <DownloadCard 
                    os="Windows" arch="x64" filename="apexkit-windows-msvc.exe" icon={<Monitor size={24} />} 
                    onDownload={() => triggerDownload('windows')} isDownloading={downloadingOS === 'windows'}
                />
            </div>

            {/* Checksums Section */}
            <div className="bg-surface/30 border border-border rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck size={20} className="text-green-500" /> 
                        Verification
                    </h3>
                    {!isLoadingInfo && (
                        <span className="text-[10px] font-mono text-muted uppercase">
                            Updated: {new Date(releaseInfo?.date || "").toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div className="space-y-6">
                    <HashRow label="Linux (musl)" hash={getHashForPattern("linux-musl")} />
                    <HashRow label="Windows (msvc)" hash={getHashForPattern("windows-gnu")} />
                    <HashRow label="macOS (darwin)" hash={getHashForPattern("apple-darwin")} />
                </div>
            </div>
        </div>
    );
}

const HashRow = ({ label, hash }: { label: string, hash: string }) => (
    <div>
        <div className="text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">{label} SHA256</div>
        <code className="block bg-black/20 p-3 rounded-lg text-xs font-mono text-zinc-400 break-all border border-border select-all">
            {hash}
        </code>
    </div>
);

const DownloadCard = ({ os, arch, filename, icon, onDownload, isDownloading }: any) => (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all group hover:shadow-lg duration-300">
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-background rounded-lg border border-border text-foreground group-hover:text-primary transition-colors">{icon}</div>
            <span className="text-xs font-mono text-muted bg-background px-2 py-1 rounded border border-border">{arch}</span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">{os}</h3>
        <div className="text-[10px] text-muted font-mono mb-6 truncate opacity-60">{filename}</div>
        <button onClick={onDownload} disabled={isDownloading} className="w-full py-2.5 bg-background border border-border hover:bg-primary hover:text-white text-foreground font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <><Download size={16} /> Download</>}
        </button>
    </div>
);