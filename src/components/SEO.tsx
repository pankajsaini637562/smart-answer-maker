import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SHARE_IMAGE_ALT, SHARE_IMAGE_URL, SITE_URL, SITE_NAME } from '@/lib/site';

interface SEOProps {
  title: string;
  description: string;
  noindex?: boolean;
  /** Breadcrumb trail after Home, e.g. [{ name: 'Guide', path: '/guide' }] */
  breadcrumbs?: { name: string; path: string }[];
}

export function SEO({ title, description, noindex = false, breadcrumbs }: SEOProps) {
  const { pathname } = useLocation();
  const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const url = `${SITE_URL}${canonicalPath}`;
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
  };
  const crumbs = breadcrumbs && {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...breadcrumbs].map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: `${SITE_URL}${b.path}`,
    })),
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}
      />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={SHARE_IMAGE_URL} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={SHARE_IMAGE_ALT} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={SHARE_IMAGE_URL} />
      <meta name="twitter:image:alt" content={SHARE_IMAGE_ALT} />

      {!noindex && <script type="application/ld+json">{JSON.stringify(webPage)}</script>}
      {crumbs && <script type="application/ld+json">{JSON.stringify(crumbs)}</script>}
    </Helmet>
  );
}
