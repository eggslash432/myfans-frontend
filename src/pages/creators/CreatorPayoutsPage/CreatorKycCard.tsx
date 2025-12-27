// front/src/pages/creator/CreatorPayoutsPage/CreatorKycCard.tsx
import {KycStatusBadge} from "@/components";

export function CreatorKycCard(props: {
  kycStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  disabledReason: string | null;
  fieldsDue: string[];
  needsOnboarding: boolean;
  busyOnboarding: boolean;
  onStartOrResume: () => void;
}) {
  const {
    kycStatus,
    chargesEnabled,
    payoutsEnabled,
    disabledReason,
    fieldsDue,
    needsOnboarding,
    busyOnboarding,
    onStartOrResume,
  } = props;

  const onboardingLabel =
    kycStatus === "rejected"
      ? "本人確認を修正して再提出"
      : kycStatus === "pending"
      ? "本人確認の状況を確認・再開"
      : kycStatus === "approved"
      ? "Stripe設定を確認"
      : "本人確認を開始";

  const monetizationText =
    chargesEnabled && payoutsEnabled
      ? "収益化OK"
      : chargesEnabled && !payoutsEnabled
      ? "出金準備中"
      : !chargesEnabled && payoutsEnabled
      ? "決済準備中"
      : "収益化NG";

  const monetizationTone =
    chargesEnabled && payoutsEnabled
      ? "badge-green"
      : chargesEnabled || payoutsEnabled
      ? "badge-yellow"
      : "badge-red";

  return (
    <section className="card space-y-2">
      <div className="section-title">本人確認（Stripe）</div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">状態</span>
        <KycStatusBadge status={kycStatus as any} disabledReason={disabledReason} />
        <span className={`badge ${monetizationTone}`}>{monetizationText}</span>

        <span className="text-xs text-gray-400">
          決済:{chargesEnabled ? "有効" : "無効"} / 出金:{payoutsEnabled ? "有効" : "無効"}
        </span>
      </div>

      {fieldsDue.length > 0 && (
        <div className="text-xs text-gray-600">
          本人確認が未完了です（{fieldsDue.length}項目）
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-gray-500">
              未完了項目を表示
            </summary>
            <ul className="list-disc pl-5 mt-1">
              {fieldsDue.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {kycStatus === "rejected" && (
        <div className="text-xs text-red-600">
          否認されています。内容を修正して再提出してください。
          {disabledReason && (
            <div className="text-xs text-gray-500 mt-1">理由: {disabledReason}</div>
          )}
        </div>
      )}

      {needsOnboarding ? (
        <button
          type="button"
          className="btn btn-primary w-full justify-center"
          disabled={busyOnboarding}
          onClick={onStartOrResume}
        >
          {busyOnboarding ? "リンク作成中…" : onboardingLabel}
        </button>
      ) : (
        <p className="text-xs text-gray-500">
          本人確認は完了しています。出金が可能です。
        </p>
      )}
    </section>
  );
}
