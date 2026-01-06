export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

export function hash(x: number, y: number, z: number) {
  return (Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453) % 1;
}

export function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);

  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;

  const u = smoothstep(xf);
  const v = smoothstep(yf);
  const w = smoothstep(zf);

  const n000 = hash(xi, yi, zi);
  const n100 = hash(xi + 1, yi, zi);
  const n010 = hash(xi, yi + 1, zi);
  const n110 = hash(xi + 1, yi + 1, zi);
  const n001 = hash(xi, yi, zi + 1);
  const n101 = hash(xi + 1, yi, zi + 1);
  const n011 = hash(xi, yi + 1, zi + 1);
  const n111 = hash(xi + 1, yi + 1, zi + 1);

  const x00 = lerp(n000, n100, u);
  const x10 = lerp(n010, n110, u);
  const x01 = lerp(n001, n101, u);
  const x11 = lerp(n011, n111, u);

  const y0 = lerp(x00, x10, v);
  const y1 = lerp(x01, x11, v);

  return lerp(y0, y1, w);
}

export function curlNoise(x: number, y: number, z: number, time: number) {
  const e = 0.01;

  const t = time * 0.1;
  const dx = noise3(x, y + e, z + t) - noise3(x, y - e, z + t);
  const dy = noise3(x, y, z + e + t) - noise3(x, y, z - e + t);
  const dz = noise3(x + e, y, z + t) - noise3(x - e, y, z + t);

  return {
    x: dy - dz,
    y: dz - dx,
    z: dx - dy,
  };
}
