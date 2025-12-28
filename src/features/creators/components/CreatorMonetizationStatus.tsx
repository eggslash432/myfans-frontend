// front/src/components/ui/CreatorMonetizationStatus.tsx

import {Badge } from "@/components";
import { KycStatusBadge } from "@/features/kyc";
import type { BadgeTone } from "@/shared";

type Props = {
  stripeKycStatus: string | null; // approved | pending | rejected | ...
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeKycDisabledReason?: string | null;
  stripeKycFieldsDue?: string[];
  onClickFix?: () => void; // ← “開始/続き/修正” 共通で使う
};

function toneFromLegacy(tone: "green" | "yellow" | "red" | "gray"): BadgeTone {
  switch (tone) {
    case "green":
      return "success";
    case "yellow":
      return "warning";
    case "red":
      return "danger";
    case "gray":
    default:
      return "muted";
  }
}

export function CreatorMonetizationStatus(props: Props) {
  const {
    stripeKycStatus,
    stripeChargesEnabled,
    stripePayoutsEnabled,
    stripeKycDisabledReason,
    stripeKycFieldsDue = [],
    onClickFix,
  } = props;

  // ✅ 未開始フェーズ
  const isNotStarted = stripeKycStatus == null;

  const isApproved = stripeKycStatus === "approved";
  const isPending = stripeKycStatus === "pending";
  const isRejected = stripeKycStatus === "rejected";

  const dueCount = stripeKycFieldsDue?.length ?? 0;

  // ✅ 収益化ざっくり判定
  const monetizationTone: "green" | "yellow" | "red" | "gray" =
    isNotStarted
      ? "gray"
      : stripeChargesEnabled && stripePayoutsEnabled
      ? "green"
      : stripeChargesEnabled || stripePayoutsEnabled
      ? "yellow"
      : "red";

  const monetizationText =
    isNotStarted
      ? "未設定"
      : stripeChargesEnabled && stripePayoutsEnabled
      ? "収益化OK"
      : stripeChargesEnabled && !stripePayoutsEnabled
      ? "出金準備中"
      : !stripeChargesEnabled && stripePayoutsEnabled
      ? "決済準備中"
      : "収益化NG";

  // ✅ ボタン文言（onClickFix を共通利用）
  const actionLabel = isRejected
    ? "修正する"
    : isPending
    ? "本人確認を続ける"
    : isNotStarted
    ? "本人確認を開始"
    : null;

  const showActionButton =
    !!onClickFix && (isNotStarted || isPending || isRejected);

  return (
    <div className="creator-status">
      <div className="creator-status-row">
        <span className="creator-status-label">本人確認</span>

        {/* ✅ KycStatusBadge 側も status=null なら “未開始” 表示にしてね */}
        <KycStatusBadge
          status={stripeKycStatus}
          disabledReason={stripeKycDisabledReason}
        />

        <Badge tone={toneFromLegacy(monetizationTone)}>
          {monetizationText}
        </Badge>
      </div>

      <div className="creator-status-row">
        <Badge tone={stripeChargesEnabled ? "success" : "muted"}>
          決済 {stripeChargesEnabled ? "有効" : "無効"}
        </Badge>

        <Badge tone={stripePayoutsEnabled ? "success" : "muted"}>
          出金 {stripePayoutsEnabled ? "有効" : "無効"}
        </Badge>

        {/* ✅ 未開始では “未完了です” を出さない（まだ始めてないので） */}
        {!isNotStarted && dueCount > 0 && (
          <span className="creator-status-hint">
            本人確認が未完了です（{dueCount}項目）
          </span>
        )}
      </div>

      {/* ✅ 未開始メッセージ */}
      {isNotStarted && (
        <div className="creator-status-note">
          ※本人確認（Stripe）を開始すると、決済・出金の有効化が進められます。
        </div>
      )}

      {/* ✅ 審査中/不足あり */}
      {(isPending || (!isApproved && dueCount > 0)) &&
        !isNotStarted &&
        !isRejected && (
          <div className="creator-status-note">
            ※本人確認が完了すると、出金が可能になります。
          </div>
        )}

      {/* ✅ 差し戻し */}
      {isRejected && (
        <div className="creator-status-actions">
          <div className="creator-status-note">
            ※本人確認が否認されています。内容を修正して再提出してください。
          </div>
        </div>
      )}

      {/* ✅ アクションボタン */}
      {showActionButton && actionLabel && (
        <div className="creator-status-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onClickFix}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
