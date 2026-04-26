const NAV_LINK_KEYS = [
  'home',
  'about',
  'services',
  'projects',
  'insights',
  'news',
  'contact',
] as const;

export type NavLinkKey = (typeof NAV_LINK_KEYS)[number];

/**
 * Cùng chuỗi với `data-e2e` trong UI.
 * Dùng với getByTestId (Playwright: testIdAttribute = data-e2e).
 */
export const e2e = {
  appMain: 'app-main',
  nav: (key: NavLinkKey) => `nav-link-${key}`,
  page: {
    projects: 'page-projects',
    insights: 'page-insights',
  },
  notFound: 'not-found',
  contact: {
    form: 'contact-form',
    name: 'contact-name',
    phone: 'contact-phone',
    submit: 'contact-submit',
    error: 'contact-error',
    success: 'contact-success',
  },
} as const;
