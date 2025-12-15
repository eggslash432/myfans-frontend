// front/src/pages/creators/CreatorProfilePage.tsx

import { useEffect, useRef, useState } from 'react';
import { 
  API_ORIGIN,
  getCreatorMe, 
  updateCreatorProfile, 
  uploadCreatorAvatar 
} from '../../lib/api';

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
        const data = await getCreatorMe();

        setPublicName(data.publicName ?? '');
        setBio(data.bio ?? '');
        setAvatarUrl(data.avatarUrl ?? '');   // ← サーバの値はここにだけ入れる
        setAvatarPreviewUrl('');              // ← 初期表示時はプレビューは空
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

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);  

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
        const uploadRes = await uploadCreatorAvatar(avatarFile);
        avatarUrlToSave = uploadRes.url;
        setAvatarUrl(avatarUrlToSave);
      }

      const updated = await updateCreatorProfile({
        publicName,
        bio,
        avatarUrl: avatarUrlToSave,
      });
      console.log('updateMe', updated);

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

  // プレビュー用の最終的な src を決める
  const avatarSrc =
    avatarPreviewUrl
      ? avatarPreviewUrl                             // ファイル選択後は blob:... を優先
      : avatarUrl
      ? avatarUrl.startsWith('http')
        ? avatarUrl                                  // すでにフルURLならそのまま
        : `${API_ORIGIN}${avatarUrl}`                // /uploads/... → http://localhost:3000/uploads/...
      : '';  

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

        {avatarSrc && (
          <div className="flex justify-center mt-2">
            <img
              src={avatarSrc}
              alt="avatar preview"
              className="profile-avatar-preview"
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
