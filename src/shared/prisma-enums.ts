//src/shared/prisma-enums.ts
//schema.prisma の enum 定義を TypeScript 化したもの

export type Role = 'fan' | 'creator' | 'admin' | 'sub_admin';

export type KycStatus = 'pending' | 'approved' | 'rejected';

export type PublishedStatus = 'draft' | 'published' | 'private';

export type SubStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';

export type Visibility = 'free' | 'plan' | 'paid_single';

export type AgeRating = 'all' | 'r18';

export type MediaType = 'image' | 'video' | 'audio';

export type PaymentKind = 'subscription' | 'one_time';

export type PaymentStatus = 'paid' | 'refunded' | 'failed' | 'pending';

export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

export type BillingInterval = 'month' | 'year';

export type PlanModalMode = 'create' | 'edit';