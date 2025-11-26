export function groupBy<T, K extends string | number | symbol>(
  list: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return list.reduce(
    (acc, item) => {
      const key = getKey(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

export function chunk<T>(list: T[], size: number): T[][] {
  if (size <= 0) return [list];
  const chunks: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
}

export function uniqueBy<T, K>(list: T[], getKey: (item: T) => K): T[] {
  const seen = new Set<K>();
  return list.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

