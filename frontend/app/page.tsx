"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/api';
import { clearSession, getSessionUser, isSessionActive } from '../lib/session';

const fallbackProducts = [
  {
    id: '1',
    title: 'Velvet Matte Lipstick Set',
    description: 'Creamy longwear lipstick shades for day-to-night glam.',
    price: 1950,
    category: 'Makeup',
    tag: 'New',
    image: 'https://placehold.co/400x400/ff85b3/4e2f4b?text=Lipstick+Set',
  },
  {
    id: '2',
    title: 'Botanical Glow Serum',
    description: 'Hydrating serum with vitamin C and rose water for radiant skin.',
    price: 2850,
    category: 'Skincare',
    tag: 'Popular',
    image: 'https://placehold.co/400x400/73d0f4/4e2f4b?text=Glow+Serum',
  },
  {
    id: '3',
    title: 'Silk Scarf Hair Set',
    description: 'Comfy satin scrunchies and scarf for frizz-free styling.',
    price: 1290,
    category: 'Hair Care',
    tag: 'Featured',
    image: 'https://placehold.co/400x400/ffd8e8/4e2f4b?text=Hair+Set',
  },
  {
    id: '4',
    title: 'Compact Mirror Kit',
    description: 'Travel-ready mirror set with lights and grooming accessories.',
    price: 1420,
    category: 'Accessories',
    tag: 'Best Seller',
    image: 'https://placehold.co/400x400/ffb6d8/4e2f4b?text=Mirror+Kit',
  },
  {
    id: '5',
    title: 'Jasmine Bloom Perfume',
    description: 'A delicate floral fragrance with warm musk base notes.',
    price: 3600,
    category: 'Fragrances',
    tag: 'Limited',
    image: 'https://placehold.co/400x400/fde8f0/4e2f4b?text=Perfume',
  },
  {
    id: '6',
    title: 'Glow Brush Trio',
    description: 'Soft makeup brushes for flawless foundation, blush, and highlight.',
    price: 1490,
    category: 'Accessories',
    tag: 'New',
    image: 'https://placehold.co/400x400/ffd4e5/4e2f4b?text=Brush+Trio',
  },
];

const categories = [
  { label: 'All', icon: '✨' },
  { label: 'Makeup', icon: '💄' },
  { label: 'Skincare', icon: '✨' },
  { label: 'Hair Care', icon: '💇' },
  { label: 'Accessories', icon: '🎀' },
  { label: 'Fragrances', icon: '🌸' },
];

export default function HomePage() {
  type Product = {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    tag: string;
    image: string;
    images?: string[];
  };

  type CartItem = Product & { quantity: number };

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bb_cart');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bb_cart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const active = isSessionActive();
    if (!active) {
      clearSession();
      setName(null);
      return;
    }
    const session = getSessionUser();
    setName(session?.userName || null);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      setProductError(null);
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(
            data.map((product: any) => ({
              id: product._id || product.id,
              title: product.title,
              description: product.description,
              price: product.price,
              category: product.category,
              tag: product.tag || 'New',
              image: product.images?.[0] || 'https://placehold.co/400x400/ffd4e5/4e2f4b?text=Product',
            })),
          );
        }
      } catch (error) {
        console.error(error);
        setProductError('Unable to load products at the moment. Showing featured items.');
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => selectedCategory === 'All' || product.category === selectedCategory),
    [selectedCategory, products],
  );

  function saveCartToStorage(items: CartItem[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bb_cart', JSON.stringify(items));
    }
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        // notify user item already added and keep cart unchanged
        setNotice('Item already in cart');
        window.setTimeout(() => setNotice(null), 2500);
        return current;
      }
      const nextCart = [...current, { ...product, quantity: 1 }];
      saveCartToStorage(nextCart);
      setNotice('Item added to cart');
      window.setTimeout(() => setNotice(null), 1500);
      return nextCart;
    });
  }

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="home-page">
      <section className="hero-page">
        <div className="hero-copy home-hero-copy">
          <span className="eyebrow">Blush & Bloom</span>
          <h1>{name ? `Welcome back, ${name}` : 'Welcome to Blush & Bloom'}</h1>
          <p>Shop curated beauty essentials across makeup, skincare, hair care, accessories and fragrances.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => router.push('/checkout')}>
              View cart ({count})
            </button>
            <a href="#products" className="button button-secondary">
              Browse collection
            </a>
          </div>
        </div>
        <div className="hero-visual hero-storefront-card">
          <div className="hero-card accent-pink">Beautiful pieces</div>
          <div className="hero-card accent-orange">Easy checkout</div>
          <div className="hero-card accent-blue">Secure shopping</div>
        </div>
      </section>

      <section className="category-filter-section">
        <div className="section-header">
          <p className="eyebrow">Shop by category</p>
          <h2>Find your favorites fast</h2>
        </div>
        <div className="category-pill-list">
          {categories.map((category) => (
            <button
              key={category.label}
              className={`category-pill ${selectedCategory === category.label ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.label)}
              type="button"
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="storefront-section" id="products">
        <div className="storefront-header">
          <div>
            <p className="eyebrow">Explore</p>
            <h2>{selectedCategory === 'All' ? 'All categories' : selectedCategory}</h2>
          </div>
          <div className="cart-tally">Cart items: {count}</div>
        </div>
        {productError && <p className="muted">{productError}</p>}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card store-card">
              <div className="product-preview" onClick={() => setSelectedProduct(product)}>
                <img src={product.image} alt={product.title} />
              </div>
              <div className="product-content">
                <div className="product-card-top">
                  <div className="product-badge accent-pink">{product.tag}</div>
                  <span className="product-category">{product.category}</span>
                </div>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">Ksh {product.price.toLocaleString()}</span>
                  <button className="button button-primary small" onClick={() => addToCart(product)}>
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <div className="product-modal-image">
              <img src={selectedProduct.image} alt={selectedProduct.title} />
            </div>
            <div className="product-modal-details">
              <button className="close-modal" onClick={() => setSelectedProduct(null)} type="button">
                × Close
              </button>
              <span className="eyebrow">{selectedProduct.category}</span>
              <h2>{selectedProduct.title}</h2>
              <p>{selectedProduct.description}</p>
              <p className="product-price">Ksh {selectedProduct.price.toLocaleString()}</p>
              <button className="button button-primary" onClick={() => addToCart(selectedProduct)}>
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}
      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}
