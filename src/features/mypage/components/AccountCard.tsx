// front/src/components/AccountCard.tsx

export function AccountCard({ email }: { email: string }) {
  return (
    <section className="card">
      <div className="section-title flex items-center justify-between">
        <span>アカウント情報</span>
      </div>
      <p className="section-subtitle mb-3">
        ご契約中のプランや購入履歴を確認できます。
      </p>
      <div className="text-sm space-y-1">
        <div>
          <span className="font-semibold">ログイン中のユーザー：</span>
          {email}
        </div>
        <div className="text-xs text-gray-500">
          ※パスワードの変更は「設定」から行なえます。
        </div>
      </div>
    </section>
  );
}
