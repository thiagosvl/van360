export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as Pick<T, K>
  );
}

export function mergeDefined<T extends object, U extends Partial<T>>(
  target: T,
  source: U
): T {
  const result = { ...target };

  Object.entries(source).forEach(([key, value]) => {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  });

  return result;
}

