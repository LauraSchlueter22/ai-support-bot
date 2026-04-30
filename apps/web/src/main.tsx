import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>AI Support Bot</h1>
        <p>Phase 1 scaffold complete.</p>
      </div>
    </QueryClientProvider>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("No root element");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
