'use client';

import { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { BlogEditor } from '@/components/Blog/BlogEditor';
import { Loader2 } from 'lucide-react';

export default function EditBlogPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apex.collection('blog').get(params.id)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-muted h-8 w-8" /></div>;
    if (!data) return <div className="p-12 text-center text-muted">Post not found</div>;

    return <BlogEditor initialData={data} />;
}