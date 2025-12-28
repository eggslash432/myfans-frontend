// front/src/pages/payments/Cancel.tsx
import { Link, useSearchParams } from "react-router-dom";

export function Cancel() {
  const [params] = useSearchParams();
  const from = params.get("from"); // "plan" | "ppv"
  const postId = params.get("postId");

  const backTo =
    from === "ppv" && postId ? `/posts/${postId}` :
    from === "plan" ? "/mypage" :
    "/";

  return (
    <div className="page space-y-4">
      <h1 className="page-title">決済キャンセル</h1>

      <section className="card space-y-2">
        <div className="text-sm font-semibold">決済をキャンセルしました</div>
        <p className="section-subtitle">
          もう一度やり直す場合は、戻って再度お試しください。
        </p>

        <div className="pt-2 flex gap-2 flex-wrap">
          <Link to={backTo} className="btn btn-primary">
            戻る
          </Link>
          <Link to="/" className="btn btn-outline">
            トップへ
          </Link>
        </div>
      </section>
    </div>
  );
}
