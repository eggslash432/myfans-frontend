import { Link } from 'react-router-dom';
export default function Cancel() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-bold">決済をキャンセルしました</h1>
      <Link className="underline" to="/">トップへ戻る</Link>
    </div>
  );
}