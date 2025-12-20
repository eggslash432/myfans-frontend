// front/src/components/home/CampaignBanner.tsx
type Props = {
  onClick?: () => void;
};

export function CampaignBanner({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        w-full rounded-2xl px-4 py-5
        bg-gradient-to-r from-pink-400 via-pink-300 to-rose-300
        text-white text-left
        shadow-sm
      "
    >
      <div className="text-sm font-semibold opacity-90">
        キャンペーン実施中！
      </div>

      <div className="mt-1 text-base font-bold">
        今だけお得に楽しめるチャンス
      </div>

      <div className="mt-3 inline-flex items-center gap-1
        bg-white/20 rounded-full px-4 py-1 text-sm font-semibold">
        今すぐチェック
        <span className="text-base">›</span>
      </div>
    </button>
  );
}
