import { useEffect, useState } from "react";
import api from "../../api/client";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/store/orders");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p>Loading past orders...</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Past Orders</h1>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {orders.length === 0 && <div className="alert alert-info">No orders submitted yet.</div>}
      <div className="accordion" id="storeOrders">
        {orders.map((order) => (
          <div className="accordion-item" key={order.id}>
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#order-${order.id}`}
                aria-expanded="false"
                aria-controls={`order-${order.id}`}
              >
                Order #{order.id} - {new Date(order.submittedAt).toLocaleString()} - {order.status}
              </button>
            </h2>
            <div id={`order-${order.id}`} className="accordion-collapse collapse" data-bs-parent="#storeOrders">
              <div className="accordion-body">
                <ul className="list-group">
                  {order.items.map((item) => (
                    <li className="list-group-item d-flex justify-content-between" key={item.id}>
                      <span>
                        {item.product.name} ({item.product.sizeDescription || "Standard"})
                      </span>
                      <strong>{item.quantity}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
