// front/src/pages/creators/CreatorProfilePage.tsx

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { CreatorMeResponse } from '../../shared/types';

export default function CreatorProfilePage() {
  const [creator, setCreator] = useState<CreatorMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // フォーム用
  const [publicName, setPublicName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // 初期読み込み
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/creators/me');
        const data = res.data;
        setCreator(data);

        // 初期値反映
        setPublicName(data.publicName ?? '');
        setBio(data.bio ?? '');
        setAvatarUrl(data.avatarUrl ?? '');

      } catch (e: any) {
        setErr(
          e?.response?.data?.message ??
            e?.message ??
            'プロフィール情報の取得に失敗しました'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateCreatorProfile({
        publicName,
        bio,
        avatarUrl,
      });

      alert('プロフィールを更新しました');
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ??
          e?.message ??
          'プロフィール更新に失敗しました'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">読み込み中…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="page space-y-4">
      <h1 className="page-title">プロフィール編集</h1>

      <section className="card space-y-3">
        <div className="form-field">
          <label className="form-label">表示名</label>
          <input
            type="text"
            value={publicName}
            onChange={(e) => setPublicName(e.target.value)}
            className="form-input"
            placeholder="例: creator123"
          />
        </div>

        <div className="form-field">
          <label className="form-label">自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="form-input"
            rows={3}
            placeholder="プロフィール文を入力してください"
          />
        </div>

        <div className="form-field">
          <label className="form-label">アイコン画像URL</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="form-input"
            placeholder="https://example.com/your-avatar.png"
          />
        </div>

        {avatarUrl && (
          <div className="flex justify-center mt-2">
            <img
              src={avatarUrl}
              alt="avatar preview"
              className="w-24 h-24 rounded-full object-cover shadow"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full"
        >
          {saving ? '保存中…' : '保存する'}
        </button>
      </section>
    </div>
  );
}
