import { Link } from 'react-router-dom';
export default function Cancel() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">決済をキャンセルしました</h1>
      <p className="text-sm text-gray-600">プラン選択に戻ってやり直せます。</p>
      <Link className="underline" to="/">トップへ戻る</Link>
    </div>
  );
}