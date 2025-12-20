// front/src/pages/posts/newPost/PublishStatusSection.tsx

type Props = {
  isDraft: boolean;
  setIsDraft: (v: boolean) => void;
};

export function PublishStatusSection({ isDraft, setIsDraft }: Props) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">公開設定</div>
      <div className="flex items-center gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="status"
            checked={!isDraft}
            onChange={() => setIsDraft(false)}
          />
          <span>公開</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="status"
            checked={isDraft}
            onChange={() => setIsDraft(true)}
          />
          <span>下書き</span>
        </label>
      </div>
    </div>
  );
}
