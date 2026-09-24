import React, { FormEvent, useState } from "react";
import { useMutation } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { CREATE_BOOKING } from "@/mutations";
import { countNights, formatDate, formatPrice } from "@/lib/utils";

const publishableKey = import.meta.env.VITE_S_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface Props {
  listingId: string;
  price: number;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onBooked: () => void;
}

const CheckoutForm: React.FC<Props> = ({
  listingId,
  price,
  checkIn,
  checkOut,
  onClose,
  onBooked,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [createBooking, { loading, error }] = useMutation(CREATE_BOOKING, {
    onCompleted: onBooked,
  });

  const nights = countNights(checkIn, checkOut);
  const total = price * nights;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const card = elements?.getElement(CardElement);
    if (!stripe || !card) return;

    setCardError(null);
    const { paymentMethod, error: stripeError } =
      await stripe.createPaymentMethod({ type: "card", card });

    if (stripeError || !paymentMethod) {
      setCardError(stripeError?.message ?? "Your card couldn't be processed.");
      return;
    }

    await createBooking({
      variables: {
        input: { id: listingId, source: paymentMethod.id, checkIn, checkOut },
      },
    }).catch(() => undefined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-1 text-gray-700">
        <p>
          <span className="font-semibold">Dates:</span> {formatDate(checkIn)} –{" "}
          {formatDate(checkOut)}
        </p>
        <p>
          {formatPrice(price, false)} × {nights} {nights === 1 ? "night" : "nights"} ={" "}
          <span className="font-bold text-gray-900">
            {formatPrice(total, false)}
          </span>
        </p>
      </div>

      <div className="mt-5 border border-gray-300 rounded p-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      {(cardError || error) && (
        <p className="text-sm text-red-600 mt-3">
          {cardError ?? error?.message}
        </p>
      )}

      <div className="mt-6 flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold disabled:opacity-50"
        >
          {loading ? "Booking..." : `Pay ${formatPrice(total, false)}`}
        </button>
      </div>
    </form>
  );
};

export const ListingCreateBookingModal: React.FC<Props> = (props) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="booking-modal-title"
  >
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
      <button
        onClick={props.onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <h2
        id="booking-modal-title"
        className="text-xl font-bold text-gray-900 mb-4"
      >
        Book your trip
      </h2>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm {...props} />
        </Elements>
      ) : (
        <p className="text-gray-600">
          Payments aren't configured. Set <code>VITE_S_PUBLISHABLE_KEY</code> to
          enable bookings.
        </p>
      )}
    </div>
  </div>
);
