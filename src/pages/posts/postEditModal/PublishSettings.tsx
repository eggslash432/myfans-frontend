// front/src/pages/posts/PostEditModal/PublishSettings.tsx
import type { PublishedStatus, Visibility } from "@/shared";

export function PublishSettings(props: {
  isAdminAccount: boolean;
  isPublished: boolean;

  visibility: Visibility;
  setVisibility: (v: Visibility) => void;

  priceJpy: number | null;
  setPriceJpy: (n: number | null) => void;

  status: PublishedStatus;
  setStatus: (s: PublishedStatus) => void;
}) {
  const {
    isAdminAccount,
    isPublished,
    visibility,
    setVisibility,
    priceJpy,
    setPriceJpy,
    status,
    setStatus,
  } = props;

  return (
    <>
      <div>
        <div className="modal-label">公開タイプ</div>
        <select
          value={visibility}
          disabled={isPublished}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="modal-select"
        >
          <option value="free">無料</option>
          {!isAdminAccount && (
            <>
              <option value="plan">プラン限定</option>
              <option value="paid_single">PPV</option>
            </>
          )}
        </select>

        {isPublished && (
          <div className="text-xs text-gray-500 mt-1">
            ※ 公開後は販売条件（公開タイプ・価格）は変更できません
          </div>
        )}
      </div>

      {!isAdminAccount && visibility === "paid_single" && !isPublished && (
        <div>
          <div className="modal-label">価格（円）</div>
          <input
            type="number"
            className="modal-input"
            value={priceJpy ?? ""}
            onChange={(e) => setPriceJpy(e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      )}

      <div>
        <div className="modal-label">公開ステータス</div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PublishedStatus)}
          className="modal-select"
        >
          <option value="draft">下書き</option>
          <option value="published">公開</option>
          <option value="private">非公開</option>
        </select>
      </div>
    </>
  );
}
