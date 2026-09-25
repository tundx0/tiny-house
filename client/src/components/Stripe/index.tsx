import React, { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CONNECT_STRIPE } from "@/mutations";
import { useViewer } from "@/contexts/ViewerContext";

const Stripe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { viewer, setViewer } = useViewer();
  const requested = useRef(false);

  const [connectStripe, { error }] = useMutation(CONNECT_STRIPE, {
    onCompleted: (data) => {
      setViewer((prev) => ({
        ...prev,
        hasWallet: data.connectStripe.hasWallet,
      }));
      navigate(`/user/${viewer.id}`, { replace: true });
    },
  });

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const stripeError = searchParams.get("error_description");

  useEffect(() => {
    // The mutation needs an authenticated viewer, so wait for the session.
    if (!code || !state || !viewer.id || requested.current) return;
    requested.current = true;
    connectStripe({ variables: { input: { code, state } } }).catch(
      () => undefined,
    );
  }, [code, state, viewer.id, connectStripe]);

  const failed =
    !!error ||
    !!stripeError ||
    !code ||
    !state ||
    (viewer.didRequest && !viewer.id);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        {failed ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Couldn't connect Stripe
            </h1>
            <p className="text-gray-600 mb-6">
              {stripeError ||
                error?.message ||
                (!viewer.id
                  ? "You need to be signed in to connect Stripe."
                  : "No authorization code was returned by Stripe.")}
            </p>
            <Link
              to={viewer.id ? `/user/${viewer.id}` : "/login"}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              {viewer.id ? "Back to profile" : "Sign in"}
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
            <h1 className="text-xl font-semibold text-gray-800">
              Connecting your Stripe account...
            </h1>
          </>
        )}
      </div>
    </div>
  );
};

export default Stripe;
