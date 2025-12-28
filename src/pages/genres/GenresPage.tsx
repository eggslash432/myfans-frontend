// front/src/pages/genres/GenresPage.tsx
import { useNavigate } from "react-router-dom";
import { useGenresData } from "@/hooks";

export function GenresPage() {
  const navigate = useNavigate();
  const { genres } = useGenresData();

  return (
    <div className="page">
      <div className="section-title">ジャンル一覧</div>

      <div className="genre__grid">
        {genres.map((g) => (
          <button
            key={g.id}
            type="button"
            className="genre__item"
            onClick={() => navigate(`/genres/${g.id}`)}
          >
            <div className="genre__name">{g.name}</div>
            <div className="genre__count">
              {g.count ? `${g.count.toLocaleString()} 件` : "投稿あり"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
