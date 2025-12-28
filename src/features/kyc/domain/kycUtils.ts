//front/src/features/kyc/domain/kycUtils.ts

export function approvalStatusLabel(s: string) {
  switch (s) {
    case 'requested': return '申請中';
    case 'approved': return '承認済み';
    case 'paid': return '送金済み';
    case 'rejected': return '却下';
    default: return s;
  }
}