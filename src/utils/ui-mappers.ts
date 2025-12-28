// front/src/shared/utils/ui-mappers.ts
import type { UiAdminPost, UiCreator } from "@/shared";

export function toInitial(name: string) {
  const trimmed = String(name ?? "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function toDisplayName(c: any) {
  const name =
    c.publicName ??
    c.displayName ??
    c.name ??
    (c.email ? c.email.split("@")[0] : "クリエイター");
  return String(name).trim() || "クリエイター";
}

export function toCreatorUi(c: any): UiCreator {
  const displayName = toDisplayName(c);
  return {
    id: String(c.id),
    avatarUrl: c.avatarUrl ?? c.profileImageUrl ?? null,
    displayName,
    initial: toInitial(displayName),
    bio: c.bio || "自己紹介はまだ登録されていません。",
    postCount: Number(c.postCount ?? c.postsCount ?? 0),
    fanCount: Number(c.fanCount ?? c.subscriberCount ?? 0),
  };
}

export function toAdminPostUi(p: any): UiAdminPost {
  const dateRaw = p.publishedAt || p.createdAt;
  const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString("ja-JP") : "";
  return {
    id: String(p.id),
    title: p.title || "（お知らせ）",
    body: p.body || "詳細を見る",
    dateStr,
  };
}