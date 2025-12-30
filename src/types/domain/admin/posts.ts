import type { 
  PublishedStatus, 
  Visibility 
} from "../../prisma";

//
export type AdminPost = {
  id: string;
  title: string;
  visibility: Visibility;
  priceJpy: number | null;
  publishedStatus: PublishedStatus;
  publishedAt: string | null;
  createdAt: string;
  creatorId: string | null;
  creatorName: string; 
  reportsCount: number;
};

export type UiAdminPost = {
  id: string;
  title: string;
  body: string;
  dateStr: string;
};