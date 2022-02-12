import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { DefaultUser } from "next-auth";
import { getSession } from "next-auth/react";
import { Exception } from "sass";
import { faunadb } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";
import { FaunaUser } from "../../../types/fauna";

type SessionUser = {
  name?: string;
  email?: string;
  image?: string;
}

export default async function checkout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  } else {
    try {
      const { priceId } = req.body;
      const session = await getSession({ req });
      const user: SessionUser = session.user;

      const stripeCustomerId = await getStripeCustomerId(user);

      const checkout = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        success_url: `${process.env.NEXT_PUBLIC_URL}posts`,
        line_items: [
          { price: priceId, quantity: 1 }
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        cancel_url: process.env.NEXT_PUBLIC_URL,
      });

      res.status(200).json({ 'sessionId': checkout.id });
    } catch (_e) {
      res.status(500).end((_e as Exception).message);
    }
  }
}

async function getStripeCustomerId(
  user: SessionUser,
) {
  const userDB = await getUserFromFaunaDB(user.email);
  let { stripeCustomerId } = userDB.data;

  if (!stripeCustomerId) {
    const stripeCustomer = await registerStripeUser(user);
    stripeCustomerId = stripeCustomer.id;
    await updateUserFaunaDB(userDB.ref.id, stripeCustomerId);
  }
  return stripeCustomerId;
}

async function registerStripeUser(user: SessionUser) {
  return await stripe.customers.create({
    email: user.email, metadata: ''
  });
}

async function updateUserFaunaDB(
  faunaCustomerId: string,
  stripeCustomerId: string
) {
  await faunadb.query(
    q.Update(
      q.Ref(q.Collection('users'), faunaCustomerId), {
      data: { stripeCustomerId }
    })
  );
}

async function getUserFromFaunaDB(
  email: string
) {
  return await faunadb.query<FaunaUser>(
    q.Get(
      q.Match(
        q.Index('user_by_email'),
        q.Casefold(email)
      )
    )
  );
}