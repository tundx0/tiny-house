import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import withSuspense from "./HOCs/withSuspense";
import { ViewerProvider } from "./context/ViewerContext";
import { NavBar } from "./components";

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
  return (
    <>
      <ViewerProvider>
        <RouterProvider router={router} />
      </ViewerProvider>
    </>
  );
}

export default App;
