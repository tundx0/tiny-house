import StripeClient from "stripe";

let client: StripeClient | null = null;

const getClient = (): StripeClient => {
  if (!process.env.S_SECRET_KEY) {
    throw new Error("Stripe is not configured (missing S_SECRET_KEY)");
  }
  if (!client) {
    client = new StripeClient(process.env.S_SECRET_KEY);
  }
  return client;
};

// Percentage of every booking kept by TinyHouse as a platform fee.
const APPLICATION_FEE_RATE = 0.05;

export const Stripe = {
  connect: async (code: string): Promise<string> => {
    const response = await getClient().oauth.token({
      grant_type: "authorization_code",
      code,
    });
    if (!response.stripe_user_id) {
      throw new Error("Failed to connect with Stripe");
    }
    return response.stripe_user_id;
  },
  disconnect: async (stripeUserId: string): Promise<void> => {
    if (!process.env.S_CLIENT_ID) {
      return;
    }
    await getClient().oauth.deauthorize({
      client_id: process.env.S_CLIENT_ID,
      stripe_user_id: stripeUserId,
    });
  },
  charge: async (
    amount: number,
    paymentMethod: string,
    destination: string
  ): Promise<void> => {
    const paymentIntent = await getClient().paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: paymentMethod,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      application_fee_amount: Math.round(amount * APPLICATION_FEE_RATE),
      transfer_data: { destination },
    });

    if (paymentIntent.status !== "succeeded") {
      throw new Error(
        `Failed to create charge with Stripe (status: ${paymentIntent.status})`
      );
    }
  },
};
