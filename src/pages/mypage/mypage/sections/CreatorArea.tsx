// front/src/pages/mypage/mypage/sections/CreatorArea.tsx

import { Link, useNavigate } from 'react-router-dom';
import {
  API_ORIGIN,
  applyCreator,
  createStripeOnboardingLink,
} from '../../../../lib/api';
import type { CreatorMeResponse } from '../../../../shared/types';
import KycStatusBadge from '../../../../components/ui/KycStatusBadge';
import CreatorMonetizationStatus from '../../../../components/ui/CreatorMonetizationStatus';
import { creatorMenuItems } from '../creatorMenu';

type Props = {
  user: any;
  creator: CreatorMeResponse | null | undefined;
  loading: boolean;
  needsKyc: boolean;
  isNotApplied: boolean;
  isPending: boolean;
  isRejected: boolean;
  isApproved: boolean;
  onReloadCreator: () => Promise<void> | void;
  setLoading: (v: boolean) => void;
};

export function CreatorArea({
  user,
  creator,
  loading,
  needsKyc,
  isNotApplied,
  isPending,
  isRejected,
  isApproved,
  onReloadCreator,
  setLoading,
}: Props) {
  const navigate = useNavigate();

  const handleApplyCreator = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const publicName =
        user.displayName ?? (user.email ? user.email.split('@')[0] : '新しいクリエイター');

      await applyCreator({ publicName });
      await onReloadCreator();
      alert('クリエイター申請を受け付けました（審査中）');
    } catch (e: any) {
      console.error('applyCreator failed', e);
      alert(e?.message ?? '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 読み込み中
  if (creator === undefined) {
    return (
      <section className="card">
        <div className="section-title">クリエイター情報</div>
        <p className="section-subtitle">クリエイター情報を読み込み中です...</p>
      </section>
    );
  }

  // 未申請
  if (isNotApplied) {
    return (
      <section className="card space-y-3">
        <div className="section-title">クリエイター登録</div>
        <p className="section-subtitle">
          クリエイター登録を行うと、投稿の販売やサブスクプランの作成ができるようになります。
        </p>
        <button
          onClick={handleApplyCreator}
          disabled={loading}
          className="btn btn-primary w-full justify-center"
        >
          {loading ? '登録中…' : 'クリエイター登録する'}
        </button>
      </section>
    );
  }

  // 以降 creator は object
  if (!creator) return null;

  if (isPending) {
    return (
      <section className="card">
        <div className="section-title">審査中</div>
        <p className="section-subtitle">
          クリエイター申請を受け付けました。現在、管理者による審査中です。
        </p>
      </section>
    );
  }

  if (isRejected) {
    return (
      <section className="card space-y-2">
        <div className="section-title">申請が差し戻されました</div>
        {creator.rejectReason && (
          <p className="text-sm text-red-600">理由：{creator.rejectReason}</p>
        )}
        <button onClick={handleApplyCreator} disabled={loading} className="btn btn-primary">
          再申請する
        </button>
      </section>
    );
  }

  if (!isApproved) return null;

  // 承認済み
  const displayName = creator.publicName ?? '(未設定)';
  const rawAvatarUrl = creator.avatarUrl ?? undefined;
  const avatarSrc = rawAvatarUrl
    ? rawAvatarUrl.startsWith('http')
      ? rawAvatarUrl
      : `${API_ORIGIN}${rawAvatarUrl}`
    : null;

  return (
    <>
      <section className="card">
        <div className="section-title flex items-center justify-between">
          <span>クリエイター情報</span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/creators/profile')}
          >
            詳細
          </button>
        </div>

        <div className="flex items-start gap-3 mt-3">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} className="profile-avatar-preview" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{displayName}</div>

            {creator.bio ? (
              <p className="text-xs text-gray-500 mt-1 line-clamp-3">{creator.bio}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">自己紹介はまだ登録されていません。</p>
            )}

            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-gray-500">本人確認</span>
              {!creator.stripeAccountId ? (
                <span className="badge badge-gray">未開始</span>
              ) : (
                <KycStatusBadge
                  status={(creator.stripeKycStatus ?? 'pending') as any}
                  disabledReason={creator.stripeKycDisabledReason}
                />
              )}
              {needsKyc && <span className="text-gray-400">（出金には本人確認が必要です）</span>}
            </div>

            <CreatorMonetizationStatus
              stripeKycStatus={(creator.stripeKycStatus ?? 'pending') as any}
              stripeChargesEnabled={creator.stripeChargesEnabled}
              stripePayoutsEnabled={creator.stripePayoutsEnabled}
              stripeKycDisabledReason={creator.stripeKycDisabledReason}
              stripeKycFieldsDue={creator.stripeKycFieldsDue}
              onClickFix={async () => {
                const { url } = await createStripeOnboardingLink();
                window.location.href = url;
              }}
            />
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <div className="section-title">クリエイターメニュー</div>
        <p className="section-subtitle">よく使う機能に素早くアクセスできます。</p>

        <div className="mt-1 space-y-2">
          {creatorMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="btn btn-outline w-full justify-between"
              style={{ display: 'flex', alignItems: 'center' }} // btn が button 前提CSSでも崩れないよう保険
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </span>
              <span className="text-xs text-gray-400">›</span>
            </Link>
          ))}
        </div>

      </section>
    </>
  );
}
