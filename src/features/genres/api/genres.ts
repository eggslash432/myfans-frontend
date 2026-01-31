// front/src/features/genres/api/genres.ts
import { apiGet } from "@/lib/api";
import { unwrapData } from "@/lib/api/normalize";
import type { Genre } from "@/shared";

export type ListGenresRes = { items: Genre[] };

export async function listGenres(): Promise<ListGenresRes> {
  const res = await apiGet("/genres");
  return unwrapData<ListGenresRes>(res);
}
