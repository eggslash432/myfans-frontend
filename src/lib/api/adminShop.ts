// front/src/lib/api/adminShop.ts
import { request } from "@/lib/api";

export type AdminCreateShopRes = {
  ok: true;
  shop: { id: string; name: string };
};

export async function adminCreateShop(input: {
  name: string;
  ownerUserId?: string | null;
}) {
  return request<AdminCreateShopRes>("/shops", {
    method: "POST",
    body: input,
  });
}

