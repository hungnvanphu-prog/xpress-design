/**
 * Hàm thuần: phân tích cấu trúc quan hệ tag Strapi (không I/O).
 */
export function tagRelationEntries(tags: unknown): unknown[] {
  if (tags == null || typeof tags !== 'object') return [];
  const d = (tags as { data?: unknown }).data;
  if (d == null) return [];
  if (Array.isArray(d)) return d;
  if (typeof d === 'object') return [d];
  return [];
}

export function hasUsableStrapiTags(tags: unknown): boolean {
  const entries = tagRelationEntries(tags);
  if (entries.length === 0) return false;
  return entries.some((t) => {
    if (t == null || typeof t !== 'object') return false;
    const rec = t as Record<string, unknown>;
    const attr = (rec.attributes as Record<string, unknown>) || {};
    const name = typeof attr.name === 'string' ? attr.name.trim() : '';
    const slug = typeof attr.slug === 'string' ? attr.slug.trim() : '';
    return name.length > 0 || slug.length > 0;
  });
}

export function collectLocalizationIds(attrs: Record<string, any>): number[] {
  const out: number[] = [];
  const locData = attrs?.localizations?.data;
  if (!Array.isArray(locData)) return out;
  for (const loc of locData) {
    const lid = typeof loc?.id === 'number' ? loc.id : Number(loc?.id);
    if (Number.isFinite(lid) && !out.includes(lid)) out.push(lid);
  }
  return out;
}
