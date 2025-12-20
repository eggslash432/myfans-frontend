// front/src/pages/mypage/mypage/useMyPageData.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserMe, getCreatorMe, myPosts } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import type { CreatorMeResponse, MeSummary, PostSummary } from '../../../shared/types';

function unwrapCreator(res: any): CreatorMeResponse | null {
  const c = res?.data ?? res?.creator ?? res?.item ?? res;
  const ok =
    c && typeof c === 'object' && (
      typeof c.id === 'string' || typeof c.approvalStatus === 'string'
    );
  return ok ? (c as CreatorMeResponse) : null;
}

export function useMyPageData() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  const role = (user as any)?.role;
  const isAdmin = role === 'admin';

  const [summary, setSummary] = useState<MeSummary | undefined>(undefined);
  const [summaryErr, setSummaryErr] = useState<string>('');

  // creator: undefined=loading, null=not applied, object=exists
  const [creator, setCreator] = useState<CreatorMeResponse | null | undefined>(undefined);

  const [posts, setPosts] = useState<PostSummary[]>([]);

  const approval = creator?.approvalStatus ?? null;
  const isApproved = approval === 'approved';
  const isPending = approval === 'pending';
  const isRejected = approval === 'rejected';
  const isNotApplied = creator === null;

  // admin は /admin へ
  useEffect(() => {
    if (!ready || !user) return;
    if (!isAdmin) return;
    navigate('/admin', { replace: true });
  }, [ready, user, isAdmin, navigate]);

  const loadCreator = useCallback(async () => {
    if (!ready || !user) return;

    try {
      const res = await getCreatorMe();
      setCreator(unwrapCreator(res));
    } catch (e: any) {
      const msg = e?.message ?? '';
      console.error('getCreatorMe failed:', e);

      // “not found” 系は未申請扱い
      if (/creator not found/i.test(msg) || /404/.test(msg)) {
        setCreator(null);
      } else {
        setCreator(null);
      }
    }
  }, [ready, user]);

  // summary
  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      try {
        setSummary(await getUserMe());
        setSummaryErr('');
      } catch (e: any) {
        setSummaryErr(e?.message ?? 'failed');
      }
    })();
  }, [ready, user]);

  // creator
  useEffect(() => {
    if (!ready || !user) return;
    loadCreator();
  }, [ready, user, loadCreator]);

  // posts（承認済みのみ）
  useEffect(() => {
    if (!ready || !user) return;

    if (!isApproved) {
      setPosts([]);
      return;
    }

    myPosts()
      .then((res) => setPosts(res.items ?? []))
      .catch((e) => console.error('投稿取得失敗:', e));
  }, [ready, user, isApproved]);

  const splitPosts = useMemo(() => {
    const publicPosts = posts.filter((p) => p.publishedStatus === 'published');
    const draftPosts = posts.filter((p) => p.publishedStatus === 'draft');
    const privatePosts = posts.filter((p) => p.publishedStatus === 'private');
    return { publicPosts, draftPosts, privatePosts };
  }, [posts]);

  const subscriptionCount = (summary?.subscriptions ?? []).length;
  const paymentCount = (summary?.payments ?? []).length;

  return {
    ready,
    user,

    isAdmin,
    summary,
    summaryErr,

    creator,
    setCreator,
    loadCreator,

    approval,
    isApproved,
    isPending,
    isRejected,
    isNotApplied,

    posts,
    setPosts,
    splitPosts,

    subscriptionCount,
    paymentCount,
  };
}
