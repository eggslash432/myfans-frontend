// front/src/components/ui/CreatorMonetizationStatus.tsx

import KycStatusBadge from "./KycStatusBadge";

type Props = {
  stripeKycStatus: string | null; // approved | pending | rejected | ...
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeKycDisabledReason?: string | null;
  stripeKycFieldsDue?: string[];
  onClickFix?: () => void; // ← “開始/続き/修正” 共通で使う
};

function SmallBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "yellow" | "red" | "gray";
}) {
  const cls =
    tone === "green"
      ? "badge badge-green"
      : tone === "yellow"
      ? "badge badge-yellow"
      : tone === "red"
      ? "badge badge-red"
      : "badge badge-gray";
  return <span className={cls}>{children}</span>;
}

export default function CreatorMonetizationStatus(props: Props) {
  const {
    stripeKycStatus,
    stripeChargesEnabled,
    stripePayoutsEnabled,
    stripeKycDisabledReason,
    stripeKycFieldsDue = [],
    onClickFix,
  } = props;

  // ✅ 追加：未開始フェーズ
  const isNotStarted = stripeKycStatus == null;

  const isApproved = stripeKycStatus === "approved";
  const isPending = stripeKycStatus === "pending";
  const isRejected = stripeKycStatus === "rejected";

  const dueCount = stripeKycFieldsDue?.length ?? 0;

  // ✅ 収益化ざっくり判定
  // 未開始のときは “NG” ではなく “未設定” 扱いにしてユーザー混乱を防ぐ
  const monetizationTone =
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

        <SmallBadge tone={monetizationTone}>{monetizationText}</SmallBadge>
      </div>

      <div className="creator-status-row">
        <SmallBadge tone={stripeChargesEnabled ? "green" : "gray"}>
          決済 {stripeChargesEnabled ? "有効" : "無効"}
        </SmallBadge>
        <SmallBadge tone={stripePayoutsEnabled ? "green" : "gray"}>
          出金 {stripePayoutsEnabled ? "有効" : "無効"}
        </SmallBadge>

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
      {(isPending || (!isApproved && dueCount > 0)) && !isNotStarted && !isRejected && (
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
