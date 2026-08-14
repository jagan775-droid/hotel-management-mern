import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("admin@hotel.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="keycard bg-teal text-paper px-6 py-5 mb-[-1px]">
          <p className="font-mono text-xs uppercase tracking-widest text-paper/60">
            Harborline
          </p>
          <h1 className="font-display text-2xl mt-1">Front Desk Sign In</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-paper rounded-b-lg p-6 space-y-4 shadow-xl">
          {error && (
            <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-md">{error}</p>
          )}
          <div>
            <label className="text-sm font-medium text-slate">Email</label>
            <input
              type="email"
              required
              className="input-field mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate">Password</label>
            <input
              type="password"
              required
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123 (after seeding)"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-sm text-center text-slate">
            No account?{" "}
            <Link to="/register" className="text-teal font-medium">
              Register staff access
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
