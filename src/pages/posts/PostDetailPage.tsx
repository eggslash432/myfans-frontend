// front/src/pages/posts/PostDetailPage.tsx
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  ApiError,
  createPlanCheckoutSession,
  createPpvCheckoutSession,
  getPostDetail,
  reportPost,
} from '../../lib/api';
import type { PostDetail } from '../../shared/types';
import { useAuth } from '../../hooks/useAuth';

import { useSampleLock } from './postDetail/useSampleLock';
import { PostHeader } from './postDetail/PostHeader';
import { SampleSection } from './postDetail/SampleSection';
import { MediaGallery } from './postDetail/MediaGallery';
import { LockedPanel } from './postDetail/LockedPanel';
import { ReportButton } from './postDetail/ReportButton';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [busyPlan, setBusyPlan] = useState(false);
  const [busyPpv, setBusyPpv] = useState(false);

  const SAMPLE_LIMIT_SEC = 30;
  const sampleLock = useSampleLock(SAMPLE_LIMIT_SEC);

  const q = useQuery<PostDetail>({
    queryKey: ['post', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error('no id');
      return await getPostDetail(id);
    },
    retry: (c, err: any) => !(err instanceof ApiError && err.status === 403) && c < 1,
  });

  const requireLogin = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return true;
    }
    return false;
  };

  const buyPpv = async () => {
    if (!id) return;
    if (requireLogin()) return;

    try {
      setBusyPpv(true);
      const { url } = await createPpvCheckoutSession(id);
      if (!url) throw new Error('Checkout URL が取得できませんでした');
      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      if (e instanceof ApiError && e.status === 401) {
        navigate('/login', { state: { from: location.pathname }, replace: true });
        return;
      }
      alert(e?.body?.message ?? e?.message ?? '決済の開始に失敗しました');
    } finally {
      setBusyPpv(false);
    }
  };

  const subscribePlan = async (post: PostDetail) => {
    if (!post.creatorId || !post.planId) {
      alert('この投稿に紐づくプラン情報がありません');
      return;
    }
    if (requireLogin()) return;

    try {
      setBusyPlan(true);
      const { url } = await createPlanCheckoutSession(post.planId);
      if (!url) throw new Error('Checkout URL が取得できませんでした');
      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      if (e instanceof ApiError && e.status === 401) {
        navigate('/login', { state: { from: location.pathname }, replace: true });
        return;
      }
      alert(e?.body?.message ?? e?.message ?? 'プラン加入の開始に失敗しました');
    } finally {
      setBusyPlan(false);
    }
  };

  // ---- loading / error ----
  if (q.isLoading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">投稿を読み込み中です…</p>
        </section>
      </div>
    );
  }

  const errorStatus = q.error instanceof ApiError ? q.error.status : undefined;

  if (errorStatus === 403) {
    return (
      <div className="page">
        <section className="card post-detail-card">
          <h1 className="post-detail-title">この投稿は有料です</h1>
          <p className="section-subtitle">購読または単品購入が必要です。</p>

          <div className="post-detail-actions">
            <Link to="/login" className="btn btn-ghost">
              ログイン
            </Link>
            <Link to="/signup" className="btn btn-ghost">
              新規登録
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="page">
        <section className="card">
          <p className="settings-message settings-message-error">投稿の読み込みに失敗しました。</p>
        </section>
      </div>
    );
  }

  const post = q.data;

  // ---- normalize media ----
  const rawMedia =
    (post as any).mediaAssets ??
    (post as any).media ??
    (post as any).medias ??
    [];

  const mediaAssets = (rawMedia ?? []) as {
    id?: string;
    url: string;
    kind?: string;
    mediaType?: string;
    mimeType?: string;
    isSample?: boolean;
  }[];

  const sampleAssets = mediaAssets.filter((m) => (m as any).isSample);
  const mainAssets = mediaAssets.filter((m) => !(m as any).isSample);

  const isFree = post.visibility === 'free';
  const isPlan = post.visibility === 'plan';
  const isPpv = post.visibility === 'paid_single';

  const isR18 = (post as any).ageRating === 'r18' || (post as any).isAdult === true;

  const canViewMainFlag = (post as any).canViewMain ?? (post as any).canView ?? undefined;
  const canView = isFree ? true : canViewMainFlag === true;

  const canViewSample = (post as any).canViewSample ?? sampleAssets.length > 0;
  const isLocked = !canView && (isPlan || isPpv);

  const handleReport = async () => {
    if (!user) {
      alert('通報するにはログインが必要です');
      return;
    }
    const reason = window.prompt('通報理由を入力してください（任意）') ?? '';
    try {
      await reportPost(post.id, { reason });
      alert('通報を受け付けました。ご協力ありがとうございます。');
    } catch (e) {
      console.error(e);
      alert('通報に失敗しました。時間をおいて再度お試しください。');
    }
  };

  return (
    <div className="page">
      <article className="card post-detail-card">
        <PostHeader
          post={post}
          isFree={isFree}
          isPlan={isPlan}
          isPpv={isPpv}
          canView={canView}
          isR18={isR18}
        />

        <section className="post-detail-body">
          <SampleSection
            visible={canViewSample}
            sampleAssets={sampleAssets}
            sampleLimitSec={SAMPLE_LIMIT_SEC}
            isLocked={sampleLock.isLocked}
            onPlay={sampleLock.unlock}
            onTimeUpdate={sampleLock.onTimeUpdate}
          />

          {!isLocked ? (
            <div className="space-y-4">
              <MediaGallery assets={mainAssets} />
              <div className="post-detail-text">{post.body ?? '（本文なし）'}</div>
            </div>
          ) : (
            <LockedPanel
              isPlan={isPlan}
              isPpv={isPpv}
              post={post}
              busyPlan={busyPlan}
              busyPpv={busyPpv}
              onBuyPpv={buyPpv}
              onSubscribe={() => subscribePlan(post)}
            />
          )}
        </section>

        <ReportButton onReport={handleReport} />
      </article>
    </div>
  );
}
