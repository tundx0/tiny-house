import React, { useEffect } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { AUTH_URL } from "../../queries";
import { useNavigate, useLocation } from "react-router-dom";
import { LOG_IN } from "../../mutations";
import { useViewer } from "../../context/ViewerContext";

const Login: React.FC = () => {
  const [getAuthUrl, { loading: authUrlLoading, data: authUrlData }] =
    useLazyQuery(AUTH_URL);
  const [logIn, { loading: logInLoading, error: logInError }] =
    useMutation(LOG_IN);

  const navigate = useNavigate();
  const location = useLocation();
  const { viewer, setViewer } = useViewer();

  const handleGoogleLogin = () => {
    getAuthUrl();
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");

    if (code && !viewer.id) {
      logIn({ variables: { input: { code } } })
        .then(({ data }) => {
          if (data && data.logIn && data.logIn.token) {
            setViewer(data.logIn);
            sessionStorage.setItem("token", data.logIn.token);
            navigate(`/user/${data.logIn.id}`);
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
        });
    }
  }, [location.search, logIn, setViewer, navigate, viewer.id]);

  useEffect(() => {
    if (authUrlData && authUrlData.authUrl) {
      window.location.href = authUrlData.authUrl;
    }
  }, [authUrlData]);

  const isLoading = authUrlLoading || logInLoading;

  return (
    <div className="flex flex-col items-center justify-center min-h-[93vh] bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome Back</h1>
        <p className="mb-4">Log in to access your account</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Sign in with Google"}
        </button>
        {logInError && (
          <p className="mt-4 text-red-500">Error: {logInError.message}</p>
        )}
        <p className="mt-4 text-sm text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
