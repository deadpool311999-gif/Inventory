import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to={user?.role === "OWNER" ? "/owner/dashboard" : "/store/products"}>
            Inventory Ordering
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
            aria-controls="navMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {user?.role === "STORE" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/store/products">Products</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/store/cart">Cart ({items.length})</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/store/orders">Past Orders</Link>
                  </li>
                </>
              )}
              {user?.role === "OWNER" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/owner/dashboard">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/owner/products">Management</Link>
                  </li>
                </>
              )}
            </ul>
            <div className="d-flex align-items-center gap-3 text-white">
              <small>{user?.email}</small>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container py-3">{children}</main>
    </>
  );
}
