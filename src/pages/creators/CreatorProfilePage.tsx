// front/src/pages/creators/CreatorProfilePage.tsx

import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import type { CreatorMeResponse } from '../../shared/types';

export default function CreatorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // フォーム用
  const [publicName, setPublicName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);  // 👈 追加

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<CreatorMeResponse>('/creators/me');
        const data = res.data;

        setPublicName(data.publicName ?? '');
        setBio(data.bio ?? '');
        setAvatarUrl(data.avatarUrl ?? '');
        setAvatarPreviewUrl(data.avatarUrl ?? '');
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

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file); // ローカルプレビュー用
    setAvatarPreviewUrl(objectUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    setErr('');

    try {
      let avatarUrlToSave = avatarUrl;

      // 画像アップロード部分だけ修正
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);

        const uploadRes = await api.post<{ url: string }>(
          '/creators/me/avatar',
          formData,
          {
            json: false, // ★ JSON.stringify させない
            headers: {
              // fetch が自動で boundary 付けるので、本当はこれも省略推奨だが、
              // 既に他で multipart を使っているなら合わせてOK
              // 'Content-Type': 'multipart/form-data',
            },
          },
        );

        avatarUrlToSave = uploadRes.data.url;
        setAvatarUrl(avatarUrlToSave);
      }

      // 型が unknown なので、結果は使わず await だけ
      await api.updateCreatorProfile({
        publicName,
        bio,
        avatarUrl: avatarUrlToSave,
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
          <label className="form-label">アイコン画像を選択</label>

          <div className="flex items-center gap-3">
            {/* カスタムボタン */}
            <button
              type="button"
              className="btn btn-secondary px-4 py-2 rounded-lg shadow hover:shadow-md"
              onClick={() => fileInputRef.current?.click()}   // ← ここで input をクリック
            >
              ファイルを選択
            </button>

            {/* 選択中ファイル名の表示 */}
            {avatarFile && (
              <span className="text-sm text-gray-600">
                {avatarFile.name}
              </span>
            )}
          </div>

          {/* 実際の input（非表示） */}
          <input
            ref={fileInputRef}
            id="avatar-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarFileChange}
          />

          <p className="mt-1 text-xs text-gray-500">
            画像ファイルを選択すると自動プレビュー後、保存時にアップロードされます。
          </p>
        </div>

        {(avatarPreviewUrl || avatarUrl) && (
          <div className="flex justify-center mt-2">
            <img
              src={avatarPreviewUrl || avatarUrl}
              alt="avatar preview"
              className="w-24 h-24 rounded-full object-cover shadow"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full py-3 text-base rounded-xl shadow-lg hover:shadow-xl mt-4"
        >
          {saving ? '保存中…' : '保存する'}
        </button>
      </section>
    </div>
  );
}
