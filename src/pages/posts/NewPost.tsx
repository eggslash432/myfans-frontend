// src/pages/NewPost.tsx
import React from 'react';

type Visibility = 'free' | 'plan' | 'paid_single';
type AgeRating = 'all' | 'r18';

type Plan = { id: string; name: string; priceJpy?: number };

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

async function createPost(data: any) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
    },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try { return JSON.parse(text); } catch { return text; }
}

async function fetchMyPlans(): Promise<Plan[]> {
  const headers = { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` };
  // まず creators/me/plans を叩き、404等なら /plans にフォールバック
  const tryUrls = [`${API_BASE}/creators/me/plans`, `${API_BASE}/plans`];
  for (const url of tryUrls) {
    try {
      const r = await fetch(url, { headers });
      if (r.ok) {
        const j = await r.json();
        // 形だけざっくり吸収
        if (Array.isArray(j?.plans)) return j.plans;
        if (Array.isArray(j)) return j;
        if (j?.items && Array.isArray(j.items)) return j.items;
      }
    } catch { /* next */ }
  }
  return [];
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
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [visibility, setVisibility] = React.useState<Visibility>('free');
  const [ageRating, setAgeRating] = React.useState<AgeRating>('all');
  const [isDraft, setIsDraft] = React.useState(false);

  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>('');
  const [ppvPrice, setPpvPrice] = React.useState<string>('500');

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    // プランを取得（有料購読者限定の時に選択用）
    fetchMyPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  // visibility が変わったら不要な値をクリア
  React.useEffect(() => {
    if (visibility !== 'plan') setSelectedPlanId('');
    if (visibility !== 'paid_single') setPpvPrice('500');
  }, [visibility]);

  const buildPayload = () => {
    const base: any = {
      title: title.trim(),
      body,
      visibility,           // 'free' | 'plan' | 'paid_single'
      ageRating,            // 'all'  | 'r18'
      // isDraft は送らない（サーバが受けないので）
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


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setOkMsg(null);

  try {
    if (!title.trim()) throw new Error('タイトルを入力してください');
    if (!body) throw new Error('本文を入力してください');

    const payload = buildPayload();

    setSubmitting(true);
    await createPost(payload);  // ← 修正箇所
    setOkMsg('投稿が完了しました');

    // 投稿IDが返るなら自動遷移も可能
    // navigate(`/posts/${res.post?.id ?? res.id}`);

    setTitle('');
    setBody('');
  } catch (err: any) {
    setError(typeof err?.message === 'string' ? err.message : String(err));
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新規投稿作成</h1>

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
              {plans.length === 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  プランが取得できませんでした。先にプランを作成してください。
                </div>
              )}
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
            disabled={submitting}
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
          >
            {submitting ? '投稿中…' : '投稿する'}
          </button>
        </div>

        {error && <div className="text-red-600 whitespace-pre-wrap">投稿失敗: {error}</div>}
        {okMsg && <div className="text-green-700">{okMsg}</div>}
      </form>
    </div>
  );
}
