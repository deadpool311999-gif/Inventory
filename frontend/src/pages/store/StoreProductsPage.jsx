import { useEffect, useState } from "react";
import api from "../../api/client";
import { useCart } from "../../context/CartContext";

export default function StoreProductsPage() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { addOrUpdateItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/store/products");
        setGroupedProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const setQuantity = (productId, value) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const addToCart = (product) => {
    const quantity = Number(quantities[product.id] || 0);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Please enter a quantity greater than zero.");
      return;
    }
    addOrUpdateItem(product, quantity);
    setError("");
    setSuccess(`${product.name} added to cart.`);
    setQuantity(product.id, "");
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Available Products</h1>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {Object.keys(groupedProducts).length === 0 && (
        <div className="alert alert-info">No products are currently available for your store.</div>
      )}

      {Object.entries(groupedProducts).map(([categoryName, products]) => (
        <section className="mb-4" key={categoryName}>
          <h2 className="h5 border-bottom pb-2">{categoryName}</h2>
          <div className="row g-3">
            {products.map((product) => (
              <div className="col-12 col-md-6 col-lg-4" key={product.id}>
                <div className="card h-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      className="card-img-top product-image"
                      alt={product.name}
                    />
                  ) : (
                    <div className="placeholder-img d-flex align-items-center justify-content-center">
                      No image
                    </div>
                  )}
                  <div className="card-body">
                    <h3 className="h6">{product.name}</h3>
                    <p className="text-muted mb-2">{product.sizeDescription || "Standard size"}</p>
                    <div className="input-group">
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="Qty"
                        value={quantities[product.id] ?? ""}
                        onChange={(e) => setQuantity(product.id, e.target.value)}
                      />
                      <button className="btn btn-primary" onClick={() => addToCart(product)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
