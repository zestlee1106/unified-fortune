/** 같은 입력이면 항상 같은 결과가 나와야 한다. 시드 기반 결정론적 난수. */
export function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function seededPick<T>(items: readonly T[], seed: string): T {
  return items[hashString(seed) % items.length]
}

/** seed로부터 0 이상 max 미만의 정수 */
export function seededInt(seed: string, max: number): number {
  return hashString(seed) % max
}
