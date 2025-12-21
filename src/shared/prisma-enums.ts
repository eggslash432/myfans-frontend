export type Role = 'user' | 'sub_admin' | 'admin';

export type ShopMemberRole = 'owner' | 'admin' | 'staff';

export type CreatorApprovalStatus = 'pending' | 'approved' | 'rejected';

export type KycStatus = 'pending' | 'approved' | 'rejected';

export type PublishedStatus = 'draft' | 'published' | 'private';

export type Visibility = 'free' | 'plan' | 'paid_single';

export type AgeRating = 'all' | 'r18';

export type MediaType = 'image' | 'video' | 'audio';

export type BillingInterval = 'month' | 'year';

export type CheckoutMode = 'payment' | 'subscription';

export type PaymentKind = 'subscription' | 'one_time';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type SubStatus = 'active' | 'trialing' | 'past_due' | 'incomplete' | 'canceled';

export type TransferKind = 'platform' | 'shop' | 'creator';

export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export type PlanModalMode = 'create' | 'edit';
