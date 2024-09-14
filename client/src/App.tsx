import React, { useEffect, useRef } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import withSuspense from "./HOCs/withSuspense";
import { useViewer, ViewerProvider } from "./contexts/ViewerContext";
import { NavBar } from "./components";
import { useMutation } from "@apollo/client";
import { LOG_IN } from "./mutations";

const Home = React.lazy(() => import("./components/Home"));
const Listings = React.lazy(() => import("./components/Listings"));
const Listing = React.lazy(() => import("./components/Listing"));
const Host = React.lazy(() => import("./components/Host"));
const User = React.lazy(() => import("./components/User"));
const Login = React.lazy(() => import("./components/Login"));
const NotFound = React.lazy(() => import("./components/NotFound"));

const HomeWithSuspense = withSuspense(Home);
const ListingsWithSuspense = withSuspense(Listings);
const ListingWithSuspense = withSuspense(Listing);
const HostWithSuspense = withSuspense(Host);
const UserWithSuspense = withSuspense(User);
const LoginWithSuspense = withSuspense(Login);
const NotFoundWithSuspense = withSuspense(NotFound);

const NavbarWrapper = () => {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavbarWrapper />,
    children: [
      {
        path: "/",
        element: <HomeWithSuspense />,
      },
      {
        path: "/listings/:location?",
        element: <ListingsWithSuspense />,
      },
      {
        path: "/listing/:id",
        element: <ListingWithSuspense />,
      },
      {
        path: "/host",
        element: <HostWithSuspense />,
      },
      {
        path: "/user/:id",
        element: <UserWithSuspense />,
      },
      {
        path: "/login",
        element: <LoginWithSuspense />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundWithSuspense />,
  },
]);

function App() {
  const { viewer, setViewer } = useViewer();
  const [logIn, { error }] = useMutation(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn) {
        setViewer(data.logIn);

        if (data.logIn.token) {
          sessionStorage.setItem("token", data.logIn.token);
        } else {
          sessionStorage.removeItem("token");
        }
      }
    },
  });
  const logInRef = useRef(logIn);

  useEffect(() => {
    if (!viewer.id) {
      logInRef.current();
    }
  }, []);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
