// front/src/components/home/GenreGridSection.tsx

import type { Genre } from "../../pages/home/types";

type Props = {
  genres: Genre[];
  onOpenGenre: (id: string) => void;
  onMore: () => void;
};

export function GenreGridSection({
  genres,
  onOpenGenre,
  onMore,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 font-semibold">
        <span className="text-pink-500">▦</span>
        <span>ジャンル一覧</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => onOpenGenre(g.id)}
            className="
              rounded-xl border bg-white px-4 py-3
              text-left
              hover:bg-pink-50
            "
          >
            <div className="font-semibold">{g.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {g.count.toLocaleString()} 件
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onMore}
        className="
          w-full mt-2 rounded-full border
          py-2 text-sm font-semibold
          text-pink-500
          hover:bg-pink-50
        "
      >
        ジャンルをもっと見る →
      </button>
    </section>
  );
}
