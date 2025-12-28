// front/src/shared/utils/objects.ts

export function prune<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(prune).filter((v) => v !== undefined && v !== null) as any;
  } else if (obj && typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const pv = prune(v as any);
      if (pv !== undefined && pv !== null && pv !== '') out[k] = pv;
    }
    return out;
  }
  return obj;
}

