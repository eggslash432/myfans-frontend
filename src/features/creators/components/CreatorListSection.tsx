// front/src/components/home/CreatorListSection.tsx

import type { UiCreator } from "@/shared";
import { CreatorCard } from "./CreatorCard";

export function CreatorListSection({
  creators,
  onOpenCreator,
}: {
  creators: UiCreator[];
  onOpenCreator: (creatorId: string) => void;
}) {
  return (
    <>
      <section className="card">
        <div className="section-title">クリエイター</div>
        <p className="section-subtitle">
          お気に入りのクリエイターを見つけて、投稿やプランをチェックしましょう。
        </p>
      </section>

      {creators.length === 0 ? (
        <section className="card">
          <p className="section-subtitle">現在、表示できるクリエイターはいません。</p>
        </section>
      ) : (
        <section className="space-y-2">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} onClick={() => onOpenCreator(c.id)} />
          ))}
        </section>
      )}
    </>
  );
}
