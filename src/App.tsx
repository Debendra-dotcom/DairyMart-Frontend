import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import {
  ShoppingCart, Leaf, Truck, ShieldCheck,
  Minus, Plus, X, Smartphone, Apple, ArrowLeft, CreditCard, PackageCheck,
  MapPin, Clock, TicketPercent, WalletCards, BadgeIndianRupee, CheckCircle2,
  Home, PackageSearch, AlertTriangle, RefreshCw, ShoppingBag
} from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import HomeDashboard from "./components/home/HomeDashboard";
import HeroProductSection from "./components/home/HeroProductSection";
import Orders from "./pages/Orders";
import ProfilePage from "./pages/ProfilePage";
import ProductSearchBar from "./components/products/ProductSearchBar";
import ProductCategoryDropdown from "./components/products/ProductCategoryDropdown";
import { Toaster } from "./components/ui/sonner";
import { Skeleton } from "./components/ui/skeleton";
import type { Product, ProductCategoryOption } from "./types/product";
import { getAddresses } from "./services/profileApi";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import type { Address } from "./types/profile";

// ===== TYPES =====
interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

// ===== CART CONTEXT =====
const CartContext = createContext<CartContextType | null>(null);

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

function getCartStorageKey(userId?: number | null) {
  return `sr_cart:${userId ?? "guest"}`;
}

function readStoredCart(key: string): CartItem[] {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCart(key: string, value: CartItem[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== PRODUCT DATA - fetched from backend =====
// Products are loaded via API in the App component below

const ALL_PRODUCTS_CATEGORY = "all";
const blockedEmailDomains = new Set([
  "example.com",
  "example.in",
  "test.com",
  "invalid.com",
  "fake.com",
  "localhost",
  "mailinator.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getEmailValidationMessage(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return "Email is required";
  if (!emailPattern.test(email) || email.includes("..")) return "Enter a valid email address";

  const [localPart, domain] = email.split("@");
  if (!localPart || !domain || localPart.startsWith(".") || localPart.endsWith(".")) {
    return "Enter a valid email address";
  }
  if (
    blockedEmailDomains.has(domain) ||
    domain.endsWith(".test") ||
    domain.endsWith(".invalid") ||
    domain.endsWith(".local")
  ) {
    return "Use a real email provider domain";
  }
  return "";
}

function toTitleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getProductBadges(product: Product) {
  return [
    ...(Array.isArray(product.tags) ? product.tags : []),
    ...(Array.isArray(product.badges) ? product.badges : []),
    product.badge,
  ].filter(Boolean) as string[];
}

function getProductSearchText(product: Product) {
  return [
    product.name,
    product.category,
    product.variant,
    ...getProductBadges(product),
  ].join(" ").toLowerCase();
}

function productMatchesQuery(product: Product, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return getProductSearchText(product).includes(normalizedQuery);
}

function getCategoryOptions(products: Product[]): ProductCategoryOption[] {
  const seen = new Map<string, string>();
  products.forEach((product) => {
    const value = product.category?.trim();
    if (!value || seen.has(value)) return;
    seen.set(value, toTitleCase(value));
  });

  return [
    { value: ALL_PRODUCTS_CATEGORY, label: "All Products" },
    ...Array.from(seen, ([value, label]) => ({ value, label })),
  ];
}

// ===== NAVIGATION BAR =====
function Navbar({
  isLoggedIn,
  userEmail,
  userName,
  userImage,
  setShowLoginModal,
  setIsLoggedIn,
}: {
  isLoggedIn: boolean;
  userEmail: string;
  userName?: string;
  userImage?: string | null;
  setShowLoginModal: (value: boolean) => void;
  setIsLoggedIn: (value: boolean) => void;
}) {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [badgeAnimating, setBadgeAnimating] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const prevCountRef = useRef(cartCount);
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: ShoppingBag },
    { label: "Orders", href: "/orders", icon: PackageCheck },
  ];

  useEffect(() => {
    if (cartCount !== prevCountRef.current && cartCount > 0) {
      setBadgeAnimating(true);
      const timer = setTimeout(() => setBadgeAnimating(false), 300);
      prevCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: "rgba(169, 136, 72, 0.24)",
        background:
          "linear-gradient(90deg, rgba(248,239,220,0.78), rgba(231,242,229,0.76))",
        boxShadow: "0 10px 30px rgba(52, 50, 34, 0.08)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-[60px] md:h-[70px] flex items-center justify-between gap-3">

        {/* Logo */}
        <button type="button" onClick={() => navigate("/")} className="flex shrink-0 items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff5200]/30">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--sr-orange)" }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>

          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--sr-orange)" }}
          >
            SR
          </span>

          <span
            className="text-sm font-semibold hidden sm:inline"
            style={{ color: "var(--sr-dark)" }}
          >
            Dairy
          </span>
        </button>

        <div className="hidden items-center gap-1 rounded-full border border-[#e1dccb] bg-white/55 p-1 shadow-sm md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => navigate(item.href)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  isActive ? "bg-[#152015] text-white shadow-sm" : "text-[#475241] hover:bg-white/80 hover:text-[#152015]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Login / Profile */}
          {!isLoggedIn ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--sr-orange)" }}
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full text-white font-bold overflow-hidden"
                style={{ backgroundColor: "var(--sr-orange)" }}
              >
                {userImage ? (
                  <img src={userImage} alt={userName || userEmail} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  (userName || userEmail)?.charAt(0).toUpperCase()
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-50 p-3">
                  <button
  onClick={() => navigate("/orders")}
  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
>
  My Orders
</button>
<button
  onClick={() => navigate("/profile")}
  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
>
  My Profile
</button>

                  <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                  <p className="text-sm font-semibold truncate mb-3">
                    {userName || userEmail}
                  </p>

        

                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                    Address
                  </button>

                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                    Support
                  </button>

                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setShowProfileMenu(false);
                      toast.success("Logged out");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-500"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <button
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => navigate("/cart")}
            aria-label="Open cart"
          >
            <ShoppingCart
              className="w-6 h-6"
              style={{ color: "var(--sr-dark)" }}
            />

            {cartCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold text-white flex items-center justify-center ${
                  badgeAnimating ? "animate-pulse-badge" : ""
                }`}
                style={{ backgroundColor: "var(--sr-orange)" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

function BetaBanner() {
  return (
    <div className="border-b border-[#e1dccb] bg-[#152015] px-4 py-2 text-center text-xs font-medium text-white/85 sm:text-sm">
      Bringing you pure, fresh dairy products right to your doorstep.
    </div>
  );
}

function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: ShoppingBag },
    { label: "Orders", href: "/orders", icon: PackageCheck },
  ];

  return (
    <div className="sticky top-[60px] z-40 border-b border-[#e1dccb] bg-[#fbf8ef]/92 px-3 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => navigate(item.href)}
              className={`flex min-h-10 items-center justify-center gap-1.5 rounded-full text-xs font-black transition ${
                isActive ? "bg-[#152015] text-white shadow-sm" : "bg-white/70 text-[#475241]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8d2bf] bg-white/75 px-5 py-10 text-center shadow-[0_14px_34px_rgba(34,45,31,0.06)] sm:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef8ea] text-[#2f6b3f]">
        {icon}
      </div>
      <p className="mt-4 text-xl font-black text-[#18251b]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[#6a735f]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function ProductsLoadingState() {
  return (
    <div className="min-h-screen bg-[#fbf8ef]">
      <Toaster richColors position="top-right" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="mt-3 h-9 w-56 rounded-xl" />
          </div>
          <Skeleton className="hidden h-11 w-32 rounded-full sm:block" />
        </div>
        <div className="mb-6 rounded-2xl border border-[#e1dccb] bg-white/60 p-3">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[#e1dccb] bg-white/80 p-3 shadow-sm">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="mt-4 h-4 w-4/5" />
              <Skeleton className="mt-2 h-3 w-1/2" />
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#fbf8ef] px-4 py-12">
      <Toaster richColors position="top-right" />
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={<AlertTriangle className="h-7 w-7" />}
          title="Products could not load"
          description="We could not reach the product catalogue. Check the server connection and try again."
          action={
            <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-full bg-[#152015] px-5 py-2.5 text-sm font-black text-white">
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          }
        />
      </div>
    </div>
  );
}

// ===== CATEGORY PILLS =====
function CategoryPills({
  activeCategory,
  categories,
  onCategoryClick,
}: {
  activeCategory: string;
  categories: ProductCategoryOption[];
  onCategoryClick: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="sticky top-[116px] md:top-[70px] z-40 border-b py-3 backdrop-blur-xl"
      style={{
        borderColor: 'rgba(169, 136, 72, 0.22)',
        background:
          'linear-gradient(90deg, rgba(248,239,220,0.72), rgba(231,242,229,0.70))',
        boxShadow: '0 14px 28px rgba(52, 50, 34, 0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`category-pill ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => onCategoryClick(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ onStartOrder }: { onStartOrder: () => void }) {
  return <HeroProductSection onStartOrder={onStartOrder} />;
}

// ===== PRODUCT CARD =====
function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="product-card">
      {/* Image */}
      <button
        type="button"
        onClick={() => navigate(`/product/${product.id}`)}
        className="relative block aspect-square w-full overflow-hidden text-left"
        style={{ borderRadius: '16px 16px 0 0' }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="product-image w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {product.inStock && (
          <span
            className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#E8F5E9', color: 'var(--sr-success)' }}
          >
            In Stock
          </span>
        )}
      </button>

      {/* Card Body */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => navigate(`/product/${product.id}`)}
          className="block w-full truncate text-left text-sm font-semibold"
          style={{ color: 'var(--sr-dark)' }}
        >
          {product.name}
        </button>
        <p className="text-xs mt-0.5" style={{ color: 'var(--sr-medium)' }}>
          {product.variant}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-bold" style={{ color: 'var(--sr-gold)' }}>
            ₹{product.price}
          </span>

          {quantity === 0 ? (
            <button
              className="add-btn px-5 py-1.5"
              onClick={() => addToCart(product)}
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-2" style={{ backgroundColor: '#FFF3E0', borderRadius: '9999px', padding: '2px 6px' }}>
              <button
                className="stepper-btn"
                style={{ backgroundColor: 'var(--sr-orange)', color: 'white' }}
                onClick={() => {
                  if (quantity <= 1) {
                    removeFromCart(product.id);
                  } else {
                    updateQuantity(product.id, quantity - 1);
                  }
                }}
              >
                {quantity <= 1 ? <X className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              </button>
              <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--sr-dark)' }}>
                {quantity}
              </span>
              <button
                className="stepper-btn"
                style={{ backgroundColor: 'var(--sr-orange)', color: 'white' }}
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="sr-page-transition min-h-[calc(100vh-130px)] bg-[#fbf8ef]">
      {children}
    </main>
  );
}

function HomePage({ onStartOrder, onLogin }: { onStartOrder: () => void; onLogin: () => void }) {
  return (
    <PageShell>
      <Hero onStartOrder={onStartOrder} />
      <HomeDashboard onLogin={onLogin} />
      <PromoBanner />
      <TrustSection />
    </PageShell>
  );
}

function ProductListingPage({
  products,
  activeCategory,
  categories,
  onCategoryChange,
}: {
  products: Product[];
  activeCategory: string;
  categories: ProductCategoryOption[];
  onCategoryChange: (category: string) => void;
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const shownProducts = products.filter((product) => {
    const matchesCategory = activeCategory === ALL_PRODUCTS_CATEGORY || product.category === activeCategory;
    return matchesCategory && productMatchesQuery(product, searchQuery);
  });
  const suggestions = products.filter((product) => productMatchesQuery(product, searchQuery)).slice(0, 6);
  const category = categories.find((item) => item.value === activeCategory);
  const hasActiveSearch = Boolean(searchQuery.trim());
  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <PageShell>
      <section className="px-4 py-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <button onClick={handleBack} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#2f6b3f]">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f7e3f]">Products</p>
              <h1 className="text-3xl font-black text-[#18251b] md:text-4xl">{category?.label || "All products"}</h1>
            </div>
            <Link to="/cart" className="inline-flex items-center justify-center rounded-full bg-[#152015] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5">
              View Cart
            </Link>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-[1.5rem] border border-[#e1dccb] bg-white/55 p-3 shadow-[0_18px_44px_rgba(34,45,31,0.07)] backdrop-blur md:flex-row md:items-center">
            <ProductSearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              suggestions={suggestions}
              onSelectProduct={(product) => navigate(`/product/${product.id}`)}
            />
            <ProductCategoryDropdown
              categories={categories}
              value={activeCategory}
              onChange={onCategoryChange}
            />
          </div>

          {shownProducts.length > 0 ? (
            <>
              <p className="mb-4 text-sm font-semibold text-[#6a735f]">
                Showing {shownProducts.length} {shownProducts.length === 1 ? "product" : "products"}
                {hasActiveSearch ? ` for "${searchQuery.trim()}"` : ""}
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {shownProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<PackageSearch className="h-7 w-7" />}
              title="No products found"
              description="Try another search or switch to All Products."
              action={
                <button
                  onClick={() => {
                    setSearchQuery("");
                    onCategoryChange(ALL_PRODUCTS_CATEGORY);
                  }}
                  className="rounded-full bg-[#152015] px-5 py-2.5 text-sm font-black text-white"
                >
                  Reset filters
                </button>
              }
            />
          )}
        </div>
      </section>
    </PageShell>
  );
}

function ProductDetailsPage({ products }: { products: Product[] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.id === id);
  const { addToCart } = useCart();

  if (!product) return <Navigate to="/products" replace />;

  return (
    <PageShell>
      <section className="px-4 py-8 md:py-10">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#2f6b3f]">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="grid gap-6 rounded-[1.6rem] bg-white/80 p-4 shadow-[0_18px_48px_rgba(34,45,31,0.09)] md:grid-cols-2 md:p-6">
            <div className="overflow-hidden rounded-[1.2rem] bg-[#f7fbf4]">
              <img src={product.image} alt={product.name} className="h-full min-h-[260px] w-full object-cover md:min-h-[320px]" loading="lazy" decoding="async" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f7e3f]">{product.category}</p>
              <h1 className="mt-2 text-4xl font-black text-[#18251b]">{product.name}</h1>
              <p className="mt-2 text-lg text-[#6a735f]">{product.variant}</p>
              <p className="mt-6 text-3xl font-black text-[#d4a843]">₹{product.price}</p>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#6a735f]">
                Premium SR Dairy freshness, packed for everyday delivery and morning routines.
              </p>
              <button
                onClick={() => addToCart(product)}
                className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-[#152015] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 sm:w-auto"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function CartPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();

  return (
    <PageShell>
      <section className="px-4 py-8 md:py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-black text-[#18251b] md:text-4xl">Cart</h1>
          <div className="mt-6 grid gap-4">
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart className="h-7 w-7" />}
                title="Your cart is empty"
                description="Add fresh dairy products to review your order here."
                action={<Link to="/products" className="inline-flex rounded-full bg-[#152015] px-5 py-2.5 text-sm font-bold text-white">Browse products</Link>}
              />
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 rounded-2xl bg-white/85 p-3 shadow-[0_14px_34px_rgba(34,45,31,0.07)] sm:gap-4 sm:rounded-3xl sm:p-4">
                  <img src={item.product.image} alt={item.product.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" decoding="async" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-black text-[#18251b]">{item.product.name}</h2>
                    <p className="text-sm text-[#6a735f]">{item.product.variant}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button className="stepper-btn bg-[#152015] text-white" onClick={() => item.quantity <= 1 ? removeFromCart(item.product.id) : updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-black">{item.quantity}</span>
                      <button className="stepper-btn bg-[#152015] text-white" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="ml-auto font-black text-[#d4a843]">₹{item.product.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="mt-6 rounded-3xl bg-white/85 p-5 shadow-sm">
              <div className="flex items-center justify-between text-lg font-black">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <Link to="/checkout" className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#152015] py-3.5 text-sm font-black text-white">
                Checkout
              </Link>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function CheckoutPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
  const deliveryFee = cart.length > 0 && cartTotal < 300 ? 25 : 0;
  const discount = couponApplied ? Math.min(40, Math.round(cartTotal * 0.08)) : 0;
  const cashback = cart.length > 0 ? Math.min(20, Math.round(cartTotal * 0.03)) : 0;
  const payable = Math.max(0, cartTotal + deliveryFee - discount);
  const paymentMethods = [
    { id: "wallet", label: "Wallet Pay", icon: WalletCards, note: "Coming soon" },
    { id: "upi", label: "UPI", icon: Smartphone, note: "Coming soon" },
    { id: "cod", label: "COD", icon: BadgeIndianRupee, note: "Available" },
    { id: "card", label: "Razorpay Card", icon: CreditCard, note: "Coming soon" },
  ];

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setAddressLoading(false));
  }, []);

  useEffect(() => {
    if (!addressLoading && cart.length > 0 && addresses.length === 0) {
      navigate("/complete-profile");
    }
  }, [addressLoading, addresses.length, cart.length, navigate]);

  if (orderPlaced) {
    return (
      <PageShell>
        <section className="px-4 py-10">
          <div className="mx-auto max-w-2xl rounded-[2rem] bg-white/85 p-8 text-center shadow-[0_18px_48px_rgba(34,45,31,0.09)]">
            <CheckCircle2 className="mx-auto h-16 w-16 text-[#2f6b3f]" />
            <h1 className="mt-5 text-3xl font-black text-[#18251b]">Order placed</h1>
            <p className="mt-2 text-[#6a735f]">Your SR Dairy order is scheduled for tomorrow at 7 AM.</p>
            <div className="mt-6 rounded-2xl bg-[#f7fbf4] p-4 text-left">
              <div className="flex items-center justify-between font-black text-[#18251b]">
                <span>Payable amount</span>
                <span>₹{payable}</span>
              </div>
              <p className="mt-1 text-sm text-[#6a735f]">Payment method: {paymentMethods.find((method) => method.id === paymentMethod)?.label}</p>
            </div>
            <Link to="/orders" className="mt-6 inline-flex rounded-full bg-[#152015] px-6 py-3 text-sm font-black text-white">
              View Orders
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="checkout-premium px-4 py-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4f7e3f]">Checkout</p>
            <h1 className="text-3xl font-black text-[#18251b] md:text-4xl">Confirm your dairy delivery</h1>
          </div>
          {cart.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-7 w-7" />}
              title="Your cart is empty"
              description="Add products before checkout so we can prepare your delivery summary."
              action={<Link to="/products" className="inline-flex rounded-full bg-[#152015] px-5 py-2.5 text-sm font-bold text-white">Browse products</Link>}
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
              <div className="grid gap-5">
                <section className="checkout-card">
                  <h2 className="text-lg font-black text-[#18251b]">Order Summary</h2>
                  <div className="mt-4 grid gap-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-3 rounded-2xl bg-[#fbf8ef]/80 p-3">
                        <img src={item.product.image} alt={item.product.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" decoding="async" />
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-3">
                            <div>
                              <h3 className="font-black text-[#18251b]">{item.product.name}</h3>
                              <p className="text-sm text-[#6a735f]">{item.product.variant}</p>
                            </div>
                            <span className="font-black text-[#d4a843]">₹{item.product.price * item.quantity}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <button className="stepper-btn bg-[#152015] text-white" onClick={() => item.quantity <= 1 ? removeFromCart(item.product.id) : updateQuantity(item.product.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-sm font-black">{item.quantity}</span>
                            <button className="stepper-btn bg-[#152015] text-white" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </button>
                            <Link to={`/product/${item.product.id}`} className="ml-auto text-xs font-black text-[#2f6b3f]">Edit</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="checkout-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-[#2f6b3f]" />
                      <div>
                        <h2 className="text-lg font-black text-[#18251b]">Delivery Address</h2>
                        {defaultAddress ? (
                          <p className="mt-2 text-sm leading-6 text-[#6a735f]">
                            {defaultAddress.house_flat}, {defaultAddress.area}
                            {defaultAddress.landmark ? `, ${defaultAddress.landmark}` : ""}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-[#6a735f]">{addressLoading ? "Loading address..." : "No address selected. Add a home address to continue."}</p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => navigate("/complete-profile")} className="rounded-full bg-[#eef8ea] px-4 py-2 text-xs font-black text-[#2f6b3f]">
                      {defaultAddress ? "Change" : "Add address"}
                    </button>
                  </div>
                </section>

                <section className="checkout-card">
                  <div className="flex gap-3">
                    <Clock className="mt-1 h-5 w-5 text-[#2f6b3f]" />
                    <div>
                      <h2 className="text-lg font-black text-[#18251b]">Delivery Slot</h2>
                      <p className="mt-2 font-bold text-[#18251b]">Tomorrow, 7 AM</p>
                      <p className="text-sm text-[#6a735f]">Order before tonight to keep this slot. Instruction: leave at doorstep and ring bell.</p>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="grid content-start gap-5">
                <section className="checkout-card">
                  <div className="flex items-center gap-2">
                    <TicketPercent className="h-5 w-5 text-[#2f6b3f]" />
                    <h2 className="text-lg font-black text-[#18251b]">Coupon</h2>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="TRY SRFRESH" className="min-w-0 flex-1 rounded-2xl border border-[#e8eadf] bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#2f6b3f]/20" />
                    <button
                      onClick={() => {
                        const hasCoupon = Boolean(coupon.trim());
                        setCouponApplied(hasCoupon);
                        if (hasCoupon) toast.success("Coupon applied");
                        else toast.warning("Enter a coupon code");
                      }}
                      className="rounded-2xl bg-[#152015] px-4 py-3 text-sm font-black text-white"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && <p className="mt-3 rounded-2xl bg-[#eef8ea] px-3 py-2 text-sm font-bold text-[#2f6b3f]">Sample discount applied: ₹{discount}</p>}
                </section>

                <section className="checkout-card">
                  <h2 className="text-lg font-black text-[#18251b]">Payment Method</h2>
                  <div className="mt-4 grid gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left ${paymentMethod === method.id ? "bg-[#eef8ea] ring-2 ring-[#2f6b3f]/20" : "bg-[#fbf8ef]/80"}`}>
                          <Icon className="h-5 w-5 text-[#2f6b3f]" />
                          <span className="flex-1 font-black text-[#18251b]">{method.label}</span>
                          <span className="text-[11px] font-bold text-[#6a735f]">{method.note}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="checkout-card">
                  <h2 className="text-lg font-black text-[#18251b]">Price Breakdown</h2>
                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                    <div className="flex justify-between"><span>Delivery fee</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
                    <div className="flex justify-between text-[#2f6b3f]"><span>Discount</span><span>-₹{discount}</span></div>
                    <div className="flex justify-between text-[#8a6400]"><span>Wallet cashback</span><span>₹{cashback}</span></div>
                    <div className="mt-2 border-t border-[#e8eadf] pt-3 text-lg font-black text-[#18251b]">
                      <div className="flex justify-between"><span>Payable</span><span>₹{payable}</span></div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!defaultAddress) {
                        toast.warning("Add a delivery address before checkout");
                        navigate("/complete-profile");
                        return;
                      }
                      setOrderPlaced(true);
                      toast.success("Order placed");
                    }}
                    className="mt-5 w-full rounded-2xl bg-[#152015] py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
                  >
                    Place Order
                  </button>
                </section>
              </aside>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function SubscriptionPage() {
  return (
    <PageShell>
      <section className="px-4 py-8 md:py-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white/85 p-6 shadow-[0_18px_48px_rgba(34,45,31,0.09)]">
          <PackageCheck className="h-10 w-10 text-[#2f6b3f]" />
          <h1 className="mt-4 text-3xl font-black text-[#18251b]">Subscription Management</h1>
          <p className="mt-2 text-[#6a735f]">Manage recurring dairy deliveries from your dashboard controls.</p>
          <HomeDashboard />
        </div>
      </section>
    </PageShell>
  );
}

// ===== PROMO BANNER =====
function PromoBanner() {
  return (
    <section className="py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="promo-banner rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t">
          <div>
            <h3 className="text-lg md:text-xl font-bold" style={{ color: 'var(--sr-dark)' }}>
              Subscribe & Save 15%
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--sr-medium)' }}>
              Get fresh milk delivered every morning to your doorstep
            </p>
          </div>
          <button
            className="px-6 py-2.5 rounded-full text-white font-semibold text-sm whitespace-nowrap transition-all hover:shadow-lg active:scale-95"
            style={{ backgroundColor: 'var(--sr-orange)' }}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </section>
  );
}

// ===== TRUST SECTION =====
function TrustSection() {
  const badges = [
    { icon: <Leaf className="w-5 h-5" />, label: 'Farm Fresh' },
    { icon: <Truck className="w-5 h-5" />, label: '24hr Delivery' },
    { icon: <ShieldCheck className="w-5 h-5" />, label: 'No Preservatives' },
  ];

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="trust-badge w-full sm:w-auto">
              <span style={{ color: 'var(--sr-green)' }}>{badge.icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--sr-medium)' }}>
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== CART DRAWER =====
function CartDrawer() {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setClosing(false);
    }, 300);
  }, [setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 cart-overlay"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col ${closing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--sr-border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--sr-dark)' }}>
            Your Cart ({cart.length})
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--sr-medium)' }} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 mb-4" style={{ color: 'var(--sr-border)' }} />
              <p className="text-lg font-semibold" style={{ color: 'var(--sr-dark)' }}>
                Your cart is empty
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--sr-medium)' }}>
                Add some fresh dairy products!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-xl border"
                  style={{ borderColor: 'var(--sr-border)' }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--sr-dark)' }}>
                      {item.product.name}
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--sr-medium)' }}>
                      {item.product.variant}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--sr-gold)' }}>
                        ₹{item.product.price * item.quantity}
                      </span>
                      <div className="flex items-center gap-2" style={{ backgroundColor: '#FFF3E0', borderRadius: '9999px', padding: '2px 6px' }}>
                        <button
                          className="stepper-btn"
                          style={{ backgroundColor: 'var(--sr-orange)', color: 'white' }}
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeFromCart(item.product.id);
                            } else {
                              updateQuantity(item.product.id, item.quantity - 1);
                            }
                          }}
                        >
                          {item.quantity <= 1 ? <X className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--sr-dark)' }}>
                          {item.quantity}
                        </span>
                        <button
                          className="stepper-btn"
                          style={{ backgroundColor: 'var(--sr-orange)', color: 'white' }}
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--sr-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--sr-medium)' }}>
                Total
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--sr-dark)' }}>
                ₹{cartTotal}
              </span>
            </div>
            <button
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-base transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ backgroundColor: 'var(--sr-orange)' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== FOOTER =====
function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--sr-dark)' }} className="py-10 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sr-orange)' }}>
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--sr-orange)' }}>
                SR Dairy
              </span>
            </div>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Pure Dairy, Pure Trust.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['About', 'Products', 'Contact', 'Privacy'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm hover:text-white transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* App badges */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}
            >
              <Apple className="w-4 h-4" />
              App Store
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}
            >
              <Smartphone className="w-4 h-4" />
              Play Store
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2025 SR Dairy Products. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ===== MAIN APP =====
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>(() => readStoredCart(getCartStorageKey(null)));
  const cartStorageKeyRef = useRef(getCartStorageKey(null));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(ALL_PRODUCTS_CATEGORY);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const { isLoggedIn, user, signup, login, logout } = useAuth();

  useEffect(() => {
    const nextKey = getCartStorageKey(user?.id ?? null);
    if (cartStorageKeyRef.current === nextKey) return;

    writeStoredCart(cartStorageKeyRef.current, cart);
    cartStorageKeyRef.current = nextKey;
    setCart(readStoredCart(nextKey));
  }, [user?.id]);

  useEffect(() => {
    writeStoredCart(cartStorageKeyRef.current, cart);
  }, [cart]);

  const resetAuthForm = () => {
    setAuthName("");
    setAuthEmail("");
    setAuthPhone("");
    setAuthPassword("");
    setAuthConfirmPassword("");
  };

  const closeAuthModal = () => {
    setShowLoginModal(false);
    resetAuthForm();
  };

  const handleAuthSubmit = async () => {
    const email = authEmail.trim().toLowerCase();
    const password = authPassword;

    if (!email || !password) {
      toast.warning("Email and password are required");
      return;
    }

    const emailError = getEmailValidationMessage(email);
    if (emailError) {
      toast.warning(emailError);
      return;
    }

    if (authMode === "signup") {
      if (!authName.trim() || !authPhone.trim()) {
        toast.warning("Name, email, phone, and password are required");
        return;
      }
      if (password.length < 8) {
        toast.warning("Password must be at least 8 characters");
        return;
      }
      if (password !== authConfirmPassword) {
        toast.warning("Passwords do not match");
        return;
      }
    }

    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        await signup({
          name: authName.trim(),
          email,
          phone: authPhone.trim(),
          password,
        });
        toast.success("Account created");
      } else {
        await login({ email, password });
        toast.success("Login successful");
      }
      closeAuthModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthBusy(false);
    }
  };

  const fetchProducts = useCallback(() => {
    setLoadingProducts(true);
    setProductsError(false);
    fetch('/api/products/')
      .then((res) => {
        if (!res.ok) throw new Error("Products request failed");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoadingProducts(false);
      })
      .catch(() => {
        setProductsError(true);
        setLoadingProducts(false);
        toast.error("Could not load products");
      });
  }, []);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cart actions
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const categoryOptions = useMemo(() => getCategoryOptions(products), [products]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const showCategoryPills = location.pathname === "/" || location.pathname === "/products";

  const goToCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    navigate('/products');
  }, [navigate]);

  if (loadingProducts) {
    return <ProductsLoadingState />;
  }

  if (productsError) {
    return <ProductsErrorState onRetry={fetchProducts} />;
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      <div className="min-h-screen" style={{ backgroundColor: 'var(--sr-white)' }}>
        <Toaster richColors position="top-right" />
        <Navbar
  isLoggedIn={isLoggedIn}
  userEmail={user?.email || ""}
  userName={user?.name}
  userImage={user?.profile_image}
  setShowLoginModal={setShowLoginModal}
  setIsLoggedIn={(value) => {
    if (!value) logout();
  }}
        />
        <BetaBanner />
        <MobileNav />
        {showCategoryPills && (
          <CategoryPills activeCategory={activeCategory} categories={categoryOptions} onCategoryClick={goToCategory} />
        )}

        <Routes>
          <Route path="/" element={<HomePage onStartOrder={() => goToCategory('milk')} onLogin={() => setShowLoginModal(true)} />} />
          <Route
            path="/products"
            element={
              <ProductListingPage
                products={products}
                activeCategory={activeCategory}
                categories={categoryOptions}
                onCategoryChange={setActiveCategory}
              />
            }
          />
          <Route path="/product/:id" element={<ProductDetailsPage products={products} />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute requireCompleteProfile><CheckoutPage /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><PageShell><Orders /></PageShell></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showLoginModal && (
  <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center px-4">

    <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md relative">

      {/* CLOSE */}
      <button
        onClick={closeAuthModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl"
      >
        ✕
      </button>

      {/* TITLE */}
      <h2 className="text-2xl font-bold text-center mb-1">
        {authMode === "signup" ? "Create your SR Dairy account" : "Welcome to SR Dairy"}
      </h2>

      <p className="text-center text-gray-500 mb-5">
        Login with your email and password
      </p>

      <div className="mb-4 grid grid-cols-2 rounded-xl bg-[#f4f0e7] p-1">
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className={`rounded-lg py-2 text-sm font-bold transition ${authMode === "login" ? "bg-white text-[#152015] shadow-sm" : "text-[#667064]"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("signup")}
          className={`rounded-lg py-2 text-sm font-bold transition ${authMode === "signup" ? "bg-white text-[#152015] shadow-sm" : "text-[#667064]"}`}
        >
          Signup
        </button>
      </div>

      <div className="grid gap-3">
        {authMode === "signup" && (
          <input
            type="text"
            placeholder="Full name"
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
          className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
        />

        {authMode === "signup" && (
          <input
            type="tel"
            placeholder="Phone number"
            value={authPhone}
            onChange={(e) => setAuthPhone(e.target.value)}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={authPassword}
          onChange={(e) => setAuthPassword(e.target.value)}
          className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
        />

        {authMode === "signup" && (
          <input
            type="password"
            placeholder="Confirm password"
            value={authConfirmPassword}
            onChange={(e) => setAuthConfirmPassword(e.target.value)}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          />
        )}

        <button
          onClick={handleAuthSubmit}
          disabled={authBusy}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: "var(--sr-orange)" }}
        >
          {authBusy ? "Please wait..." : authMode === "signup" ? "Create Account" : "Login"}
        </button>
      </div>

      {/* FOOTER */}
      <p className="text-xs text-gray-400 text-center mt-5">
        By continuing, you agree to SR Dairy's Terms & Privacy Policy
      </p>
    </div>
  </div>
)}
<Footer />
{isCartOpen && location.pathname !== "/cart" && <CartDrawer />}
        
      </div>
    </CartContext.Provider>
  );
}
