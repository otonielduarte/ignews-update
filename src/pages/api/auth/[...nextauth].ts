import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { faunadb } from "../../../services/fauna";
import { query as q } from "faunadb";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user'
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      try {
        const isSubscriptionActive = await faunadb.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )
        return { ...session, isSubscriptionActive }
      } catch {
        return { ...session, isSubscriptionActive: null }
      }
    },
    async signIn({ user, account, profile }) {
      const { email } = user;
      try {
        await handleUserAtFaundaDB(email);
        return true;
      } catch {
        return false;
      }
    }
  }
})

async function handleUserAtFaundaDB(email: string) {
  await faunadb.query(
    q.If(
      NotExistsInFaunaDB(email),
      createUserAtFaunaDB(email),
      getUserFromFaundaDB(email)
    )
  );
}
function NotExistsInFaunaDB(email: string): q.ExprArg {
  return q.Not(
    q.Exists(
      q.Match(
        q.Index('user_by_email'),
        q.Casefold(email)
      )
    )
  );
}

function createUserAtFaunaDB(email: string): q.ExprArg {
  return q.Create(
    q.Collection('users'),
    { data: { email } }
  );
}

function getUserFromFaundaDB(email: string): q.ExprArg {
  return q.Get(
    q.Match(
      q.Index('user_by_email'),
      q.Casefold(email)
    )
  );
}

