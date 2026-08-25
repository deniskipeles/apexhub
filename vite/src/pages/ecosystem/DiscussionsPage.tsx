import React, { useEffect, useState } from 'react';
import { apex } from '@/lib/apexkit';
import { useApexStore } from '@/store/useApexStore';
import { EcosystemView } from '@/components/Ecosystem/EcosystemView';
import { RealtimeChat } from '@/components/Community/RealtimeChat';
import { Loader2 } from 'lucide-react';

export function DiscussionsPage() {
  const { currentRoute, routeParams } = useApexStore();
  const [parentData, setParentData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRoute === 'discussion-detail' && routeParams.id) {
      setLoading(true);
      Promise.all([
        apex.collection('community_threads').get(routeParams.id, { expand: 'author_id' }).catch(() => null),
        apex.collection('thread_comments').list({
          filter: { thread_id: Number(routeParams.id) || routeParams.id },
          sort: 'created',
          expand: 'author_id',
          per_page: 100
        }).catch(() => ({ items: [] }))
      ]).then(([parent, commsRes]) => {
        setParentData(parent);
        setComments(commsRes.items || []);
      }).finally(() => setLoading(false));
    }
  }, [currentRoute, routeParams.id]);

  if (currentRoute === 'discussion-detail') {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
      );
    }
    if (!parentData) {
      return (
        <div className="p-12 text-center text-muted">
          Discussion not found.
        </div>
      );
    }
    return (
      <div className="p-6 md:p-12 max-w-5xl mx-auto">
        <RealtimeChat
          parentId={routeParams.id}
          parentData={parentData}
          initialComments={comments}
          collectionName="thread_comments"
          parentField="thread_id"
          channel={`thread_${routeParams.id}`}
        />
      </div>
    );
  }

  return <EcosystemView defaultTab="discussions" />;
}

export default DiscussionsPage;