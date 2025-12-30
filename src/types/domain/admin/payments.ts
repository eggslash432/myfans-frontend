
export type AdminSalesBreakdown = {
  month: string; // YYYY-MM
  // 支払総額（paid）
  grossAmountJpy: number;

  // 分配（Paymentスナップショット集計）
  platformAmountJpy: number;
  shopAmountJpy: number;
  creatorAmountJpy: number;

  // 任意（あれば）
  stripeFeeJpy?: number;

  // 件数
  paidCount: number;
};

export type AdminPaymentRow = {
  id: string;
  paidAt: string | null;
  amountJpy: number;

  // スナップショット
  platformAmountJpy: number | null;
  shopAmountJpy: number | null;
  creatorAmountJpy: number | null;
  stripeFeeJpy: number | null;

  // 紐づけ
  creatorId: string | null; // ※現状は creator.userId 想定
  shopId: string | null;

  externalTxId: string | null;
};
