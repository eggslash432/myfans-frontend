// front/src/hooks/useMeSummary.ts
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getMe } from "../lib/api/auth"; // 実際の置き場所に合わせて
import type { Me } from "../shared/types";

export function useMeSummary() {
  const { user, ready } = useAuth();
  const [summary, setSummary] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setSummary(null);
      setErr(null);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const s = await getMe();
        if (alive) setSummary(s);
      } catch (e: any) {
        const msg = e?.body?.message ?? e?.message ?? "Failed to fetch";
        if (alive) setErr(String(msg));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [ready, user?.id]);

  return { summary, loading, err };
}
