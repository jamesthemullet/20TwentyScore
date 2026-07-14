import Head from 'next/head';
import { useRouter } from 'next/router';

type Props = {
  title?: string;
  description?: string;
};

const SITE_NAME = '20Twenty Score';
const SITE_URL = 'https://20-twenty-score.vercel.app';
const DEFAULT_DESCRIPTION =
  'Track your T20 cricket match ball by ball — runs, wickets, extras, and live run rates.';
const OG_IMAGE = `${SITE_URL}/images/temp-seo-image.jpg`;

export default function Meta({ title, description }: Props) {
  const router = useRouter();
  const currentUrl = (router.asPath ?? '/').split('?')[0];
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDescription = description ?? DEFAULT_DESCRIPTION;
  const canonicalUrl = `${SITE_URL}${currentUrl}`;
  return (
    <Head>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      {/* <link rel="manifest" href="/favicon/site.webmanifest" /> */}
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#000000" />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content="#000" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Head>
  );
}
