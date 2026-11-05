import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import api from "../services/api";
import { getUser } from "../utils/auth";
import "../styles/account.css";

const priceFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const emptyProduct = {
  productId: "",
  productName: "",
  productPrice: "",
  category: "Tops",
  size: "",
  color: "",
  brand: "",
  gender: "Unisex",
  quantity: "",
  description: "",
  imageUrl: "",
};

const transitions = {
  placed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function Admin() {
  const currentUser = getUser();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProducts() {
    const { data } = await api.get("/api/products");
    setProducts(Array.isArray(data) ? data : []);
  }

  async function loadUsers() {
    const { data } = await api.get("/api/admin/users");
    setUsers(data.users || []);
  }

  async function loadOrders() {
    const { data } = await api.get("/api/orders");
    setOrders(data.orders || []);
  }

  async function loadAnalytics() {
    const { data } = await api.get("/api/analytics");
    setAnalytics(data.analytics || []);
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setNotice("");

    const loaders = {
      products: loadProducts,
      users: loadUsers,
      orders: loadOrders,
      analytics: loadAnalytics,
    };

    loaders[tab]()
      .catch((requestError) => {
        if (active && requestError.response?.status !== 401) {
          setError(
            requestError.response?.data?.message ||
              "We couldn’t load this section. Please try again.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tab]);

  function changeProduct(event) {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
    setError("");
    setNotice("");
  }

  function resetProductForm() {
    setProductForm(emptyProduct);
    setEditingId(null);
  }

  function editProduct(product) {
    setEditingId(product.productId);
    setProductForm({
      productId: String(product.productId),
      productName: product.productName,
      productPrice: String(product.productPrice),
      category: product.category,
      size: (product.size || []).join(", "),
      color: product.color || "",
      brand: product.brand || "",
      gender: product.gender || "Unisex",
      quantity: String(product.quantity),
      description: product.description,
      imageUrl: product.imageUrl || "",
    });
    setError("");
    setNotice("");
    window.scrollTo(0, 0);
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (busy) return;

    const payload = {
      productId: Number(productForm.productId),
      productName: productForm.productName.trim(),
      productPrice: Number(productForm.productPrice),
      category: productForm.category,
      size: productForm.size
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      color: productForm.color.trim(),
      brand: productForm.brand.trim(),
      gender: productForm.gender,
      quantity: Number(productForm.quantity),
      description: productForm.description.trim(),
      imageUrl: productForm.imageUrl.trim(),
    };

    if (
      !Number.isSafeInteger(payload.productId) ||
      payload.productId < 1 ||
      !payload.productName ||
      !Number.isFinite(payload.productPrice) ||
      payload.productPrice < 0 ||
      !Number.isSafeInteger(payload.quantity) ||
      payload.quantity < 0 ||
      !payload.description
    ) {
      setError("Please fill all required fields with valid values.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
        setNotice("Product updated.");
      } else {
        await api.post("/api/products", payload);
        setNotice("Product added.");
      }
      resetProductForm();
      await loadProducts();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t save that product. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product) {
    if (busy || !window.confirm(`Delete ${product.productName}?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.delete(`/api/products/${product.productId}`);
      if (editingId === product.productId) resetProductForm();
      setNotice("Product deleted.");
      await loadProducts();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t delete that product. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(user) {
    if (busy) return;
    const role = user.role === "admin" ? "user" : "admin";
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.patch(`/api/admin/users/${encodeURIComponent(user.emailId)}/role`, {
        role,
      });
      setNotice(`Role set to ${role}.`);
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t update that user. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateOrderStatus(orderId, status) {
    if (!status || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      setNotice(`Order marked as ${status}.`);
      await loadOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn’t update that order. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="account-page admin-page" id="main-content">
        <header className="account-heading">
          <h1>Admin</h1>
        </header>

        <div className="tabs" role="tablist" aria-label="Admin sections">
          {["products", "users", "orders", "analytics"].map((name) => (
            <button
              key={name}
              type="button"
              className={tab === name ? "active" : ""}
              aria-pressed={tab === name}
              onClick={() => setTab(name)}
            >
              {name[0].toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="form-notice notice-error" role="alert">
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="form-notice notice-success" role="status">
            <span>{notice}</span>
          </div>
        )}

        {loading ? (
          <div className="account-panel">Loading…</div>
        ) : tab === "products" ? (
          <>
            <section className="account-panel">
              <h2>{editingId ? "Edit product" : "Add product"}</h2>
              <form className="admin-form" onSubmit={saveProduct}>
                <div className="form-grid">
                  <label>
                    Product ID
                    <input
                      name="productId"
                      type="number"
                      min="1"
                      value={productForm.productId}
                      onChange={changeProduct}
                      disabled={Boolean(editingId)}
                      required
                    />
                  </label>
                  <label>
                    Name
                    <input
                      name="productName"
                      value={productForm.productName}
                      onChange={changeProduct}
                      required
                    />
                  </label>
                  <label>
                    Price
                    <input
                      name="productPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.productPrice}
                      onChange={changeProduct}
                      required
                    />
                  </label>
                  <label>
                    Category
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={changeProduct}
                    >
                      {["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories"].map(
                        (category) => (
                          <option key={category}>{category}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    Quantity
                    <input
                      name="quantity"
                      type="number"
                      min="0"
                      value={productForm.quantity}
                      onChange={changeProduct}
                      required
                    />
                  </label>
                  <label>
                    Sizes (comma separated)
                    <input
                      name="size"
                      value={productForm.size}
                      onChange={changeProduct}
                    />
                  </label>
                  <label>
                    Color
                    <input
                      name="color"
                      value={productForm.color}
                      onChange={changeProduct}
                    />
                  </label>
                  <label>
                    Brand
                    <input
                      name="brand"
                      value={productForm.brand}
                      onChange={changeProduct}
                    />
                  </label>
                  <label>
                    Gender
                    <select
                      name="gender"
                      value={productForm.gender}
                      onChange={changeProduct}
                    >
                      {["Men", "Women", "Unisex"].map((gender) => (
                        <option key={gender}>{gender}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Image URL
                    <input
                      name="imageUrl"
                      value={productForm.imageUrl}
                      onChange={changeProduct}
                    />
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    name="description"
                    rows="3"
                    value={productForm.description}
                    onChange={changeProduct}
                    required
                  />
                </label>
                <div className="form-actions">
                  <Button type="submit" variant="blue" disabled={busy}>
                    {busy ? "Saving…" : editingId ? "Update product" : "Add product"}
                  </Button>
                  {editingId && (
                    <Button onClick={resetProductForm} disabled={busy}>
                      Cancel edit
                    </Button>
                  )}
                </div>
              </form>
            </section>

            <section className="account-panel">
              <h2>Products</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.productId}>
                        <td>{product.productId}</td>
                        <td>{product.productName}</td>
                        <td>{product.category}</td>
                        <td>{priceFormat.format(product.productPrice)}</td>
                        <td>{product.quantity}</td>
                        <td className="table-actions">
                          <button
                            type="button"
                            className="table-button"
                            onClick={() => editProduct(product)}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="table-button danger"
                            onClick={() => deleteProduct(product)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : tab === "users" ? (
          <section className="account-panel">
            <h2>Users</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.emailId}>
                      <td>{user.username}</td>
                      <td>{user.emailId}</td>
                      <td>
                        <span className={`status-pill status-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.emailId !== currentUser?.emailId && (
                          <button
                            type="button"
                            className="table-button"
                            disabled={busy}
                            onClick={() => changeRole(user)}
                          >
                            {user.role === "admin" ? "Make user" : "Make admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : tab === "orders" ? (
          <section className="account-panel">
            <h2>Orders</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>User</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{order.emailId}</td>
                      <td>{priceFormat.format(order.totalAmount)}</td>
                      <td>
                        <span className={`status-pill status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value=""
                          disabled={busy || transitions[order.status].length === 0}
                          onChange={(event) =>
                            updateOrderStatus(order._id, event.target.value)
                          }
                        >
                          <option value="">Update…</option>
                          {transitions[order.status].map((status) => (
                            <option key={status} value={status}>
                              Mark {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="account-panel">
            <h2>Analytics</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Clicks</th>
                    <th>Add to cart</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.productId}</td>
                      <td>{item.productName}</td>
                      <td>{item.clicks}</td>
                      <td>{item.addToCarts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
