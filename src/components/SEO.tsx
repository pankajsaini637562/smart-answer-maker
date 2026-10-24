import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL, SITE_NAME } from '@/lib/site';

interface SEOProps {
  title: string;
  description: string;
  noindex?: boolean;
  /** Breadcrumb trail after Home, e.g. [{ name: 'Guide', path: '/guide' }] */
  breadcrumbs?: { name: string; path: string }[];
}

export function SEO({ title, description, noindex, breadcrumbs }: SEOProps) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
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
      {!noindex && <link rel="canonical" href={url} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <script type="application/ld+json">{JSON.stringify(webPage)}</script>}
      {crumbs && <script type="application/ld+json">{JSON.stringify(crumbs)}</script>}
    </Helmet>
  );
}
