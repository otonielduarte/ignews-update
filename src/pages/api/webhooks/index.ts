import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../../services/stripe";
import { manageSubscriptions } from "../_handlers/manageSubscriptions";

export const config = {
  api: {
    bodyParser: false
  }
}

export const monitoredEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

export default async function webhooks(req: NextApiRequest, res: NextApiResponse) {
  console.log('evento recebido')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  } else {
    console.log('evento recebido')
    const secret = req.headers['stripe-signature'];
    const buffer = await readBuffer(req);
    try {
      let event: Stripe.Event = stripe.webhooks.constructEvent(buffer, secret, process.env.STRIPE_WEBHOOK_SECRET);
      if (monitoredEvents.has(event.type)) {
        try {
          switch (event.type) {
            case "checkout.session.completed":
              const checkoutSession = event.data.object as Stripe.Checkout.Session;
              await manageSubscriptions({
                customerId: checkoutSession.customer.toString(),
                subscriptionId: checkoutSession.subscription.toString(),
                actionCreate: true
              });
              break;
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
              const subscription = event.data.object as Stripe.Subscription;
              await manageSubscriptions({
                customerId: subscription.id,
                subscriptionId: subscription.customer.toString(),
                actionCreate: false
              });
              break;
            default:
              throw new Error('Unhandled Event ')
          }

        } catch (err) {
          return res.json({ erro: err.message })
        }
      } else {
        console.log('event failed', event)
      }
      res.json({ ok: true });
    } catch (_e) {
      res.status(400).send(`Error ${_e.message}`)
    }
  }
}

async function readBuffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

