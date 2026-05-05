import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { isAuthenticated } from "./lib/api";

const queryClient = new QueryClient();

type User = {
  id: string;
  email: string;
  organizationId: string;
};

type View = "login" | "register" | "dashboard";

function App() {
  const [view, setView] = useState<View>(
    isAuthenticated() ? "dashboard" : "login",
  );
  const [user, setUser] = useState<User | null>(null);

  function handleLogin(user: User) {
    setUser(user);
    setView("dashboard");
  }

  function handleLogout() {
    setUser(null);
    setView("login");
  }

  return (
    <QueryClientProvider client={queryClient}>
      {view === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setView("register")}
        />
      )}
      {view === "register" && (
        <RegisterPage
          onRegister={handleLogin}
          onSwitchToLogin={() => setView("login")}
        />
      )}
      {view === "dashboard" && user && (
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
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
