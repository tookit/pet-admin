/** Ignore unknown fields and incompatible primitive values in local preferences. */
export function readPreferences<T extends object>(key: string, defaults: T): T {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaults;
    const result = { ...defaults };
    for (const field of Object.keys(defaults) as (keyof T)[]) {
      if (field in parsed) {
        const value = (parsed as T)[field];
        if (typeof value === typeof defaults[field]) result[field] = value;
      }
    }
    return result;
  } catch {
    return defaults;
  }
}
export function savePreferences(key: string, value: object) {
  localStorage.setItem(key, JSON.stringify(value));
}
