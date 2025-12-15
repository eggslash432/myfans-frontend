// front/src/components/ui/KycStatusBadge.tsx
export default function KycStatusBadge({
  status,
  disabledReason,
}: {
  status: string | null | undefined;
  disabledReason?: string | null;
}) {
  // ✅ 未開始（KYCまだstartしてない）
  if (status == null) {
    return <span className="badge">未開始</span>;
  }

  if (status === "approved") return <span className="badge badge-success">完了</span>;
  if (status === "pending") return <span className="badge badge-warning">審査中</span>;
  if (status === "rejected") return <span className="badge badge-red">差し戻し</span>;

  // disabledReasonが来る設計ならここで「要対応」に寄せてもOK
  if (disabledReason) return <span className="badge badge-red">要対応</span>;

  return <span className="badge">確認中</span>;
}
