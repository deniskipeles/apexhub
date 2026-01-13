import { getApexServer } from '@/lib/apexkit';
import { redirect } from 'next/navigation';
import { User, Mail, Shield, Clock, Package } from 'lucide-react';
import Link from 'next/link';

async function getUserProfile() {
    const apex = await getApexServer();
    try {
        const user = await apex.auth.getMe();
        return {
            ...user,
            joined: '2023-10-01', // Timestamp not yet on user obj, add later?
            contributions: { issues: 0, discussions: 0, optimizations: 0 } // Mock stats for now
        };
    } catch {
        return null;
    }
}

export default async function ProfilePage() {
    const user = await getUserProfile();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

            <div className="bg-surface border border-border rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-start gap-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold border border-primary/20">
                    {user.email[0].toUpperCase()}
                </div>
                
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold">{user.email.split('@')[0]}</h2>
                        <p className="text-muted">{user.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md">
                            <Shield size={16} className="text-blue-500" />
                            <span className="capitalize">{user.role}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md">
                            <Clock size={16} className="text-muted" />
                            <span>Joined {user.joined}</span>
                        </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md">
                            <User size={16} className="text-muted" />
                            <span>ID: {user.id}</span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Issues" value={user.contributions.issues} href="/community/issues" />
                <StatCard label="Discussions" value={user.contributions.discussions} href="/community/discussions" />
                <StatCard label="Optimizations" value={user.contributions.optimizations} href="/optimizations" />
            </div>
        </div>
    );
}

const StatCard = ({ label, value, href }: { label: string, value: number, href: string }) => (
    <Link href={href} className="bg-surface/50 border border-border rounded-xl p-6 hover:border-primary/40 transition-colors group">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">{label}</span>
            <Package size={18} className="text-muted group-hover:text-primary" />
        </div>
        <div className="text-3xl font-bold">{value}</div>
    </Link>
);