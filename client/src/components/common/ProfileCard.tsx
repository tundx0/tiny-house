import React from "react";
import { useViewer } from "../../contexts/ViewerContext";
import { EmailIcon, WalletIcon, IncomeIcon } from "@/components/Icons";

export type UserData = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  hasWallet: string;
  income?: number | null;
};

export const ProfileCard: React.FC<{ user: UserData }> = ({ user }) => {
  const { viewer } = useViewer();
  const isOwnProfile = viewer.id === user.id;
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
            <span>Wallet: {user.hasWallet === "true" ? "Yes" : "No"}</span>
          </div>
          {user.income !== null && user.income !== undefined && (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <IncomeIcon />
              <span>Income: ${user.income.toLocaleString()}</span>
            </div>
          )}
        </div>
        {isOwnProfile && user.hasWallet !== "true" && (
          <div className="mt-6">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => {}}
            >
              Connect Stripe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
