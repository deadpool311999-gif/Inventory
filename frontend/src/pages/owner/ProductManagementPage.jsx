import { useEffect, useState } from "react";
import api from "../../api/client";

const initialProduct = {
  name: "",
  imageUrl: "",
  sizeDescription: "",
  categoryId: ""
};

export default function ProductManagementPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [availability, setAvailability] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [productForm, setProductForm] = useState(initialProduct);
  const [newStore, setNewStore] = useState({ name: "", location: "" });
  const [newStorekeeper, setNewStorekeeper] = useState({ email: "", password: "", storeId: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      const [categoryRes, productRes, storeRes] = await Promise.all([
        api.get("/owner/categories"),
        api.get("/owner/products"),
        api.get("/owner/stores")
      ]);
      setCategories(categoryRes.data);
      setProducts(productRes.data);
      setStores(storeRes.data);
      if (!selectedStoreId && storeRes.data.length > 0) {
        setSelectedStoreId(String(storeRes.data[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load owner data.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;
    const loadAvailability = async () => {
      try {
        const { data } = await api.get(`/owner/stores/${selectedStoreId}/availability`);
        setAvailability(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load availability.");
      }
    };
    loadAvailability();
  }, [selectedStoreId]);

  const setInfo = (msg) => {
    setMessage(msg);
    setError("");
  };

  const setFailure = (err) => {
    setMessage("");
    setError(err.response?.data?.message || "Request failed.");
  };

  const createCategory = async () => {
    try {
      await api.post("/owner/categories", { name: categoryName });
      setCategoryName("");
      setInfo("Category created.");
      await loadAll();
    } catch (err) {
      setFailure(err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/owner/categories/${id}`);
      setInfo("Category deleted.");
      await loadAll();
    } catch (err) {
      setFailure(err);
    }
  };

  const createProduct = async () => {
    try {
      await api.post("/owner/products", {
        ...productForm,
        categoryId: Number(productForm.categoryId)
      });
      setProductForm(initialProduct);
      setInfo("Product created.");
      await loadAll();
    } catch (err) {
      setFailure(err);
    }
  };

  const toggleProduct = async (product) => {
    try {
      await api.put(`/owner/products/${product.id}`, { active: !product.active });
      setInfo("Product updated.");
      await loadAll();
    } catch (err) {
      setFailure(err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/owner/products/${id}`);
      setInfo("Product deleted.");
      await loadAll();
    } catch (err) {
      setFailure(err);
    }
  };

  const createStore = async () => {
    try {
      await api.post("/owner/stores", newStore);
      setNewStore({ name: "", location: "" });
      setInfo("Store created.");
      await loadAll();
    } catch (err) {
      setFailure(err);
    }
  };

  const createStorekeeper = async () => {
    try {
      await api.post("/owner/users/storekeepers", {
        ...newStorekeeper,
        storeId: Number(newStorekeeper.storeId)
      });
      setNewStorekeeper({ email: "", password: "", storeId: "" });
      setInfo("Storekeeper created.");
    } catch (err) {
      setFailure(err);
    }
  };

  const toggleAvailability = async (productId, checked) => {
    if (!selectedStoreId) return;
    try {
      await api.put(`/owner/stores/${selectedStoreId}/availability`, {
        items: [{ productId, isAvailable: checked }]
      });
      const { data } = await api.get(`/owner/stores/${selectedStoreId}/availability`);
      setAvailability(data);
      setInfo("Availability updated.");
    } catch (err) {
      setFailure(err);
    }
  };

  const activeByProductId = availability.reduce((acc, row) => {
    acc[row.productId] = row.isAvailable;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="h4 mb-3">Owner Management</h1>
      {message && <div className="alert alert-success py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6">Categories</h2>
              <div className="input-group mb-2">
                <input
                  className="form-control"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="New category"
                />
                <button className="btn btn-primary" onClick={createCategory}>Add</button>
              </div>
              <ul className="list-group">
                {categories.map((category) => (
                  <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {category.name}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(category.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6">Stores</h2>
              <div className="row g-2 mb-2">
                <div className="col-12 col-md-5">
                  <input
                    className="form-control"
                    placeholder="Store name"
                    value={newStore.name}
                    onChange={(e) => setNewStore((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-5">
                  <input
                    className="form-control"
                    placeholder="Location"
                    value={newStore.location}
                    onChange={(e) => setNewStore((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-2 d-grid">
                  <button className="btn btn-primary" onClick={createStore}>Add</button>
                </div>
              </div>
              <select
                className="form-select mb-2"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
              >
                <option value="">Select store for availability</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} ({store.location || "N/A"})
                  </option>
                ))}
              </select>
              <ul className="list-group small">
                {stores.map((store) => (
                  <li key={store.id} className="list-group-item">
                    {store.name} - {store.active ? "Active" : "Inactive"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Products</h2>
              <div className="row g-2 mb-3">
                <div className="col-12 col-md-3">
                  <input
                    className="form-control"
                    placeholder="Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <input
                    className="form-control"
                    placeholder="Size (e.g. 500ml)"
                    value={productForm.sizeDescription}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, sizeDescription: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <input
                    className="form-control"
                    placeholder="Image URL"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-2">
                  <select
                    className="form-select"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  >
                    <option value="">Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-1 d-grid">
                  <button className="btn btn-primary" onClick={createProduct}>Add</button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Available</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category?.name || "-"}</td>
                        <td>{product.sizeDescription || "-"}</td>
                        <td>{product.active ? "Active" : "Inactive"}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={Boolean(activeByProductId[product.id])}
                            onChange={(e) => toggleAvailability(product.id, e.target.checked)}
                            disabled={!selectedStoreId}
                          />
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => toggleProduct(product)}
                          >
                            Toggle Active
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(product.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Create Storekeeper Account</h2>
              <div className="row g-2">
                <div className="col-12 col-md-4">
                  <input
                    className="form-control"
                    placeholder="Email"
                    type="email"
                    value={newStorekeeper.email}
                    onChange={(e) => setNewStorekeeper((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <input
                    className="form-control"
                    placeholder="Password"
                    type="password"
                    value={newStorekeeper.password}
                    onChange={(e) => setNewStorekeeper((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <select
                    className="form-select"
                    value={newStorekeeper.storeId}
                    onChange={(e) => setNewStorekeeper((prev) => ({ ...prev, storeId: e.target.value }))}
                  >
                    <option value="">Select Store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-2 d-grid">
                  <button className="btn btn-primary" onClick={createStorekeeper}>
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
