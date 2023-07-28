import Head from 'next/head';
import { useRouter } from 'next/router';

type seoProps = {
  seo?: {
    canonical: string;
    focuskw: string;
    metaDesc: string;
    metaKeywords: string;
    opengraphDescription: string;
    opengraphImage: {
      uri: string;
      altText: string;
      mediaItemUrl: string;
      mediaDetails: {
        width: string;
        height: string;
      };
    };
    opengraphTitle: string;
    opengraphUrl: string;
    opengraphSiteName: string;
    title: string;
  };
};

export default function Meta({ seo }: any) {
  const router = useRouter();
  const currentUrl = router.asPath;
  // const siteAddress = 'tbc';
  // const defaultImageUrl = '/images/tbc.png';

  const { opengraphImage, opengraphTitle, opengraphDescription, opengraphSiteName } = seo || {};
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
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={opengraphTitle ? opengraphTitle : '20 Twenty Scorecard'} />
      <meta
        property="og:description"
        content={opengraphDescription ? opengraphDescription : '20 Twenty Scorecard'}
      />
      <meta
        property="og:site_name"
        content={opengraphSiteName ? opengraphSiteName : '20 Twenty Scorecard'}
      />
      {/* <meta property="og:url" content={`${siteAddress}${currentUrl}`} /> */}
      {/* <meta
        property="og:image"
        content={opengraphImage?.mediaItemUrl ? opengraphImage?.mediaItemUrl : defaultImageUrl}
      /> */}
      <meta property="og:image:width" content={opengraphImage?.mediaDetails?.width} />
      <meta property="og:image:height" content={opengraphImage?.mediaDetails?.height} />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <meta
        name="description"
        content={opengraphDescription ? opengraphDescription : '20 Twenty Scorecard'}
      />
    </Head>
  );
}
