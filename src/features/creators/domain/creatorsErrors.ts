//

export function friendlyCreatorPlansError(err: string) {
  return err === "creatorId is required"
    ? "クリエイター登録または本人確認（KYC）が完了していないため、プラン情報を取得できません。"
    : err;
}

export function isCreatorNotFoundError(msg: string) {
  return (msg ?? "").toLowerCase().includes("creator not found");
}