import React, { useState, useEffect } from 'react';
import { apex } from '@/lib/apexkit';
import { Terminal, Monitor, Check, Copy, Download, ShieldCheck, Apple, Loader2, Package } from 'lucide-react';

interface Artifact {
    name: string;
    size?: number;
}

interface ReleaseInfo {
    version: string;
    date: string;
    checksums: string;
    artifacts: Artifact[];
}

export function DownloadView() {
    const [copied, setCopied] = useState(false);
    const [selectedOS, setSelectedOS] = useState<'unix' | 'windows'>('unix');
    
    const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [downloadingName, setDownloadingName] = useState<string | null>(null);

    const installCmd = selectedOS === 'unix' 
        ? 'curl -fsSL https://api.apexkit.io/api/v1/run/get-install-script | sh' 
        : 'irm https://api.apexkit.io/api/v1/run/get-install-ps1 | iex';

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const data = await apex.webhook('api-downloads').get('/info');
                
                if (data && data.success) {
                    setReleaseInfo({
                        version: data.version || 'v0.1.0',
                        date: data.date || '',
                        checksums: typeof data.checksums === 'string' ? data.checksums : '',
                        artifacts: Array.isArray(data.artifacts) ? data.artifacts : []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch release info:", err);
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

    const handleDownload = async (artifactName: string) => {
        setDownloadingName(artifactName);
        try {
            const res = await apex.webhook('api-downloads').post('/latest', { name: artifactName });
            
            if (res && res.success && res.downloadUrl) {
                const a = document.createElement('a');
                a.href = res.downloadUrl;
                a.download = res.filename || artifactName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert(res?.error || "Failed to resolve download link.");
            }
        } catch (err: any) {
            console.error("Download error:", err);
            alert(err.message || "Failed to initiate download.");
        } finally {
            setDownloadingName(null);
        }
    };

    const getHashForArtifact = (filename: string) => {
        if (!releaseInfo?.checksums) return "Hash pending...";
        const lines = releaseInfo.checksums.split(/[\r\n]+/);
        const match = lines.find(line => line && line.includes(filename));
        return match ? match.split(/\s+/)[0] : "Hash not found in manifest";
    };

    const getOsInfo = (filename: string) => {
        const lower = filename.toLowerCase();
        if (lower.includes('windows') || lower.includes('msvc') || lower.includes('exe')) {
            return { os: 'Windows', icon: <Monitor size={24} /> };
        }
        if (lower.includes('apple') || lower.includes('darwin') || lower.includes('mac')) {
            return { os: 'macOS', icon: <Apple size={24} /> };
        }
        if (lower.includes('linux') || lower.includes('musl') || lower.includes('gnu')) {
            return { os: 'Linux', icon: <Terminal size={24} /> };
        }
        return { os: 'Binary Archive', icon: <Package size={24} /> };
    };

    const getArchInfo = (filename: string) => {
        const lower = filename.toLowerCase();
        if (lower.includes('x86_64') || lower.includes('amd64') || lower.includes('x64')) return 'x86_64';
        if (lower.includes('aarch64') || lower.includes('arm64')) return 'arm64';
        if (lower.includes('universal')) return 'Universal';
        return 'Build';
    };

    const artifactsList = releaseInfo?.artifacts || [];

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

            <div className="max-w-3xl mx-auto mb-20">
                <div className="bg-surface border border-border rounded-2xl p-1.5 mb-6 flex justify-center w-fit mx-auto shadow-sm">
                    <button type="button" onClick={() => setSelectedOS('unix')} className={`px-6 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${selectedOS === 'unix' ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted hover:text-foreground'}`}>Linux / macOS</button>
                    <button type="button" onClick={() => setSelectedOS('windows')} className={`px-6 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${selectedOS === 'windows' ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted hover:text-foreground'}`}>Windows</button>
                </div>

                <div className="bg-zinc-950 border border-border rounded-2xl p-6 md:p-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={handleCopy} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                    <div className="font-mono text-sm md:text-base text-zinc-300 break-all pr-12 flex gap-3">
                        <span className="text-primary select-none">$</span>
                        <span>{installCmd}</span>
                    </div>
                </div>
            </div>

            {/* Dynamically List All Artifacts from the Release */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {isLoadingInfo ? (
                     <div className="col-span-full flex justify-center py-10 text-muted gap-2 text-sm items-center">
                         <Loader2 className="animate-spin" size={16} /> Fetching binaries...
                     </div>
                ) : artifactsList.length > 0 ? (
                    artifactsList.map((artifact) => {
                        const { os, icon } = getOsInfo(artifact.name);
                        const arch = getArchInfo(artifact.name);
                        const sizeMb = artifact.size ? (artifact.size / 1024 / 1024).toFixed(1) : "";
                        const isDownloading = downloadingName === artifact.name;

                        return (
                            <div 
                                key={artifact.name}
                                className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all group hover:shadow-lg duration-300 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-background rounded-lg border border-border text-foreground group-hover:text-primary transition-colors">{icon}</div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-background px-2 py-1 rounded border border-border">{arch}</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-1">{os}</h3>
                                <div className="text-[10px] text-muted font-mono mb-2 truncate opacity-80" title={artifact.name}>{artifact.name}</div>
                                <div className="text-[10px] text-muted font-bold mb-6">{sizeMb ? `${sizeMb} MB` : 'Build Artifact'}</div>
                                
                                <button 
                                    type="button"
                                    onClick={() => handleDownload(artifact.name)}
                                    disabled={isDownloading}
                                    className="mt-auto w-full py-2.5 bg-background border border-border hover:bg-primary hover:text-white text-foreground font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                                >
                                    {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} /> Download</>}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-10 text-muted border border-dashed border-border rounded-xl bg-surface/30">
                        No binaries found for this release.
                    </div>
                )}
            </div>

            {/* Dynamic Verification Table */}
            <div className="bg-surface/30 border border-border rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck size={20} className="text-green-500" /> 
                        Verification
                    </h3>
                    {!isLoadingInfo && releaseInfo?.date && (
                        <span className="text-[10px] font-mono text-muted uppercase">
                            Updated: {new Date(releaseInfo.date).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div className="space-y-6">
                    {artifactsList.length > 0 ? (
                        artifactsList.map(artifact => (
                            <HashRow 
                                key={artifact.name} 
                                label={artifact.name} 
                                hash={getHashForArtifact(artifact.name)} 
                            />
                        ))
                    ) : (
                        <div className="text-xs text-muted">No verification signatures found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

const HashRow = ({ label, hash }: { label: string, hash: string }) => (
    <div>
        <div className="text-[10px] text-muted uppercase font-bold mb-1 tracking-wider">{label}</div>
        <code className="block bg-black/20 p-3 rounded-lg text-xs font-mono text-zinc-400 break-all border border-border select-all">
            {hash}
        </code>
    </div>
);