// front/src/components/home/GenreGridSection.tsx
import type { Genre } from "../../pages/home/types";

type Props = {
  genres: Genre[];
  onOpenGenre: (id: string) => void;
  onMore: () => void;
};

export function GenreGridSection({ genres, onOpenGenre, onMore }: Props) {
  return (
    <section className="genre">
      <div className="genre__head">
        <span className="genre__icon" aria-hidden>
          ▦
        </span>
        <span className="genre__title">ジャンル一覧</span>
      </div>

      <div className="genre__grid">
        {genres.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onOpenGenre(g.id)}
            className="genre__item"
          >
            <div className="genre__name">{g.name}</div>
            <div className="genre__count">{g.count.toLocaleString()} 件</div>
          </button>
        ))}
      </div>

      <button type="button" onClick={onMore} className="genre__more">
        ジャンルをもっと見る <span aria-hidden>→</span>
      </button>
    </section>
  );
}
