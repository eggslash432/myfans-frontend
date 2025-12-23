// front/src/pages/posts/NewPostPage.tsx

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNewPostForm } from './newPost/useNewPostForm';
import { MediaPicker } from './newPost/MediaPicker';
import { PlanModal } from './newPost/PlanModal';
import { VisibilitySection } from './newPost/VisibilitySection';
import { AgeRatingSection } from './newPost/AgeRatingSection';
import { PublishStatusSection } from './newPost/PublishStatusSection';
import { isAdminRole } from '@/lib/authz';

export function NewPostPage() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  const f = useNewPostForm(isAdmin);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await f.submit();
  };

  const canSubmit = isAdmin || f.isDraft || f.isKycOk; // ✅ KYC未完了でも下書きならOK
  const submitDisabled = !canSubmit || f.submitting;

  return (
    <div className="page">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="page-title">新規投稿作成</h1>

        {/* クリエイター情報取得エラー（未登録/未承認もここに入る） */}
        {!isAdmin && f.creatorErr && (
          <section className="card">
            <div className="text-sm text-red-700">
              <div className="font-semibold mb-1">クリエイター情報の取得に失敗しました。</div>
              <div className="text-xs whitespace-pre-wrap">{f.creatorErr}</div>
            </div>
          </section>
        )}

        {/* KYCが未完了：公開は制限（下書きはOK） */}
        {!isAdmin && f.creator && !f.isKycOk && (
          <section className="card border border-yellow-300 bg-yellow-50/80">
            <p className="text-sm text-yellow-800">
              本人確認（KYC）が未完了のため、公開（Publish）や販売機能が制限されます。
              「下書き」で保存するか、先に「クリエイター設定」から本人確認を完了してください。
            </p>
          </section>
        )}

        {/* クリエイター情報が取れない（未登録/未承認）時の補足 */}
        {!isAdmin && !f.creator && (
          <section className="card border border-yellow-300 bg-yellow-50/80">
            <p className="text-sm text-yellow-800">
              クリエイター登録（または承認）が未完了の可能性があります。
              管理画面で承認後に投稿作成が利用できるようになります。
              （下書き保存だけ許可する運用にする場合は、API側の許可も必要です）
            </p>
          </section>
        )}

        <section className="card">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* タイトル */}
            <div className="form-field">
              <label className="form-label">タイトル</label>
              <input
                type="text"
                placeholder="タイトルを入力"
                value={f.title}
                onChange={(e) => f.setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            {/* 本文 */}
            <div className="form-field">
              <label className="form-label">本文（Markdown可）</label>
              <textarea
                placeholder="本文を入力してください"
                value={f.body}
                onChange={(e) => f.setBody(e.target.value)}
                rows={8}
                className="form-input"
              />
            </div>

            {/* メディア */}
            <MediaPicker
              mediaFilesCount={f.mediaFiles.length}
              mediaPreviews={f.mediaPreviews}
              sampleMediaIndex={f.sampleMediaIndex}
              fileInputRef={f.fileInputRef}
              onPickClick={() => f.fileInputRef.current?.click()}
              onClearAll={f.clearMedia}
              onChangeFiles={f.handleMediaChange}
              hasVideo={f.hasVideo}
              sampleSelected={f.sampleSelected}
              onClearSample={f.clearSample}
              onSelectSample={f.selectSample}
            />

            {/* 公開範囲 */}
            <VisibilitySection
              isAdmin={isAdmin}
              visibility={f.visibility}
              setVisibility={f.setVisibility}
              plans={f.plans}
              selectedPlanId={f.selectedPlanId}
              setSelectedPlanId={f.setSelectedPlanId}
              ppvPrice={f.ppvPrice}
              setPpvPrice={f.setPpvPrice}
              onOpenPlanModal={() => f.setShowPlanModal(true)}
            />

            {/* 年齢区分 */}
            <AgeRatingSection ageRating={f.ageRating} setAgeRating={f.setAgeRating} />

            {/* 公開/下書き */}
            <PublishStatusSection isDraft={f.isDraft} setIsDraft={f.setIsDraft} />

            {/* 送信ボタン */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitDisabled}
                className="btn btn-primary w-full sm:w-auto"
              >
                {f.submitting ? '投稿中…' : f.isDraft ? '下書きを保存' : '投稿する'}
              </button>

              {!isAdmin && !f.isKycOk && !f.isDraft && (
                <p className="mt-2 text-xs text-gray-500">
                  ※ 本人確認（KYC）が完了すると公開（Publish）が可能になります。いまは「下書き」で保存できます。
                </p>
              )}
            </div>

            {/* メッセージ */}
            {f.error && <div className="mt-2 text-sm text-red-600 whitespace-pre-wrap">{f.error}</div>}
            {f.okMsg && <div className="mt-2 text-sm text-green-700">{f.okMsg}</div>}
          </form>
        </section>

        <PlanModal
          open={f.showPlanModal}
          newPlanName={f.newPlanName}
          newPlanPrice={f.newPlanPrice}
          setNewPlanName={f.setNewPlanName}
          setNewPlanPrice={f.setNewPlanPrice}
          onClose={() => f.setShowPlanModal(false)}
          onCreate={f.createPlan}
        />
      </div>
    </div>
  );
}
