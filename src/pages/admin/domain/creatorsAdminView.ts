// front/src/pages/admin/domain/creatorsAdminView.ts
import type { 
  CreatorApplication, 
} from "@/shared";



export function filterByKeyword(list: CreatorApplication[], q: string) {
  const keyword = q.trim().toLowerCase();
  if (!keyword) return list;

  return list.filter((x) => {
    return (
      (x.email ?? "").toLowerCase().includes(keyword) ||
      (x.publicName ?? "").toLowerCase().includes(keyword) ||
      (x.displayName ?? "").toLowerCase().includes(keyword)
    );
  });
}
