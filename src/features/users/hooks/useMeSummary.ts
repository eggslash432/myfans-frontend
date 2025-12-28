// features/users/hooks/useMeSummary.ts

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import type { Me } from "@/shared";
import { useAuth } from "@/features/auth/hooks";
import { getErrMsg } from "@/lib/error";

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

    const run = async () => {
      try {
        setLoading(true);
        setErr(null);
        const me = await getMe();
        if (alive) setSummary(me);
      } catch (e) {
        if (alive) setErr(getErrMsg(e));
      } finally {
        if (alive) setLoading(false);
      }
    };

    void run();
    return () => {
      alive = false;
    };
  }, [ready, user?.id]);

  return { summary, loading, err };
}
