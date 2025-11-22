// src/pages/posts/NewPost.tsx
import {useState, useEffect} from 'react';
import { api, createPostSmart } from '../../lib/api';
import { getMyPlans } from '../../lib/api';
import type { AgeRating, Visibility } from '../../shared/prisma-enums';
import MediaUploader from '../../components/MediaUploader';
import type { Plan } from '../../shared/types';

async function fetchMyPlans(): Promise<Plan[]> {
  try {
    const plans = await getMyPlans(); // ← これが Plan[]
    return plans ?? [];
  } catch {
    return [];
  }
}

// 追加：undefined/null/空文字のキーを落とす（ネストにも対応）
function prune<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(prune).filter(v => v !== undefined && v !== null) as any;
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

export default function NewPost() {
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

  // ★ 追加：作成した投稿のID（これが取れたらメディアアップロード可能）
  const [createdPostId, setCreatedPostId] = useState<string | null>(null); 
  
  const [creator, setCreator] = useState<any | null>(null);
  const [creatorErr, setCreatorErr] = useState('');

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans = await fetchMyPlans();
        setPlans(plans ?? []);
      } catch {
        setPlans([]);
      }
    };
    loadPlans();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/creators/me');
        setCreator(res.data);
      } catch (e: any) {
        setCreatorErr(
          e?.response?.data?.message ?? e?.message ?? 'クリエイター情報の取得に失敗しました',
        );
      }
    })();
  }, []);  

  // visibility が変わったら不要な値をクリア
  useEffect(() => {
    if (visibility !== 'plan') setSelectedPlanId('');
    if (visibility !== 'paid_single') setPpvPrice('500');
  }, [visibility]);

  const buildPayload = () => {
    const base: any = {
      title: title.trim(),
      body,
      visibility,           // 'free' | 'plan' | 'paid_single'
      ageRating,            // 'all'  | 'r18'
      publishedStatus: isDraft ? 'draft' : 'published',
      accessRules: {
        allowByPlanIds: [],
        allowByPpv: false,
        // ppvPriceJpy は paid_single の時だけ付ける
      },
    };

    if (visibility === 'free') {
      // 余計なキーは持たせない
      // planId / priceJpy は付けない
    }

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

    // ← ここが重要：不要キーを完全除去してから返す
    return prune(base);
  };

  // 自分のプラン一覧を取得
  async function loadPlans() {
    try {
      const me = await api.get('/auth/me');
      const list = await api.get(`/plans?creatorId=${me.id}`);
      setPlans(list);
    } catch (e) {
      console.error('プラン取得失敗', e);
    }
  }

  useEffect(() => { loadPlans(); }, []);

  // 新規プランを作成
  async function createPlan() {
    if (!newPlanName || !newPlanPrice) return;
    try {
      const res = await api.post('/plans', {
        name: newPlanName,
        priceJpy: parseInt(newPlanPrice, 10),
      });
      console.log('プラン作成成功', res);
      setShowPlanModal(false);
      setNewPlanName('');
      setNewPlanPrice('');
      await loadPlans(); // 再読込
      setSelectedPlanId(res.id);
    } catch (e: any) {
      alert(`プラン作成に失敗：${e.data?.message || e.message}`);
      console.error(e);
    }
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setCreatedPostId(null); // 新規投稿のたびにリセット

    try {
      if (!title.trim()) throw new Error('タイトルを入力してください');
      if (!body) throw new Error('本文を入力してください');

      const payload = buildPayload();

      setSubmitting(true);
      const res:any = await createPostSmart(payload);  // ← 修正箇所
      console.log('create post result:', res); // デバッグ用（あってもOK）

      // 取り得るパターンを全部なめる
      const postId =
        res?.postId ??
        res?.post?.id ??
        res?.id ??
        res?.data?.postId ??
        res?.data?.post?.id ??
        res?.data?.id;

      if (postId) {
        setCreatedPostId(postId);
        setOkMsg('投稿が完了しました。続けてメディアをアップロードできます。');
      } else {
        // ここではもう throw しない（投稿自体は成功しているので）
        setOkMsg('投稿が完了しました。（投稿IDの取得にはまだ対応していません）');
      }

      setCreatedPostId(postId);
      setOkMsg('投稿が完了しました。続けてメディアをアップロードできます。');

      setTitle('');
      setBody('');
    } catch (e: any) {
      const msg = e?.message ?? (typeof e === 'string' ? e : JSON.stringify(e));
      setError(`投稿失敗: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const kyc = creator?.kyc ?? {};
  const kycStatus = kyc.status ?? creator?.stripeKycStatus ?? 'pending';
  const isKycOk = kycStatus === 'verified';  

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新規投稿作成</h1>

      {creatorErr === 'creator not found' && (
        <div className="p-3 border border-red-400 text-red-700">
          クリエイター登録がまだ行われていません。
          マイページからクリエイター登録を行ってください。
        </div>
      )}

      {!isKycOk && (
        <div className="p-3 border border-yellow-400 text-yellow-800">
          本人確認（KYC）が完了していないため、投稿機能はご利用いただけません。
        </div>
      )}      

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <textarea
            placeholder="本文（Markdown可）"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full rounded border p-3"
          />
        </div>

        {/* 可視性 */}
        <div className="space-y-2">
          <div className="font-semibold">公開範囲</div>
          <div className="flex items-center gap-6">
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
              />
              <span>有料（購読者限定）</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'paid_single'}
                onChange={() => setVisibility('paid_single')}
              />
              <span>PPV</span>
            </label>
          </div>

          {/* visibility=plan のときだけプラン選択 */}
          {visibility === 'plan' && (
            <div className="mt-2">
              <select
                className="rounded border p-2 min-w-[240px]"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                <option value="">プランを選択</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.priceJpy ? `（¥${p.priceJpy} /月）` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-sm border rounded px-2 py-1 hover:bg-gray-50"
                onClick={() => setShowPlanModal(true)}
              >
                ＋ 新しいプランを作成
              </button>
              {plans.length === 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  プランが取得できませんでした。先にプランを作成してください。
                </div>
              )}
            </div>
          )}

          {/* 💬 新規プラン作成ダイアログ */}
          {showPlanModal && (
            <div className="fixed inset-0 z-50">
              {/* 背景オーバーレイ */}
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setShowPlanModal(false)}
              />
              {/* 本体 */}
              <div className="relative mx-auto my-24 w-full max-w-md rounded-xl bg-white shadow-lg p-5">
                <h3 className="text-lg font-semibold mb-4">新しいプランを作成</h3>

                <div className="space-y-3">
                  <label className="block text-sm">
                    プラン名
                    <input
                      className="mt-1 w-full border rounded px-2 py-1"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      placeholder="例：スタンダード"
                    />
                  </label>

                  <label className="block text-sm">
                    月額料金（円）
                    <input
                      type="number"
                      className="mt-1 w-full border rounded px-2 py-1"
                      value={newPlanPrice}
                      onChange={(e) => setNewPlanPrice(e.target.value)}
                      placeholder="例：800"
                      min={100}
                    />
                  </label>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="border rounded px-3 py-1"
                      onClick={() => setShowPlanModal(false)}
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      className="bg-black text-white rounded px-3 py-1 disabled:opacity-50"
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

          {/* visibility=paid_single のときだけ価格入力 */}
          {visibility === 'paid_single' && (
            <div className="mt-2 flex items-center gap-2">
              <label className="text-sm text-gray-700">PPV 価格（円）</label>
              <input
                type="number"
                min={100}
                step={100}
                value={ppvPrice}
                onChange={(e) => setPpvPrice(e.target.value)}
                className="rounded border p-2 w-40"
              />
            </div>
          )}
        </div>

        {/* 年齢区分 */}
        <div className="space-y-2">
          <div className="font-semibold">年齢区分</div>
          <div className="flex items-center gap-6">
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
          <div className="font-semibold">公開設定</div>
          <div className="flex items-center gap-6">
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

        <div>
          <button
            type="submit"
            disabled={!isKycOk || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? '投稿中...' : '投稿する'}
          </button>
        </div>

        {error && <div className="text-red-600 whitespace-pre-wrap">投稿失敗: {error}</div>}
        {okMsg && <div className="text-green-700">{okMsg}</div>}
      </form>

      {/* ★ 投稿完了後にだけメディアアップロード UI を表示 */}
      {createdPostId && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-3">メディアをアップロード</h2>
          <p className="text-sm text-gray-600 mb-3">
            画像や動画をアップロードすると、この投稿に紐づくメディアとして表示されます。
          </p>
          <MediaUploader
            postId={createdPostId}
            onUploaded={() => {
              // ここで投稿詳細の再取得などをしたければ追加
              alert('メディアのアップロードが完了しました');
            }}
          />
        </div>
      )}      
    </div>
  );
}
