export interface Subscription {
  id: string;
  planName: string;
  nextBillingDate?: string | null;
  status?: 'active' | 'past_due' | 'canceled' | 'incomplete' | string;
}

export interface Me {
  id: string;
  nickname?: string | null;
  email: string;
  subscription?: Subscription | null;
}

export interface PaymentRecord {
  id: string;
  amountJpy: number;
  status: 'paid' | 'unpaid' | 'refunded' | string;
  createdAt: string; // ISO
  paidAt?: string | null;
}
