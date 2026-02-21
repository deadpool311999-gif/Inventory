import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBootstrap, setShowBootstrap] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "OWNER" ? "/owner/dashboard" : "/store/products");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapOwner = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/bootstrap-owner", { email, password });
      const user = await login(email, password);
      navigate(user.role === "OWNER" ? "/owner/dashboard" : "/store/products");
    } catch (err) {
      setError(err.response?.data?.message || "Owner bootstrap failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-12 col-sm-10 col-md-7 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h4 mb-3">Inventory Ordering Login</h1>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>
            <div className="mt-3">
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => setShowBootstrap((prev) => !prev)}
              >
                First-time setup
              </button>
              {showBootstrap && (
                <button
                  className="btn btn-outline-dark btn-sm ms-2"
                  type="button"
                  onClick={handleBootstrapOwner}
                  disabled={loading}
                >
                  Create initial owner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
