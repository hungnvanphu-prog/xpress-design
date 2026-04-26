import { describe, expect, it } from 'vitest';
import { buildPaginationHref, omitEmptyQueryValues } from './list-pagination.utils';

describe('omitEmptyQueryValues', () => {
  it('drops undefined, null, and empty string', () => {
    expect(
      omitEmptyQueryValues({
        a: '1',
        b: '',
        c: undefined,
        d: null as any,
      }),
    ).toEqual({ a: '1' });
  });

  it('returns empty object when all values are empty', () => {
    expect(omitEmptyQueryValues({ x: '' })).toEqual({});
  });
});

describe('buildPaginationHref', () => {
  it('omits page param on first page', () => {
    expect(buildPaginationHref('/vi/projects', 1, { category: 'arch' }, 'page')).toBe(
      '/vi/projects?category=arch',
    );
  });

  it('adds page param when page > 1', () => {
    expect(buildPaginationHref('/en/projects', 2, {}, 'page')).toBe('/en/projects?page=2');
  });

  it('removes page from query when navigating to page 1 with extra params', () => {
    expect(
      buildPaginationHref('/vi/insights', 1, { tag: 'foo' }, 'page'),
    ).toBe('/vi/insights?tag=foo');
  });

  it('supports custom page query key', () => {
    expect(buildPaginationHref('/x', 3, {}, 'p')).toBe('/x?p=3');
  });

  it('returns pathname only when no extra and page 1', () => {
    expect(buildPaginationHref('/x', 1, {}, 'page')).toBe('/x');
  });
});
