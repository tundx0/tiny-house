import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { ViewerProvider } from "./context/ViewerContext.tsx";

const token = sessionStorage.getItem("token");

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  credentials: "include",
  cache: new InMemoryCache(),
  headers: {
    "X-CSRF-TOKEN": token || "",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <ViewerProvider>
      <App />
    </ViewerProvider>
  </ApolloProvider>
);
