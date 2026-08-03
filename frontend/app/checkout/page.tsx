"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../lib/api';

type CartItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
};

type Order = {
  _id: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentRequest?: { phone?: string; requestedAt?: string };
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('bb_cart');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem('bb_cart');
    const accessToken = window.localStorage.getItem('access_token');
    const storedUserId = window.localStorage.getItem('user_id');

    if (!accessToken || !storedUserId) {
      router.push('/login');
      return;
    }

    setToken(accessToken);
    setUserId(storedUserId);
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bb_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function removeItem(id: string) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) return;
    setCart((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, quantity } : item));
      if (typeof window !== 'undefined') window.localStorage.setItem('bb_cart', JSON.stringify(next));
      return next;
    });
  }

  async function handlePayment() {
    if (!token || !userId) {
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      setMessage('Your cart is empty. Add products to continue.');
      return;
    }

    if (!phone) {
      setMessage('Enter your M-Pesa phone number to continue.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({ product: item.id, quantity: item.quantity })),
          total: subtotal,
          paymentMethod: 'mpesa',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(error.message || 'Unable to create order.');
        setLoading(false);
        return;
      }

      const createdOrder: Order = await response.json();
      setOrder(createdOrder);
      localStorage.setItem('bb_cart', JSON.stringify([]));
      setCart([]);

      const payRes = await fetch(`${API_URL}/orders/${createdOrder._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });

      if (!payRes.ok) {
        const error = await payRes.json();
        setMessage(error.message || 'Unable to process payment.');
        setLoading(false);
        return;
      }

      const paidOrder: Order = await payRes.json();
      setOrder(paidOrder);
      setMessage('M-Pesa payment request sent. Complete the payment on your device.');
    } catch (error) {
      setMessage('Network error while processing your order.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="checkout-page">
      <section className="checkout-hero">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Finalize your purchase</h1>
          <p>Complete checkout with M-Pesa and confirm your order securely.</p>
        </div>
      </section>

      <section className="checkout-content">
        {order ? (
          <div className="checkout-summary-card">
            <h2>Order confirmed</h2>
            <div className="order-row">
              <span>Order ID</span>
              <span>{order._id}</span>
            </div>
            <div className="order-row">
              <span>Status</span>
              <span>{order.status}</span>
            </div>
            <div className="order-row">
              <span>Payment</span>
              <span>{order.paymentStatus}</span>
            </div>
            <div className="order-row">
              <span>Total</span>
              <span>Ksh {order.total.toLocaleString()}</span>
            </div>
            <button className="button button-primary" type="button" onClick={() => router.push('/')}>
              Continue shopping
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="empty-cart-card">
            <h2>Your cart is empty</h2>
            <p>Add products from the storefront and come back to checkout.</p>
            <button className="button button-primary" onClick={() => router.push('/')}>Browse products</button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div>
                    <p className="cart-item-category">{item.category}</p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="cart-item-meta">
                    <label>
                      Qty:
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        style={{ width: '64px', marginLeft: '0.5rem' }}
                      />
                    </label>
                    <span>Ksh {item.price.toLocaleString()}</span>
                    <button className="button button-secondary small" type="button" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="checkout-summary-card">
              <h2>Order summary</h2>
              <div className="order-row">
                <span>Items</span>
                <span>{cart.reduce((s, it) => s + it.quantity, 0)}</span>
              </div>
              <div className="order-row">
                <span>Subtotal</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>
              <label className="form-field">
                <span>M-Pesa phone number</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
              </label>
              {message && <div className="form-error">{message}</div>}
              <button className="button button-primary" type="button" onClick={handlePayment} disabled={loading}>
                {loading ? 'Processing…' : 'Pay with M-Pesa'}
              </button>
            </aside>
          </>
        )}
      </section>
    </main>
  );
}
