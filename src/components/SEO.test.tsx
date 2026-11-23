import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { SEO } from './SEO';
import { HOME_DESCRIPTION, HOME_TITLE, SHARE_IMAGE_URL } from '@/lib/site';

function renderSeo(path: string, noindex = false) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <SEO
          title={HOME_TITLE}
          description={HOME_DESCRIPTION}
          noindex={noindex}
          breadcrumbs={[{ name: 'Guide', path: '/how-to-check-neet-omr-sheet' }]}
        />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function meta(selector: string) {
  return document.head.querySelector<HTMLMetaElement>(selector)?.content;
}

describe('route SEO metadata', () => {
  it('uses the requested homepage copy and a self-referencing canonical', async () => {
    renderSeo('/');

    await waitFor(() => expect(document.title).toBe(HOME_TITLE));
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://smartaiomr.us.ci/');
    expect(meta('meta[name="description"]')).toBe(HOME_DESCRIPTION);
    expect(meta('meta[property="og:url"]')).toBe('https://smartaiomr.us.ci/');
    expect(meta('meta[property="og:image"]')).toBe(SHARE_IMAGE_URL);
    expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(meta('meta[name="twitter:image"]')).toBe(SHARE_IMAGE_URL);
  });

  it('builds dynamic canonical and social URLs from the current route', async () => {
    renderSeo('/courses/course-123/');

    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://smartaiomr.us.ci/courses/course-123',
    ));
    expect(meta('meta[property="og:url"]')).toBe('https://smartaiomr.us.ci/courses/course-123');
  });

  it('keeps a canonical on noindex routes and emits valid page and breadcrumb schema', async () => {
    renderSeo('/cbt/verify/reference-123', true);

    await waitFor(() => expect(meta('meta[name="robots"]')).toBe('noindex, nofollow'));
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://smartaiomr.us.ci/cbt/verify/reference-123',
    );
    const schemas = Array.from(document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent || '{}'));
    const webPage = schemas.find((schema) => schema['@type'] === 'WebPage');
    expect(webPage).toBeUndefined();
    const breadcrumbs = schemas.find((schema) => schema['@type'] === 'BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(2);
    expect(breadcrumbs.itemListElement[1].item).toBe('https://smartaiomr.us.ci/how-to-check-neet-omr-sheet');
  });
});
