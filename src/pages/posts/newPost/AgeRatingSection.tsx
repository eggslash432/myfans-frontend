// front/src/pages/posts/newPost/AgeRatingSection.tsx

import type { AgeRating } from '../../../shared/prisma-enums';

type Props = {
  ageRating: AgeRating;
  setAgeRating: (v: AgeRating) => void;
};

export function AgeRatingSection({ ageRating, setAgeRating }: Props) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">年齢区分</div>
      <div className="flex items-center gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="agerating"
            checked={ageRating === 'all'}
            onChange={() => setAgeRating('all')}
          />
          <span>一般（all）</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="agerating"
            checked={ageRating === 'r18'}
            onChange={() => setAgeRating('r18')}
          />
          <span>R18</span>
        </label>
      </div>
    </div>
  );
}
