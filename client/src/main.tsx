import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ViewerProvider } from "./contexts/ViewerContext.tsx";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      ...headers,
      "X-CSRF-TOKEN": token || "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// const token = sessionStorage.getItem("token");

// const client = new ApolloClient({
//   uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
//   credentials: "include",
//   cache: new InMemoryCache(),
//   headers: {
//     "X-CSRF-TOKEN": token || "",
//   },
// });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <ViewerProvider>
      <App />
    </ViewerProvider>
  </ApolloProvider>
);
