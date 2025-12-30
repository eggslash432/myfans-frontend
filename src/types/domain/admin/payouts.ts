import type { 
  PayoutStatus, 
  PayoutTargetType 
} from "@/shared/prisma-enums";


export type AdminPayout = {
  id: string;

  // 出金対象
  targetType: PayoutTargetType;

  // 金額・状態
  amountJpy: number;
  
  payoutStatus: PayoutStatus;

  // 日時
  requestedAt: string;
  paidAt?: string | null;

  // CREATOR 出金用
  creatorId?: string | null;
  creator?: {
    userId: string;
    publicName: string;
  } | null;

  // SHOP 出金用
  shopId?: string | null;
  shop?: {
    id: string;
    name: string;
  } | null;

  // 管理メモ
  note?: string | null;
};

export type ApprovePayoutResult = { 
  transferId?: string; 
  [key: string]: unknown 
};