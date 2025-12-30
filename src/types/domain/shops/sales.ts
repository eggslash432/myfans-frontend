// front/src/shared/types/domain/shops/sales.ts
import type { ShopSalesRange } from "./roles";

export type ShopSalesSummary = {
  range: ShopSalesRange;
  gross: number;        // 総売上
  platformFee: number;  // 手数料
  net: number;          // 入金対象
  transactions: number; // 取引数
};
