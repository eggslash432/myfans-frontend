// front/src/pages/mypage/mypage/creatorMenu.ts
export const creatorMenuItems = [
  { label: '投稿管理', description: '投稿の一覧・編集・公開設定', path: '/creators/posts', icon: '📝' },
  { label: 'プラン設定', description: '月額プランの作成・編集', path: '/creators/plans', icon: '📦' },
  { label: '出金管理', description: '売上の振込口座・出金履歴', path: '/creators/payouts', icon: '💰' },
  { label: '売上レポート', description: '期間別の売上・購読状況', path: '/creators/analytics', icon: '📊' },
] as const;
