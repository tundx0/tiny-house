import React from "react";
import { useMutation } from "@apollo/client";
import { useViewer } from "../../contexts/ViewerContext";
import { EmailIcon, WalletIcon, IncomeIcon } from "@/components/Icons";
import { DISCONNECT_STRIPE } from "@/mutations";
import { formatPrice } from "@/lib/utils";
import { useConnectStripe } from "@/hooks/useConnectStripe";

export type UserData = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  hasWallet: boolean;
  income?: number | null;
};

export const ProfileCard: React.FC<{
  user: UserData;
  onWalletChange?: () => void;
}> = ({ user, onWalletChange }) => {
  const { viewer, setViewer } = useViewer();
  const isOwnProfile = viewer.id === user.id;

  const [disconnectStripe, { loading: disconnecting, error }] = useMutation(
    DISCONNECT_STRIPE,
    {
      onCompleted: (data) => {
        setViewer((prev) => ({
          ...prev,
          hasWallet: data.disconnectStripe.hasWallet,
        }));
        onWalletChange?.();
      },
    },
  );

  const {
    connectStripe,
    loading: connecting,
    error: connectError,
  } = useConnectStripe();

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md mx-auto">
      <div className="bg-gray-200 h-32"></div>
      <div className="relative px-4 pb-4">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
        </div>
        <div className="pt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-600 mt-1">ID: {user.id}</p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <EmailIcon />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <WalletIcon />
            <span>
              Stripe: {user.hasWallet ? "Connected" : "Not connected"}
            </span>
          </div>
          {user.income !== null && user.income !== undefined && (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <IncomeIcon />
              <span>Income: {formatPrice(user.income)}</span>
            </div>
          )}
        </div>
        {isOwnProfile && (
          <div className="mt-6">
            {user.hasWallet ? (
              <button
                className="w-full border border-red-400 text-red-600 hover:bg-red-50 font-bold py-2 px-4 rounded disabled:opacity-50"
                onClick={() => disconnectStripe()}
                disabled={disconnecting}
              >
                {disconnecting ? "Disconnecting..." : "Disconnect Stripe"}
              </button>
            ) : (
              <>
                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  onClick={connectStripe}
                  disabled={connecting}
                >
                  {connecting ? "Redirecting..." : "Connect Stripe"}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Connect a Stripe account to host listings and receive payouts.
                </p>
              </>
            )}
            {(error || connectError) && (
              <p className="text-sm text-red-600 mt-2 text-center">
                {(error ?? connectError)?.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
