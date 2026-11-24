import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HOME_DESCRIPTION, HOME_TITLE, SHARE_IMAGE_URL } from './site';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const documentHead = new DOMParser().parseFromString(html, 'text/html').head;

function content(selector: string) {
  return documentHead.querySelector<HTMLMetaElement>(selector)?.content;
}

describe('static crawler metadata', () => {
  it('contains the requested homepage title, description, canonical, and social preview', () => {
    expect(documentHead.querySelector('title')?.textContent).toBe(HOME_TITLE);
    expect(content('meta[name="description"]')).toBe(HOME_DESCRIPTION);
    expect(documentHead.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://smartaiomr.us.ci/');
    expect(content('meta[property="og:title"]')).toBe(HOME_TITLE);
    expect(content('meta[property="og:description"]')).toBe(HOME_DESCRIPTION);
    expect(content('meta[property="og:url"]')).toBe('https://smartaiomr.us.ci/');
    expect(content('meta[property="og:type"]')).toBe('website');
    expect(content('meta[property="og:image"]')).toBe(SHARE_IMAGE_URL);
    expect(content('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(content('meta[name="twitter:image"]')).toBe(SHARE_IMAGE_URL);
  });

  it('contains valid WebApplication structured data with a free INR offer', () => {
    const schemas = Array.from(documentHead.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent || '{}'));
    const app = schemas.find((schema) => schema['@type'] === 'WebApplication');

    expect(app).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Smart AI OMR Analysis',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
    });
  });
});
