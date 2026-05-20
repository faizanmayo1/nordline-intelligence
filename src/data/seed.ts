import { Faker, en, en_GB } from "@faker-js/faker";

// Deterministic, well-seeded faker instance so the demo is byte-identical
// every reload. 19720517 = first Nordic stamp release date — fun anchor.
export const faker = new Faker({
  locale: [en_GB, en],
});
faker.seed(19720517);

/** Mulberry32 PRNG — deterministic across runs and not affected by faker draws. */
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(arr: readonly T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

export function pickWeighted<T>(
  arr: readonly { value: T; weight: number }[],
  r: () => number,
): T {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let v = r() * total;
  for (const item of arr) {
    v -= item.weight;
    if (v <= 0) return item.value;
  }
  return arr[arr.length - 1].value;
}

/** Approx degrees per km at ~60°N: 1° lat ≈ 111 km; 1° lon ≈ 55 km */
export function offsetLngLat(
  base: [number, number],
  rangeKm: number,
  r: () => number,
): [number, number] {
  const dx = (r() - 0.5) * 2 * rangeKm;
  const dy = (r() - 0.5) * 2 * rangeKm;
  return [base[0] + dx / 55, base[1] + dy / 111];
}
