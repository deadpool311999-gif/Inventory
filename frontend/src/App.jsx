import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import StoreProductsPage from "./pages/store/StoreProductsPage";
import CartPage from "./pages/store/CartPage";
import OrderHistoryPage from "./pages/store/OrderHistoryPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import ProductManagementPage from "./pages/owner/ProductManagementPage";
import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "OWNER" ? "/owner/dashboard" : "/store/products"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/store/products"
        element={
          <ProtectedRoute roles={["STORE"]}>
            <Layout>
              <StoreProductsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/cart"
        element={
          <ProtectedRoute roles={["STORE"]}>
            <Layout>
              <CartPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/orders"
        element={
          <ProtectedRoute roles={["STORE"]}>
            <Layout>
              <OrderHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute roles={["OWNER"]}>
            <Layout>
              <OwnerDashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/products"
        element={
          <ProtectedRoute roles={["OWNER"]}>
            <Layout>
              <ProductManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
