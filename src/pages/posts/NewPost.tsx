// front/src/pages/posts/NewPost.tsx

import { useState, useEffect, useRef } from 'react';
import {
  createPostSmart,
  getCreatorMe,
  getMyPlans,
  createPlan as createPlanApi,
  uploadPostMedia,
} from '../../lib/api';
import type { AgeRating, Visibility } from '../../shared/prisma-enums';
import type { Plan } from '../../shared/types';
import { useAuth } from '../../hooks/useAuth';

async function fetchMyPlans(): Promise<Plan[]> {
  try {
    const res = await getMyPlans(); // PlansResponse { ok, plans }
    return res?.plans ?? [];
  } catch {
    return [];
  }
}

function prune<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(prune).filter((v) => v !== undefined && v !== null) as any;
  } else if (obj && typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const pv = prune(v as any);
      if (pv !== undefined && pv !== null && pv !== '') out[k] = pv;
    }
    return out;
  }
  return obj;
}

// ★ プレビュー用の型
type MediaPreview = {
  url: string;
  kind: 'image' | 'video' | 'audio';
};

export default function NewPost() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('free');
  const [ageRating, setAgeRating] = useState<AgeRating>('all');
  const [isDraft, setIsDraft] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const [ppvPrice, setPpvPrice] = useState<string>('500');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [creator, setCreator] = useState<any | null>(null);
  const [creatorErr, setCreatorErr] = useState('');

  // ★ メディア用 state
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 初回：プラン取得
  useEffect(() => {
    const loadPlansOnce = async () => {
      const plans = await fetchMyPlans();
      setPlans(plans ?? []);
    };
    loadPlansOnce();
  }, []);

  // クリエイター情報取得（admin のときは呼ばない）
  useEffect(() => {
    if (isAdmin) {
      setCreator(null);
      setCreatorErr('');
      return;
    }

    (async () => {
      try {
        const res = await getCreatorMe();
        setCreator(res);
        setCreatorErr('');
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          'クリエイター情報の取得に失敗しました';
        console.error('getCreatorMe failed:', e);
        setCreatorErr(msg);
      }
    })();
  }, [isAdmin]);

  // admin の場合は常に free に固定
  useEffect(() => {
    if (isAdmin) {
      setVisibility('free');
    }
  }, [isAdmin]);

  // visibility が変わったら不要な値をクリア
  useEffect(() => {
    if (visibility !== 'plan') setSelectedPlanId('');
    if (visibility !== 'paid_single') setPpvPrice('500');
  }, [visibility]);

  const buildPayload = () => {
    const base: any = {
      title: title.trim(),
      body,
      visibility,
      ageRating,
      publishedStatus: isDraft ? 'draft' : 'published',
      accessRules: {
        allowByPlanIds: [],
        allowByPpv: false,
      },
    };

    if (visibility === 'plan') {
      if (!selectedPlanId) throw new Error('プランを選択してください');
      base.planId = selectedPlanId;
      base.accessRules.allowByPlanIds = [selectedPlanId];
    }

    if (visibility === 'paid_single') {
      const price = Number(ppvPrice);
      if (!Number.isFinite(price) || price < 100) {
        throw new Error('PPV価格は100円以上の整数を入力してください');
      }
      base.priceJpy = price;
      base.accessRules.allowByPpv = true;
      base.accessRules.ppvPriceJpy = price;
    }

    return prune(base);
  };

  async function loadPlans() {
    try {
      const res = await getMyPlans();
      setPlans(res?.plans ?? []);
    } catch (e) {
      console.error('プラン取得失敗', e);
    }
  }

  async function createPlan() {
    if (!newPlanName || !newPlanPrice) return;
    try {
      const res = await createPlanApi({
        name: newPlanName,
        priceJpy: parseInt(newPlanPrice, 10),
      });
      console.log('プラン作成成功', res);
      setShowPlanModal(false);
      await loadPlans();
    } catch (e) {
      console.error('プラン作成失敗', e);
    }
  }

  // ★ メディア選択（画像・動画・音声）
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 既存プレビューURLを解放
    mediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));

    const arr = Array.from(files);
    setMediaFiles(arr);

    // 新しいプレビューURLを生成
    const previews: MediaPreview[] = arr.map((f) => {
      const url = URL.createObjectURL(f);
      const mime = f.type || '';

      let kind: MediaPreview['kind'] = 'image';
      if (mime.startsWith('video/')) {
        kind = 'video';
      } else if (mime.startsWith('audio/')) {
        kind = 'audio';
      } else {
        kind = 'image';
      }

      return { url, kind };
    });

    setMediaPreviews(previews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    try {
      if (!title.trim()) throw new Error('タイトルを入力してください');
      if (!body) throw new Error('本文を入力してください');

      const payload = buildPayload();

      setSubmitting(true);
      const res: any = await createPostSmart(payload);

      const postId =
        res?.postId ??
        res?.post?.id ??
        res?.id ??
        res?.data?.postId ??
        res?.data?.post?.id ??
        res?.data?.id;

      // ★ postId が取れたらメディアも同時アップロード
      if (postId && mediaFiles.length > 0) {
        await uploadPostMedia(postId, mediaFiles);
      }

      setOkMsg('投稿が完了しました。');

      // 入力リセット
      setTitle('');
      setBody('');
      setMediaFiles([]);
      mediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));
      setMediaPreviews([]);
    } catch (e: any) {
      const msg = e?.message ?? (typeof e === 'string' ? e : JSON.stringify(e));
      setError(`投稿失敗: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const kyc = creator?.kyc ?? {};
  const kycStatus = kyc.status ?? creator?.stripeKycStatus ?? 'pending';
  const isKycOk = isAdmin ? true : kycStatus === 'approved';

  return (
    <div className="page">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="page-title">新規投稿作成</h1>

        {!isAdmin && creatorErr && (
          <section className="card">
            <div className="text-sm text-red-700">
              <div className="font-semibold mb-1">
                クリエイター情報の取得に失敗しました。
              </div>
              <div className="text-xs whitespace-pre-wrap">{creatorErr}</div>
            </div>
          </section>
        )}

        {creator && !isKycOk && (
          <section className="card border border-yellow-300 bg-yellow-50/80">
            <p className="text-sm text-yellow-800">
              本人確認（KYC）が未完了のため、投稿の公開や販売機能が制限されます。
              先に「クリエイター設定」から本人確認を完了してください。
            </p>
          </section>
        )}

        <section className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* タイトル */}
            <div className="form-field">
              <label className="form-label">タイトル</label>
              <input
                type="text"
                placeholder="タイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            {/* 本文 */}
            <div className="form-field">
              <label className="form-label">本文（Markdown可）</label>
              <textarea
                placeholder="本文を入力してください"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="form-input"
              />
            </div>

            {/* ★ メディア（画像 / 動画 / 音声） */}
            <div className="form-field">
              <label className="form-label">メディア（画像・動画・音声）</label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  ファイルを選択
                </button>
                {mediaFiles.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {mediaFiles.length} 件選択中
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleMediaChange}
              />

              {mediaPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {mediaPreviews.map((p, i) => (
                    <div
                      key={i}
                      className="w-full max-h-[70vh] bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center"
                    >
                      {p.kind === 'image' && (
                        <img src={p.url} alt="" className="post-media" />
                      )}
                      {p.kind === 'video' && (
                        <video
                          src={p.url}
                          className="post-media"
                          muted
                          controls
                        />
                      )}
                      {p.kind === 'audio' && (
                        <audio
                          src={p.url}
                          controls
                          className="w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-1 text-xs text-gray-500">
                ※ 投稿ボタンを押すと、本文と一緒に選択中のメディアもアップロードされます。
              </p>
            </div>

            {/* 公開範囲 */}
            <div className="space-y-2">
              <div className="font-semibold text-sm">公開範囲</div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'free'}
                    onChange={() => setVisibility('free')}
                  />
                  <span>無料</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'plan'}
                    onChange={() => setVisibility('plan')}
                    disabled={isAdmin}
                  />
                  <span>有料（購読者限定）</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === 'paid_single'}
                    onChange={() => setVisibility('paid_single')}
                    disabled={isAdmin}
                  />
                  <span>PPV</span>
                </label>
              </div>

              {isAdmin && (
                <p className="mt-1 text-xs text-gray-500">
                  管理者アカウントでは無料投稿のみ作成できます（有料販売・購読は不可）。
                </p>
              )}

              {/* プラン選択 */}
              {visibility === 'plan' && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    className="form-input w-full sm:w-auto sm:min-w-[240px]"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                  >
                    <option value="">プランを選択</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.priceJpy ? `（¥${p.priceJpy} /月）` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowPlanModal(true)}
                  >
                    ＋ 新しいプランを作成
                  </button>
                  {plans.length === 0 && (
                    <div className="text-xs text-gray-500">
                      まだプランがありません。先にプランを作成してください。
                    </div>
                  )}
                </div>
              )}

              {/* PPV 価格 */}
              {visibility === 'paid_single' && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <label className="form-label mb-0">PPV 価格（円）</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={ppvPrice}
                    onChange={(e) => setPpvPrice(e.target.value)}
                    className="form-input w-32"
                  />
                </div>
              )}
            </div>

            {/* 年齢区分 */}
            <div className="space-y-2">
              <div className="font-semibold text-sm">年齢区分</div>
              <div className="flex items-center gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="agerating"
                    checked={ageRating === 'all'}
                    onChange={() => setAgeRating('all')}
                  />
                  <span>一般（all）</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="agerating"
                    checked={ageRating === 'r18'}
                    onChange={() => setAgeRating('r18')}
                  />
                  <span>R18</span>
                </label>
              </div>
            </div>

            {/* 公開 or 下書き */}
            <div className="space-y-2">
              <div className="font-semibold text-sm">公開設定</div>
              <div className="flex items-center gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    checked={!isDraft}
                    onChange={() => setIsDraft(false)}
                  />
                  <span>公開</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    checked={isDraft}
                    onChange={() => setIsDraft(true)}
                  />
                  <span>下書き</span>
                </label>
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={(!isKycOk && !isAdmin) || submitting}
                className="btn btn-primary w-full sm:w-auto"
              >
                {submitting ? '投稿中…' : '投稿する'}
              </button>
              {!isAdmin && !isKycOk && (
                <p className="mt-2 text-xs text-gray-500">
                  ※ 本人確認（KYC）が完了すると投稿を公開できるようになります。
                </p>
              )}
            </div>

            {/* メッセージ */}
            {error && (
              <div className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                {error}
              </div>
            )}
            {okMsg && (
              <div className="mt-2 text-sm text-green-700">{okMsg}</div>
            )}
          </form>
        </section>

        {/* 新規プラン作成モーダル */}
        {showPlanModal && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowPlanModal(false)}
            />
            <div className="relative mx-auto my-24 w-full max-w-md rounded-xl bg-white shadow-lg p-5">
              <h3 className="text-lg font-semibold mb-4">
                新しいプランを作成
              </h3>

              <div className="space-y-3">
                <label className="form-field">
                  <span className="form-label">プラン名</span>
                  <input
                    className="form-input"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="例：スタンダード"
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">月額料金（円）</span>
                  <input
                    type="number"
                    className="form-input"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    placeholder="例：800"
                    min={100}
                  />
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowPlanModal(false)}
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={createPlan}
                    disabled={!newPlanName || !newPlanPrice}
                  >
                    作成
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
