import type { PickUser } from "@/shared";

export function unwrapUserSearchItems(data: any): PickUser[] {
  if (!data) return [];
  const items = Array.isArray(data)
    ? data
    : (data.items ?? data.users ?? []);
  if (!Array.isArray(items)) return [];

  return items
    .map((u: any) => ({
      id: String(u.id ?? ""),
      email: String(u.email ?? ""),
      displayName: u.displayName ?? u.publicName ?? u.name ?? null,
      role: u.role ?? null,
    }))
    .filter((u) => u.id && u.email);
}
