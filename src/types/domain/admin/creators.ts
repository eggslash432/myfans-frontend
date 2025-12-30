export type PendingCreator = {
  userId: string;
  email: string;
  publicName: string | null;
  createdAt: string;
  isListed: boolean;
  stripeKycStatus?: string | null;
};