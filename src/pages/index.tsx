import { SEO } from "../components/SEO";
import { GetStaticProps } from "next";
import Image from 'next/image';
import { SubscribeButton } from "../components/SubscribeButton";
import style from './styles.module.scss';
import { stripe } from "../services/stripe";
import { parseNumberToCurrency } from "../utils/parseCurrency";

interface HomeProps {
  product: {
    priceId: string,
    amount: number,
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <SEO title="Home" description="home page ig.news"></SEO>
      <main className={style.contentContainer}>
        <section className={style.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the  <span>React</span>world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {parseNumberToCurrency(product.amount)} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <Image src="/assets/images/avatar.svg" alt="girl coding" width={600} height={600} />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const priceResponse = await stripe.prices.retrieve('price_1KPz6BJQVjId0VYtNAv3a2Ux', {
    expand: ['product']
  });

  const product = {
    priceId: priceResponse.id,
    amount: (priceResponse.unit_amount / 100),
  };

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24,
  }
}