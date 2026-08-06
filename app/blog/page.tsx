// apexhub/app/blog/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { BlogList } from '@/components/Blog/BlogList';
import { Loader2 } from 'lucide-react';

export default function BlogPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apex.collection('blog').list({ 
            sort: '-created', 
            expand: 'author_id',
            per_page: 20
        })
        .then(res => setPosts(res.items))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    return <BlogList initialPosts={posts} />;
}