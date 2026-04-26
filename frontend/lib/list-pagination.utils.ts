export type ExtraQuery = Record<string, string | undefined>;
export type PreservedQuery = Record<string, string>;

export function omitEmptyQueryValues(params: ExtraQuery): PreservedQuery {
  const out: PreservedQuery = {};
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      out[key] = value;
    }
  }
  return out;
}

export function buildPaginationHref(
  pathname: string,
  page: number,
  extra: PreservedQuery,
  pageParam: string,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(extra)) {
    q.set(k, v);
  }
  if (page <= 1) {
    q.delete(pageParam);
  } else {
    q.set(pageParam, String(page));
  }
  const search = q.toString();
  return search ? `${pathname}?${search}` : pathname;
}
