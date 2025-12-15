// front/src/components/ui/KycStatusBadge.tsx

type Props = {
  status: string | null;
  disabledReason?: string | null;
};

export default function KycStatusBadge({ status, disabledReason }: Props) {
  if (!status) {
    return (
      <span className="badge badge-gray">
        未確認
      </span>
    );
  }

  switch (status) {
    case 'approved':
      return (
        <span className="badge badge-green">
          本人確認 完了
        </span>
      );

    case 'pending':
      return (
        <span className="badge badge-yellow">
          本人確認 審査中
        </span>
      );

    case 'rejected':
      return (
        <span className="badge badge-red" title={disabledReason ?? undefined}>
          本人確認 否認
        </span>
      );

    default:
      return (
        <span className="badge badge-gray">
          不明
        </span>
      );
  }
}
