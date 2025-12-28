// front/src/components/PostsList.tsx
import type { PostSummary } from "@/shared";
import { StatusBadge } from "./ui";

export function PostsList({ items, onOpenEdit }: { items: PostSummary[]; onOpenEdit: (p: PostSummary) => void }) {
  return (
    <ul className="divide-y divide-gray-100 mt-2">
      {items.map((p) => (
        <li key={p.id} className="py-2 text-sm flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{p.title}</div>
            <StatusBadge status={p.publishedStatus} />
          </div>
          <button
            onClick={() => onOpenEdit(p)}
            className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
          >
            <span>詳細・編集</span>
            <span style={{ fontSize: '12px' }}>›</span>
          </button>
        </li>
      ))}
    </ul>
  );
}