import { query as q } from "faunadb";
import { faunadb } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";
import { FaunaUser } from "../../../types/fauna";

type SubscriptionPayload = {
  subscriptionId: string,
  customerId: string,
  actionCreate: boolean
}

type SubscriptionSchema = {
  id: string,
  userId: string,
  status: string,
  price: string,
}

export async function manageSubscriptions({ customerId, subscriptionId, actionCreate }: SubscriptionPayload) {
  const user = await getUserFromFaunaDB(customerId);
  const { id, status, items: { data } } = await getSubscriptionDetails(subscriptionId);

  if (actionCreate) {
    createSubscriptionAtFauna({
      id,
      userId: user.ref.id,
      status,
      price: data[0].price.id,
    })
  } else {
    replaceSubscriptionAtFauna({
      id,
      userId: user.ref.id,
      status,
      price: data[0].price.id
    }, subscriptionId)
  }
}

async function replaceSubscriptionAtFauna(payload: SubscriptionSchema, subscriptionId: string) {
  return faunadb.query(
    q.Replace(
      getSubscriptionFromFaunaDB(subscriptionId),
      { data: payload }
    )
  );
}

async function createSubscriptionAtFauna(payload: SubscriptionSchema) {
  return faunadb.query(
    q.Create(
      q.Collection('subscriptions'),
      { data: payload }
    )
  );
}

async function getSubscriptionDetails(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

async function getSubscriptionFromFaunaDB(
  subscriptionId: string
) {
  return (
    q.Select(
      'ref',
      q.Get(
        q.Match(
          q.Index('subscription_by_id'),
          subscriptionId
        )
      )
    )
  );
}

async function getUserFromFaunaDB(
  customerId: string
) {
  return await faunadb.query<FaunaUser>(
    q.Select(
      'ref',
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          q.Casefold(customerId)
        )
      )
    )
  );
}