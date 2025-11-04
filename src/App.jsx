import { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import logo from "./assets/logo.png";
import data from "./products.json";

const currency = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function App() {
  const [route, setRoute] = useState("home");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const products = data;
  const filtered = useMemo(() => {
    let list = products;
    if (filter !== "all") list = list.filter((p) => p.category === filter);
    if (search.trim()) list = list.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [products, filter, search]);

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const total = cart.reduce((a, c) => a + c.price * c.qty, 0);

  const addToCart = (p) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].qty += 1;
        return next;
      }
      return [...prev, { id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
      return next;
    });
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="app">
      <Loader loading={loading} />

      <Header
        route={route}
        setRoute={setRoute}
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
      />

      <main>
        <AnimatePresence mode="wait">
          {route === "home" && (
            <Motion.section
              key="home"
              className="hero"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <Hero setRoute={setRoute} />
            </Motion.section>
          )}

          {route === "shop" && (
            <Motion.section
              key="shop"
              className="shop"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="section-title">Featured products</h2>
              <Filters filter={filter} setFilter={setFilter} />
              <ProductGrid products={filtered} addToCart={addToCart} />
            </Motion.section>
          )}

          {route === "about" && (
            <Motion.section
              key="about"
              className="about"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="section-title">About GramGro</h2>
              <p className="about-text">
                We craft immersive shopping experiences with bold design and fluid motion.
                Built for speed, delight, and clarity.
              </p>
            </Motion.section>
          )}
        </AnimatePresence>
      </main>

      <CartDrawer
        cart={cart}
        total={total}
        changeQty={changeQty}
        removeItem={removeItem}
      />

      <Footer />
    </div>
  );
}

function Loader({ loading }) {
  if (!loading) return null;
  return (
    <div id="loader">
      <div className="loader-logo">
        <img src={logo} alt="GramGro" />
      </div>
      <div className="loader-bar"></div>
    </div>
  );
}

function Header({ route, setRoute, search, setSearch, cartCount }) {
  return (
    <header className="site-header">
      <div className="brand">
        <img src={logo} alt="GramGro" />
        <span className="brand-text">
          <span className="gram">Gram</span><span className="gro">Gro</span>
        </span>
      </div>
      <nav className="nav">
        {["home", "shop", "about"].map((r) => (
          <a
            key={r}
            href="#"
            className={`nav-link ${route === r ? "active" : ""}`}
            onClick={(e) => { e.preventDefault(); setRoute(r); }}
          >
            {r[0].toUpperCase() + r.slice(1)}
          </a>
        ))}
      </nav>
      <div className="actions">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          placeholder="Search products…"
        />
        <button className="cart-btn" onClick={() => {
          document.getElementById("cartDrawer").classList.toggle("open");
        }}>
          <span className="icon">🛒</span>
          <span id="cartCount" className="badge">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

function Hero({ setRoute }) {
  return (
    <>
      <div className="hero-bg"></div>
      <div className="hero-content">
        <Motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="gram">Gram</span><span className="gro">Gro</span><br />
          Bold shopping for bold choices.
        </Motion.h1>
        <p className="hero-sub">Heavy visuals. Smooth motion. Fast checkout.</p>
        <div className="hero-actions">
          <a href="#" className="btn primary" onClick={(e) => { e.preventDefault(); setRoute("shop"); }}>
            Shop now
          </a>
          <a href="#" className="btn ghost" onClick={(e) => { e.preventDefault(); setRoute("about"); }}>
            Learn more
          </a>
        </div>
      </div>
    </>
  );
}

function Filters({ filter, setFilter }) {
  const chips = [
    { key: "all", label: "All" },
    { key: "electronics", label: "Electronics" },
    { key: "fashion", label: "Fashion" },
    { key: "home", label: "Home" },
  ];
  return (
    <div className="filters">
      {chips.map((c) => (
        <button
          key={c.key}
          className={`chip ${filter === c.key ? "active" : ""}`}
          onClick={() => setFilter(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function ProductGrid({ products, addToCart }) {
  return (
    <div className="grid">
      <AnimatePresence>
        {products.map((p) => (
          <Motion.div
            layout
            key={p.id}
            className="card"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-media">
              <div className="skeleton"></div>
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                onLoad={(e) => e.currentTarget.previousSibling.remove()}
              />
            </div>
            <div className="card-body">
              <div className="card-title">{p.title}</div>
              <div className="card-meta">
                <span>{p.categoryLabel}</span>
                <span className="price">{currency(p.price)}</span>
              </div>
              <div className="card-actions">
                <button className="btn sm ghost" onClick={() => alert(
                  `${p.title}\n\n${p.description}\n\nPrice: ${currency(p.price)}`
                )}>Details</button>
                <button className="btn sm primary" onClick={() => addToCart(p)}>Add to cart</button>
              </div>
            </div>
          </Motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function CartDrawer({ cart, total, changeQty, removeItem }) {
  return (
    <aside id="cartDrawer" className="cart-drawer">
      <div className="cart-header">
        <h3>Your cart</h3>
        <button className="icon-btn" onClick={() => {
          document.getElementById("cartDrawer").classList.remove("open");
        }}>✕</button>
      </div>
      <div className="cart-items">
        {cart.length === 0 && <p style={{ color: "#b6b6b6" }}>Your cart is empty.</p>}
        {cart.map((it) => (
          <div key={it.id} className="cart-item">
            <img src={it.image} alt={it.title} />
            <div>
              <div style={{ fontWeight: 700 }}>{it.title}</div>
              <div className="qty">
                <button onClick={() => changeQty(it.id, -1)}>−</button>
                <span>{it.qty}</span>
                <button onClick={() => changeQty(it.id, 1)}>+</button>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>{currency(it.price)}</div>
              <button className="icon-btn" onClick={() => removeItem(it.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="total">
          <span>Total</span>
          <strong id="cartTotal">{currency(total)}</strong>
        </div>
        <button className="btn primary full" onClick={() => alert("Checkout demo — integrate payment later.")}>
          Checkout
        </button>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      © {new Date().getFullYear()} GramGro. All rights reserved.
    </footer>
  );
}