// front/src/components/home/CreatorCard.tsx

import type { UiCreator } from "../../pages/home/types";

export function CreatorCard({
  creator,
  onClick,
}: {
  creator: UiCreator;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="card-link w-full text-left">
      <div className="card flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-500 flex-shrink-0 overflow-hidden">
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{creator.initial}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{creator.displayName}</div>

          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {creator.bio}
          </div>

          <div className="mt-1 text-[11px] text-gray-400">
            投稿 {creator.postCount} 件
            {creator.fanCount ? `・ファン ${creator.fanCount} 人` : null}
          </div>
        </div>

        <div className="text-xs text-pink-500 flex-shrink-0">プロフィール ›</div>
      </div>
    </button>
  );
}
