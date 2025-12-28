// front/src/hooks/useSampleLock.ts
import { useCallback, useMemo, useState } from 'react';

export function useSampleLock(sampleLimitSec: number) {
  const [lockedMap, setLockedMap] = useState<Record<string, boolean>>({});

  const lock = useCallback((key: string) => {
    setLockedMap((prev) => ({ ...prev, [key]: true }));
  }, []);

  const unlock = useCallback((key: string) => {
    setLockedMap((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const onTimeUpdate = useCallback(
    (key: string, e: React.SyntheticEvent<HTMLVideoElement>) => {
      const v = e.currentTarget;
      if (v.currentTime >= sampleLimitSec) {
        v.pause();
        v.currentTime = sampleLimitSec;
        lock(key);
      }
    },
    [lock, sampleLimitSec],
  );

  const isLocked = useCallback(
    (key: string) => lockedMap[key] === true,
    [lockedMap],
  );

  return useMemo(
    () => ({
      lockedMap,
      lock,
      unlock,
      onTimeUpdate,
      isLocked,
    }),
    [lockedMap, lock, unlock, onTimeUpdate, isLocked],
  );
}
