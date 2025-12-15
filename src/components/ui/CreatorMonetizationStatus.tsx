// front/src/components/ui/CreatorMonetizationStatus.tsx

import KycStatusBadge from "./KycStatusBadge";

type Props = {
  stripeKycStatus: string | null; // approved | pending | rejected | ...
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeKycDisabledReason?: string | null;
  stripeKycFieldsDue?: string[];
  onClickFix?: () => void; // rejected のときに表示する「修正する」ボタン
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

  const isApproved = stripeKycStatus === "approved";
  const isPending = stripeKycStatus === "pending";
  const isRejected = stripeKycStatus === "rejected";

  // 収益化ざっくり判定（Stripe的に “受け取れる/出金できる” が重要）
  const monetizationTone =
    stripeChargesEnabled && stripePayoutsEnabled
      ? "green"
      : stripeChargesEnabled || stripePayoutsEnabled
      ? "yellow"
      : "red";

  const monetizationText =
    stripeChargesEnabled && stripePayoutsEnabled
      ? "収益化OK"
      : stripeChargesEnabled && !stripePayoutsEnabled
      ? "出金準備中"
      : !stripeChargesEnabled && stripePayoutsEnabled
      ? "決済準備中"
      : "収益化NG";

  const dueCount = stripeKycFieldsDue?.length ?? 0;

  return (
    <div className="creator-status">
      <div className="creator-status-row">
        <span className="creator-status-label">本人確認</span>
        <KycStatusBadge status={stripeKycStatus} disabledReason={stripeKycDisabledReason} />
        <SmallBadge tone={monetizationTone}>{monetizationText}</SmallBadge>
      </div>

      <div className="creator-status-row">
        <SmallBadge tone={stripeChargesEnabled ? "green" : "gray"}>
          決済 {stripeChargesEnabled ? "有効" : "無効"}
        </SmallBadge>
        <SmallBadge tone={stripePayoutsEnabled ? "green" : "gray"}>
          出金 {stripePayoutsEnabled ? "有効" : "無効"}
        </SmallBadge>

        {dueCount > 0 && (
          <span className="creator-status-hint">
            本人確認が未完了です（{dueCount}項目）
          </span>
        )}
      </div>

      {(isPending || (!isApproved && dueCount > 0)) && (
        <div className="creator-status-note">
          ※本人確認が完了すると、出金が可能になります。
        </div>
      )}

      {isRejected && (
        <div className="creator-status-actions">
          <div className="creator-status-note">
            ※本人確認が否認されています。内容を修正して再提出してください。
          </div>
          {onClickFix && (
            <button type="button" className="btn btn-primary btn-sm" onClick={onClickFix}>
              修正する
            </button>
          )}
        </div>
      )}
    </div>
  );
}
