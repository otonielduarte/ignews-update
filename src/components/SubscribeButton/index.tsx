import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Exception } from 'sass';
import { api } from '../../services/api';
import { getStripeJS } from '../../services/stripe-js';
import styles from './styles.module.scss';

type SubscribeButton = {
  priceId: string,
}

export function SubscribeButton({ priceId }: SubscribeButton) {
  const session = useSession();
  const router = useRouter();

  console.log(session.data);

  async function handleSubscribe() {
    if (session.status === 'unauthenticated') {
      signIn('github');
      return;
    }

    else if (session && session.data && session.data.isSubscriptionActive) {
      router.push('/posts');
      return;
    }
    else {
      try {
        const response = await api.post('/checkout', { priceId });
        const { sessionId } = response.data;

        const stripe = await getStripeJS();
        await stripe.redirectToCheckout({ sessionId });

      } catch (_e) {
        console.log('handleSubscribe', (_e as Exception).message);
      }
    }
  }

  return (
    <button type='button' className={styles.content} onClick={handleSubscribe}>
      Subscribe now
    </button>
  )
}