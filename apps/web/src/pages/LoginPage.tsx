import { useState } from "react";
import { api, setToken } from "../lib/api.js";

type Props = {
  onLogin: (user: {
    id: string;
    email: string;
    organizationId: string;
  }) => void;
  onSwitchToRegister: () => void;
};

export default function LoginPage({ onLogin, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.auth.login(email, password);
      setToken(result.token);
      onLogin(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3x1 font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your support dashboard</p>
        </div>
        <div className="bg-gray-900 rounded-2x1 border border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-x1 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transistion"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-x1 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="********"
                required
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-x1 px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-x1 px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {loading ? "Signing in.." : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-400 text-sm">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
