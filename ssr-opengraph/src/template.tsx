import { html } from 'hono/html';

interface SiteData {
  children?: any;
  title: string;
  description: string;
  canonical: string;
  image: string;
}

export const Layout = (props: SiteData) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${props.title}</title>

      <link rel="canonical" href="${props.canonical}" />

      <meta name="description" content="${props.description}" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content="${props.canonical}" />
      <meta
        property="og:site_name"
        content="KodaDot - Polkadot / Kusama NFT explorer"
      />
      <meta property="og:title" content="${props.title}" />
      <meta property="og:description" content="${props.description}" />
      <meta property="og:image" content="${props.image}" />

      <meta name="twitter:card" content="summary_large_image" />
    </head>

    <body>
      ${props.children}
    </body>
  </html>
`;

export const Opengraph = (props: { siteData: SiteData; name: string }) => (
  <Layout {...props.siteData}>
    <h1>{props.siteData.title}</h1>
    <img src={props.siteData.image} alt={props.siteData.title} width="360" />
  </Layout>
);
