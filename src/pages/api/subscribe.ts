/* eslint-disable import/no-anonymous-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";
import { query as q } from "faunadb";

type TUser = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const sessions = await getSession({ req });

    const user = await fauna.query<TUser>(
      q.Get(
        q.Match(q.Index("user_by_meail"), q.Casefold(sessions?.user?.email!))
      )
    );

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: sessions?.user?.email!,
      });

      await fauna.query(
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: { stripe_customer_id: stripeCustomer.id },
        })
      );

      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: "price_1L8jaXA628c0uGbi7kqjVQ1a", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: "http://localhost:3000/posts",
      cancel_url: "http://localhost:3000/",
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
