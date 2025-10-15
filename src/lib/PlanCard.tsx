// PlanCard.tsx（購読ボタン押下）
import axios from 'axios';

async function handleSubscribe(creatorId: string, planId: string) {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/creators/${creatorId}/plans/${planId}/checkout`
    );
    // サーバーから Checkout の url を返す実装にする
    window.location.href = res.data.url;
  } catch (e: any) {
    alert(e?.response?.status ? `Request failed: ${e.response.status}` : 'Request failed');
  }
}
