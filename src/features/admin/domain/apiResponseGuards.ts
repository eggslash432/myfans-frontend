// front/src/features/admin/domain/apiResponseGuard.ts

export function pickCreatedId(res: any): number | null {
  // 返却形式が揺れても拾えるように保険
  const candidates = [
    res?.data?.id,
    res?.data?.data?.id,
    res?.data?.item?.id,
    res?.data?.announcement?.id,
    res?.id,
  ];
  const v = candidates.find((x) => typeof x === "number");
  return v ?? null;
}

