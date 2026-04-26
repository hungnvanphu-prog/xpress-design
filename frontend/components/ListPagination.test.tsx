import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ListPagination from './ListPagination';

const mockPathname = vi.fn(() => '/en/projects');

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    scroll: _scroll,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    scroll?: boolean;
    [k: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => mockPathname(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { current?: number; total?: number }) => {
    const map: Record<string, string> = {
      prev: 'Previous',
      next: 'Next',
      ariaLabel: 'Pagination',
    };
    if (key === 'pageOf' && values) {
      return `Page ${values.current} of ${values.total}`;
    }
    return map[key] ?? key;
  },
}));

describe('ListPagination', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/en/projects');
  });

  describe('loading state', () => {
    it('renders busy nav and skeleton when isLoading is true', () => {
      render(
        <ListPagination page={1} pageCount={5} isLoading />,
      );
      const loading = screen.getByTestId('list-pagination-loading');
      expect(loading).toHaveAttribute('aria-busy', 'true');
      expect(loading).toHaveAttribute('aria-label', 'Pagination');
      expect(screen.queryByTestId('list-pagination')).not.toBeInTheDocument();
    });

    it('does not render pagination links while loading', () => {
      render(<ListPagination page={2} pageCount={10} isLoading />);
      expect(screen.queryByRole('link', { name: /previous/i })).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders alert with message and no nav', () => {
      render(
        <ListPagination page={1} pageCount={5} errorMessage="Network error" />,
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Network error');
      expect(screen.queryByTestId('list-pagination')).not.toBeInTheDocument();
    });

    it('prefers loading over error when both set (edge case)', () => {
      render(
        <ListPagination
          page={1}
          pageCount={5}
          isLoading
          errorMessage="Failed"
        />,
      );
      expect(screen.getByTestId('list-pagination-loading')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('returns null when pageCount is 0 or 1', () => {
      const { container: a } = render(
        <ListPagination page={1} pageCount={0} />,
      );
      expect(a.firstChild).toBeNull();
      const { container: b } = render(
        <ListPagination page={1} pageCount={1} />,
      );
      expect(b.firstChild).toBeNull();
    });

    it('when page is greater than pageCount, next is disabled; prev may stay enabled', () => {
      render(<ListPagination page={10} pageCount={3} />);
      expect(screen.getByText('Page 10 of 3')).toBeInTheDocument();
      const prev = screen.getByRole('link', { name: /previous/i });
      const next = screen.getByRole('link', { name: /next/i });
      expect(prev).not.toHaveAttribute('aria-disabled', 'true');
      expect(next).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('user interaction', () => {
    it('prev link has href to page 1 with category preserved and no page param in query', () => {
      mockPathname.mockReturnValue('/en/projects');
      render(<ListPagination page={2} pageCount={4} extraParams={{ category: 'a' }} />);
      const prev = screen.getByRole('link', { name: /previous/i });
      expect(prev).toHaveAttribute('href', '/en/projects?category=a');
    });

    it('next link includes page=2 when on first page with extra params', () => {
      mockPathname.mockReturnValue('/vi/insights');
      render(
        <ListPagination
          page={1}
          pageCount={3}
          extraParams={{ tag: 'x' }}
        />,
      );
      const next = screen.getByRole('link', { name: /next/i });
      expect(next).toHaveAttribute('href', '/vi/insights?tag=x&page=2');
    });

    it('disables previous on first page', () => {
      render(<ListPagination page={1} pageCount={3} />);
      const prev = screen.getByRole('link', { name: /previous/i });
      expect(prev).toHaveClass('pointer-events-none');
      expect(prev).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables next on last page', () => {
      render(<ListPagination page={3} pageCount={3} />);
      const next = screen.getByRole('link', { name: /next/i });
      expect(next).toHaveClass('pointer-events-none');
      expect(next).toHaveAttribute('aria-disabled', 'true');
    });

    it('exposes a valid href on next link for client navigation', () => {
      mockPathname.mockReturnValue('/en/projects');
      render(<ListPagination page={1} pageCount={2} />);
      const next = screen.getByRole('link', { name: /next/i });
      expect(next.getAttribute('href')).toBe('/en/projects?page=2');
    });
  });
});
