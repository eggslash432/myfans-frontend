// front/src/pages/posts/postDetail/ReportButton.tsx

type Props = {
  onReport: () => void;
};

export function ReportButton({ onReport }: Props) {
  return (
    <footer className="post-detail-footer">
      <button type="button" onClick={onReport} className="btn btn-ghost btn-report">
        <span>🚩</span>
        <span>この投稿を通報する</span>
      </button>
    </footer>
  );
}
