import { useQuery } from "@apollo/client";
import React from "react";
import { useParams } from "react-router-dom";
import { USER } from "../../queries";
import { UserQuery } from "src/__generated__/graphql";
import { ProfileCard } from "@/components";

const User: React.FC = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery<UserQuery>(USER, {
    variables: { id },
  });

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  const user = data?.user;

  if (!user)
    return <div className="text-center text-gray-600">User not found</div>;

  return <ProfileCard user={user} />;
};

const LoadingSkeleton: React.FC = () => (
  <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="bg-gray-200 h-32"></div>
    <div className="relative px-4 pb-4">
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
      </div>
      <div className="pt-16 text-center">
        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mt-2"></div>
      </div>
      <div className="mt-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded w-5/6 mx-auto"></div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorMessage: React.FC<{ error: any }> = ({ error }) => (
  <div
    className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    role="alert"
  >
    <strong className="font-bold">Error!</strong>
    <span className="block sm:inline"> {error.message}</span>
  </div>
);

export default User;
