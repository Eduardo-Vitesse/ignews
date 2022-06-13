import type { NextPage, GetStaticProps } from "next";
import Image from "next/image";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "../styles/home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

const Home: NextPage<HomeProps> = ({ product }) => {
  return (
    <main className={styles.contentContainer}>
      <section className={styles.hero}>
        <span>👏 Hey, welcome</span>
        <h1>
          News about the <span>React</span> world.
        </h1>
        <p>
          Get access to all publications <br />
          <span>for {product.amount} month</span>
        </p>
        <SubscribeButton priceId={product.priceId} />
      </section>
      <Image
        src="/images/avatar.svg"
        alt="Gilr coding"
        width={334}
        height={520}
      />
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve("price_1L8jaXA628c0uGbi7kqjVQ1a", {
    expand: ["product"],
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount! / 100),
  };

  return {
    props: { product },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};

export default Home;
