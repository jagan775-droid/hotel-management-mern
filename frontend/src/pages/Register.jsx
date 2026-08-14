import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="keycard bg-brass text-ink px-6 py-5 mb-[-1px]">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
            Harborline
          </p>
          <h1 className="font-display text-2xl mt-1">New Staff Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-paper rounded-b-lg p-6 space-y-4 shadow-xl">
          {error && (
            <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-md">{error}</p>
          )}
          <div>
            <label className="text-sm font-medium text-slate">Full name</label>
            <input
              name="name"
              required
              className="input-field mt-1"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate">Email</label>
            <input
              type="email"
              name="email"
              required
              className="input-field mt-1"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="input-field mt-1"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Create Account"}
          </button>
          <p className="text-sm text-center text-slate">
            Already have access?{" "}
            <Link to="/login" className="text-teal font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-center text-slate/70">
            New accounts default to "staff" role. Ask an admin to grant manager access.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
