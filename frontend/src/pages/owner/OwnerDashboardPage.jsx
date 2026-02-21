import { useEffect, useState } from "react";
import api from "../../api/client";

export default function OwnerDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/owner/orders");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Owner Dashboard</h1>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {orders.length === 0 && <div className="alert alert-info">No submitted orders yet.</div>}

      <div className="row g-3">
        {orders.map((order) => (
          <div className="col-12" key={order.id}>
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <strong>Order #{order.id}</strong>
                <span>{new Date(order.submittedAt).toLocaleString()}</span>
              </div>
              <div className="card-body">
                <p className="mb-2">
                  <strong>Store:</strong> {order.store.name} ({order.store.location || "N/A"}) |{" "}
                  <strong>Status:</strong> {order.status}
                </p>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product.category.name}</td>
                          <td>{item.product.name}</td>
                          <td>{item.product.sizeDescription || "-"}</td>
                          <td>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
