import { useLazyQuery } from "@apollo/client";
import { STRIPE_AUTH_URL } from "@/queries";

// Asks the server for a Stripe Connect URL (it carries a signed, expiring
// OAuth state for the current viewer) and redirects to it.
export const useConnectStripe = () => {
  const [getStripeAuthUrl, { loading, error }] = useLazyQuery(STRIPE_AUTH_URL, {
    fetchPolicy: "network-only",
  });

  const connectStripe = async () => {
    const { data } = await getStripeAuthUrl();
    if (data?.stripeAuthUrl) {
      window.location.href = data.stripeAuthUrl;
    }
  };

  return { connectStripe, loading, error };
};
