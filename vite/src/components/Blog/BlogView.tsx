import React, { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { BlogList } from './BlogList';
import { BlogPostView } from './BlogPostView';
import { BlogEditor } from './BlogEditor';
import { Loader2 } from 'lucide-react';
import { useApexStore } from '@/store/useApexStore';

export function BlogView() {
    const { currentRoute, routeParams } = useApexStore();
    const [posts, setPosts] = useState<any[]>([]);
    const [singlePost, setSinglePost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (currentRoute === 'blog-detail' || currentRoute === 'blog-edit') {
            const id = routeParams.id;
            apex.collection('blog').get(id, { expand: 'author_id' })
                .then(setSinglePost)
                .catch((err) => {
                    console.error("Failed to load blog post", err);
                    setSinglePost(null);
                })
                .finally(() => setLoading(false));
        } else if (currentRoute === 'blog-new') {
            setLoading(false);
        } else {
            apex.collection('blog').list({ 
                sort: '-created', 
                expand: 'author_id',
                per_page: 20
            })
            .then((res) => setPosts(res.items || []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
        }
    }, [currentRoute, routeParams.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-muted h-8 w-8" />
            </div>
        );
    }

    if (currentRoute === 'blog-new') {
        return <BlogEditor />;
    }

    if (currentRoute === 'blog-edit') {
        if (!singlePost) return <div className="p-12 text-center text-muted">Post not found</div>;
        return <BlogEditor initialData={singlePost} />;
    }

    if (currentRoute === 'blog-detail') {
        if (!singlePost) return <div className="p-12 text-center text-muted">Post not found</div>;
        return <BlogPostView post={singlePost} content={singlePost.data?.body || ''} />;
    }

    return <BlogList initialPosts={posts} />;
}
