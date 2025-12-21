// front/src/components/home/CampaignBanner.tsx
type Props = {
  onClick?: () => void;
};

export function CampaignBanner({ onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className="campaign-banner">
      <div className="campaign-banner__title">キャンペーン実施中！</div>
      <div className="campaign-banner__desc">今だけお得に楽しめるチャンス</div>

      <div className="campaign-banner__cta">
        今すぐチェック <span aria-hidden>›</span>
      </div>
    </button>
  );
}
