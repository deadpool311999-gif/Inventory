import { useState } from "react";
import api from "../../api/client";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submitOrder = async () => {
    setMessage("");
    setError("");
    if (items.length === 0) {
      setError("Cart is empty.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/store/orders", {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      });
      clearCart();
      setMessage("Order submitted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="h4 mb-3">Cart</h1>
      {message && <div className="alert alert-success py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card">
        <div className="card-body">
          {items.length === 0 ? (
            <p className="mb-0">No items in cart.</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Qty</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId}>
                        <td>{item.name}</td>
                        <td>{item.sizeDescription || "-"}</td>
                        <td>{item.quantity}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(item.productId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" disabled={loading} onClick={submitOrder}>
                  {loading ? "Submitting..." : "Submit Weekly Order"}
                </button>
                <button className="btn btn-outline-secondary" onClick={clearCart} disabled={loading}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
