import crypto from "crypto";
import StripeClient from "stripe";

let client: StripeClient | null = null;

const getClient = (): StripeClient => {
  if (!process.env.S_SECRET_KEY) {
    throw new Error("Stripe is not configured (missing S_SECRET_KEY)");
  }
  if (!client) {
    // Network retries reuse the request's idempotency key, so a retried
    // charge can never be captured twice.
    client = new StripeClient(process.env.S_SECRET_KEY, {
      maxNetworkRetries: 2,
    });
  }
  return client;
};

const getClientId = (): string => {
  if (!process.env.S_CLIENT_ID) {
    throw new Error("Stripe is not configured (missing S_CLIENT_ID)");
  }
  return process.env.S_CLIENT_ID;
};

const getStateSecret = (): string => {
  if (!process.env.SECRET) {
    throw new Error("server is not configured (missing SECRET)");
  }
  return process.env.SECRET;
};

// Percentage of every booking kept by TinyHouse as a platform fee.
const APPLICATION_FEE_RATE = 0.05;
const OAUTH_STATE_TTL_MS = 15 * 60 * 1000;

const signState = (payload: string): string =>
  crypto
    .createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");

// The charge was definitively not taken (declined card, invalid request or a
// PaymentIntent that didn't succeed), so it is safe to release the booking.
export class PaymentFailedError extends Error {}

export const Stripe = {
  // OAuth `state` binds the Connect authorization to the viewer who started
  // it, so a callback URL for someone else's Stripe account is rejected.
  authUrl: (viewerId: string): string => {
    const expires = Date.now() + OAUTH_STATE_TTL_MS;
    const payload = `${viewerId}.${expires}`;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: getClientId(),
      scope: "read_write",
      state: `${expires}.${signState(payload)}`,
    });
    return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  },
  verifyState: (viewerId: string, state: string): boolean => {
    const [expires, signature] = state.split(".");
    if (!expires || !signature || Number(expires) < Date.now()) {
      return false;
    }
    const expected = Buffer.from(signState(`${viewerId}.${expires}`));
    const received = Buffer.from(signature);
    return (
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received)
    );
  },
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
    await getClient().oauth.deauthorize({
      client_id: getClientId(),
      stripe_user_id: stripeUserId,
    });
  },
  // Returns the PaymentIntent id. Throws PaymentFailedError when the charge
  // definitely wasn't taken; any other error means the outcome is unknown.
  charge: async (
    amount: number,
    paymentMethod: string,
    destination: string,
    bookingId: string
  ): Promise<string> => {
    const stripe = getClient();
    let paymentIntent: StripeClient.PaymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "usd",
          payment_method: paymentMethod,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
          application_fee_amount: Math.round(amount * APPLICATION_FEE_RATE),
          transfer_data: { destination },
          metadata: { booking_id: bookingId },
        },
        { idempotencyKey: `booking-${bookingId}` }
      );
    } catch (error) {
      if (
        error instanceof StripeClient.errors.StripeCardError ||
        error instanceof StripeClient.errors.StripeInvalidRequestError
      ) {
        throw new PaymentFailedError(error.message);
      }
      throw error;
    }

    if (paymentIntent.status !== "succeeded") {
      // e.g. requires_action: cancel so it can't complete later.
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw new PaymentFailedError(
        `payment was not completed (status: ${paymentIntent.status})`
      );
    }

    return paymentIntent.id;
  },
  refund: async (paymentIntentId: string): Promise<void> => {
    await getClient().refunds.create(
      {
        payment_intent: paymentIntentId,
        reverse_transfer: true,
        refund_application_fee: true,
      },
      { idempotencyKey: `refund-${paymentIntentId}` }
    );
  },
};
