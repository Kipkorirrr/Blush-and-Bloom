"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/api';

const categoryOptions = ['Makeup', 'Skincare', 'Hair Care', 'Accessories', 'Fragrances'];

type Product = {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock?: number;
};

type OrderSummary = {
  _id: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customer: { name: string; email: string };
};

export default function AdminPage() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Makeup');
  const [imageUrl, setImageUrl] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    setStatus(role === 'admin' ? 'authorized' : 'unauthorized');
    if (typeof window !== 'undefined') {
      setUserName(window.localStorage.getItem('user_name'));
    }
  }, []);

  useEffect(() => {
    if (status !== 'authorized') return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setStatus('unauthorized');
      return;
    }

    async function loadData() {
      setLoadingProducts(true);
      setLoadingOrders(true);
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!productsRes.ok) {
          throw new Error('Unable to load products');
        }

        if (!ordersRes.ok) {
          throw new Error('Unable to load orders');
        }

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        setProducts(productsData || []);
        setOrders(ordersData || []);
      } catch (error) {
        console.error(error);
        setMessage('Unable to load admin data right now.');
      } finally {
        setLoadingProducts(false);
        setLoadingOrders(false);
      }
    }

    loadData();
  }, [status]);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setMessage('Admin token not found. Please log in again.');
      return;
    }

    if (!title || !description || !price || !imageUrl) {
      setMessage('Please fill in all fields.');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          category,
          images: [imageUrl],
          stock: Number(stock) || 0,
        }),
      });
      const newProduct = await response.json();
      if (!response.ok) {
        setMessage(newProduct.message || 'Unable to create product.');
        setCreating(false);
        return;
      }
      setProducts((current) => [newProduct, ...current]);
      setTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageUrl('');
      setMessage('Product created successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Network error while creating product.');
    } finally {
      setCreating(false);
    }
  }

  async function deleteProduct(id: string | undefined) {
    if (!id) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setMessage('Admin token not found.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Unable to delete product');
      }
      setProducts((current) => current.filter((product) => product._id !== id));
      setMessage('Product removed successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete product.');
    }
  }

  async function updateOrderStatus(id: string, status: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setMessage('Admin token not found.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        setMessage(error.message || 'Unable to update order.');
        return;
      }
      const updatedOrder = await res.json();
      setOrders((current) => current.map((item) => (item._id === updatedOrder._id ? updatedOrder : item)));
      setMessage('Order status updated.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to update order status.');
    }
  }

  if (status === 'loading') {
    return (
      <main className="auth-hero">
        <div className="auth-card">
          <h1>Checking admin access…</h1>
          <p className="muted">Please wait while we verify your credentials.</p>
        </div>
      </main>
    );
  }

  if (status === 'unauthorized') {
    return (
      <main className="auth-hero">
        <div className="auth-card">
          <h1>Admin access required</h1>
          <p className="muted">Please log in with your store admin credentials to access this dashboard.</p>
          <button className="button button-primary" onClick={() => router.push('/login')}>
            Log in
          </button>
        </div>
      </main>
    );
  }

  const lowStockCount = products.filter((product) => (product.stock ?? 0) <= 5).length;
  const compactMode = products.length > 8;

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <h2>Admin Tools</h2>
        <nav>
          <a href="#product-form">Add product</a>
          <a href="#product-list">Product list</a>
          <a href="#order-list">Orders</a>
        </nav>
      </aside>
      <main className="admin-content">
        <section className="dashboard-hero admin-hero">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Welcome back, {userName ?? 'Admin'}</h1>
            <p>Populate your catalog, manage orders, and keep your inventory fresh.</p>
          </div>
        </section>

        <section className="stat-grid">
          <div className="summary-card panel-pink">
            <h3>Total products</h3>
            <p>{products.length}</p>
          </div>
          <div className="summary-card panel-orange">
            <h3>Orders</h3>
            <p>{orders.length}</p>
          </div>
          <div className="summary-card panel-blue">
            <h3>Low stock</h3>
            <p>{lowStockCount}</p>
          </div>
        </section>

        <section id="product-form" className="admin-section">
          <div className="section-header">
            <h2>Add a new product</h2>
            <p>Upload product details and assign the correct category for easy filtering.</p>
          </div>
          <form className="product-form" onSubmit={handleCreateProduct}>
            <label className="form-field">
              <span>Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Description</span>
              <textarea className="large-textarea" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Price (Ksh)</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Image URL</span>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Stock quantity</span>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </label>
            {message && <div className="form-error">{message}</div>}
            <div className="form-actions">
              <button className="button button-primary" type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create product'}
              </button>
            </div>
          </form>
        </section>

        <section id="order-list" className="admin-section">
          <div className="section-header">
            <h2>Incoming orders</h2>
            <p>{loadingOrders ? 'Loading orders…' : 'Manage active orders and track payment status.'}</p>
          </div>
          {orders.length === 0 ? (
            <div className="empty-cart-card">
              <h2>No orders yet</h2>
              <p>Customer orders will appear here once placed.</p>
            </div>
          ) : (
            <div className="cart-items-list">
              {orders.map((orderItem) => (
                <div key={orderItem._id} className="cart-item-card">
                  <div>
                    <p className="cart-item-category">{orderItem.paymentMethod.toUpperCase()}</p>
                    <h3>{orderItem.customer.name}</h3>
                    <p>{orderItem.customer.email}</p>
                    <p>Order total: Ksh {orderItem.total.toLocaleString()}</p>
                    <p>Status: {orderItem.status}</p>
                    <p>Payment: {orderItem.paymentStatus}</p>
                  </div>
                  <div className="cart-item-meta">
                    {orderItem.status === 'pending' && (
                      <button className="button button-secondary small" type="button" onClick={() => updateOrderStatus(orderItem._id, 'shipped')}>
                        Mark shipped
                      </button>
                    )}
                    {orderItem.status === 'shipped' && (
                      <button className="button button-primary small" type="button" onClick={() => updateOrderStatus(orderItem._id, 'completed')}>
                        Mark completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="product-list" className="product-section">
          <div className="section-header">
            <h2>Product list</h2>
            <p>{loadingProducts ? 'Loading products…' : 'Review products currently in the catalog.'}</p>
          </div>
          <div className={`product-grid ${compactMode ? 'compact' : ''}`}>
            {products.map((product) => (
              <article key={product._id ?? product.title} className="product-card store-card">
                <div className="product-preview">
                  <img src={product.images?.[0] ?? ''} alt={product.title} />
                </div>
                <div className="product-content">
                  <div className="product-card-top">
                    <span className="product-category">{product.category}</span>
                  </div>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <p style={{ fontWeight: 700 }}>Stock: {product.stock ?? 0}</p>
                  <div className="product-footer">
                    <span className="product-price">Ksh {product.price.toLocaleString()}</span>
                    <button className="button button-secondary small" type="button" onClick={() => deleteProduct(product._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
