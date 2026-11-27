const g = globalThis as unknown as { epimDemoDecided?: Set<string> };

export function getDecidedIds(): Set<string> {
  if (!g.epimDemoDecided) g.epimDemoDecided = new Set();
  return g.epimDemoDecided;
}