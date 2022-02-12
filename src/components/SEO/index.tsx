import Head from "next/head";

type SEOProps = {
  title: string,
  description: string,
}


export function SEO({ title, description }: SEOProps) {
  return (
    <Head>
      <title>{title} | ig.news</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width"></meta>
    </Head>
  )
}