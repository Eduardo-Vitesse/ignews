import { query as q } from "faunadb";
import NextAuth from "next-auth";
import { FaunaAdapter } from "@next-auth/fauna-adapter";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  // adapter: FaunaAdapter(fauna),
  secret: process.env.SECRET,
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
      const { email } = user;
      await fauna.query(q.Create(q.Collection("users"), { data: { email } }));
      return true;
    },
    async session({ session, user, token }) {
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
});
