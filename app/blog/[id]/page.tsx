'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { BlogPostView } from '@/components/Blog/BlogPostView';
import { Loader2 } from 'lucide-react';

export default function BlogPostPage({ params }: { params: { id: string } }) {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apex.collection('blog').get(params.id, { expand: 'author_id' })
            .then(setPost)
            .catch(() => setPost(null))
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    if (!post) return <div className="p-12 text-center text-muted">Post not found</div>;

    return <BlogPostView post={post} content={post.data.body || ''} />;
}