import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import withSuspense from "./HOCs/withSuspense";

const Home = React.lazy(() => import("./components/Home"));
const Listings = React.lazy(() => import("./components/Listings"));
const Listing = React.lazy(() => import("./components/Listing"));
const Host = React.lazy(() => import("./components/Host"));
const User = React.lazy(() => import("./components/User"));
const NotFound = React.lazy(() => import("./components/NotFound"));

const HomeWithSuspense = withSuspense(Home);
const ListingsWithSuspense = withSuspense(Listings);
const ListingWithSuspense = withSuspense(Listing);
const HostWithSuspense = withSuspense(Host);
const UserWithSuspense = withSuspense(User);
const NotFoundWithSuspense = withSuspense(NotFound);

const router = createBrowserRouter([
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
    path: "*",
    element: <NotFoundWithSuspense />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
