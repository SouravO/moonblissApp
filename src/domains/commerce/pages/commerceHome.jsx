import React, { useState, useEffect, useCallback, useMemo } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import { getThemeConfig } from "@/infrastructure/theme/themeConfig";
import periodStorage from "@/infrastructure/storage/periodStorage";
import {
  ShoppingCart,
  Heart,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Trash2,
  X,
} from "lucide-react";
import { IonIcon } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";

// Import images
import img1 from "/images/product/product1.png";
import img2 from "/images/product/product2.png";
import img3 from "/images/product/product3.jpg";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
};

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const CommerceHome = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Demo cart
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null); // { title, body }
  const [flashBadge, setFlashBadge] = useState(false);

  // ✅ REFACTORED: Cached period data with event listeners
  const [cachedPeriodData, setCachedPeriodData] = useState(() => {
    return periodStorage.get();
  });

  // ✅ FIX: Re-sync cache when component mounts or storage changes
  useEffect(() => {
    const periodData = periodStorage.get();
    setCachedPeriodData(periodData);

    const handlePeriodDataChange = () => {
      console.log("Period data changed, updating cache");
      const updatedData = periodStorage.get();
      setCachedPeriodData(updatedData);
    };

    window.addEventListener("storage", handlePeriodDataChange);
    window.addEventListener("period-data-changed", handlePeriodDataChange);

    return () => {
      window.removeEventListener("storage", handlePeriodDataChange);
      window.removeEventListener("period-data-changed", handlePeriodDataChange);
    };
  }, []);

  const periodState = useMemo(() => {
    if (!cachedPeriodData?.lastPeriodDate) {
      return {
        periodActive: false,
        savedPeriodStartDate: "",
        periodDuration: 5,
      };
    }

    const startDate = new Date(cachedPeriodData.lastPeriodDate);
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const periodDuration = cachedPeriodData.periodDuration || 5;

    return {
      periodActive: daysElapsed < periodDuration,
      savedPeriodStartDate: cachedPeriodData.lastPeriodDate,
      daysElapsed,
      periodDuration,
    };
  }, [cachedPeriodData]);

  const { periodActive } = periodState;

  // Get dynamic theme based on period state
  const theme = useMemo(() => {
    return getThemeConfig(periodActive);
  }, [periodActive]);

  // Button system (dynamic colors based on theme + clean secondary + consistent icon buttons)
  const btnBase =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none " +
    "h-12 px-5 rounded-2xl text-sm font-semibold transition " +
    "ring-1 ring-white/10 focus:outline-none " +
    "active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";

  const btnPrimary =
    btnBase +
    (periodActive 
      ? " bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 focus-visible:ring-2 focus-visible:ring-red-400/60"
      : " bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-400/60");

  const btnSecondary = btnBase + " bg-white/6 hover:bg-white/10 text-white/90";

  const iconBtn =
    "h-11 w-11 rounded-2xl " +
    (periodActive 
      ? "bg-red-500/20 hover:bg-red-500/30 ring-red-400/30"
      : "bg-white/10 hover:bg-white/15 ring-white/10") +
    " backdrop-blur-md flex items-center justify-center transition";

  const miniBtn =
    "h-9 w-9 rounded-xl " +
    (periodActive 
      ? "bg-red-500/10 hover:bg-red-500/20 ring-red-400/20"
      : "bg-white/6 hover:bg-white/12 ring-white/10") +
    " flex items-center justify-center transition";

  const product = useMemo(
    () => ({
      id: "moonbliss-wellness-kit",
      title: "Moonbliss Wellness Kit",
      description:
        "A thoughtfully curated wellness kit designed to support comfort and balance during your cycle.",
      price: 399,
      compareAt: 1599,
      images: [img1, img2, img3],
    }),
    []
  );

  // Demo cart items: {id, title, price, image, qty}
  const [cartItems, setCartItems] = useState([]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, it) => sum + (it.qty || 0), 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0),
    [cartItems]
  );

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % product.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [product.images.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % product.images.length);
  }, [product.images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + product.images.length) % product.images.length);
  }, [product.images.length]);

  const showToast = useCallback((title, body) => {
    setToast({ title, body });
    window.setTimeout(() => setToast(null), 1400);
  }, []);

  const pulseBadge = useCallback(() => {
    setFlashBadge(true);
    window.setTimeout(() => setFlashBadge(false), 450);
  }, []);

  const addToCart = useCallback(() => {
    setCartItems((prev) => {
      const idx = p
      rev.findIndex((x) => x.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images[0],
          qty: 1,
        },
      ];
    });
    pulseBadge();
    showToast("Added to cart", `${product.title} × 1`);
  }, [product, pulseBadge, showToast]);

  const incQty = useCallback(
    (id) => {
      setCartItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
      pulseBadge();
    },
    [pulseBadge]
  );

  const decQty = useCallback(
    (id) => {
      setCartItems((prev) =>
        prev
          .map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty - 1) } : x))
          .filter((x) => x.qty > 0)
      );
      pulseBadge();
    },
    [pulseBadge]
  );

  const removeItem = useCallback(
    (id) => {
      setCartItems((prev) => prev.filter((x) => x.id !== id));
      pulseBadge();
      showToast("Removed", "Item removed from cart");
    },
    [pulseBadge, showToast]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    pulseBadge();
    showToast("Cart cleared", "All items removed");
  }, [pulseBadge, showToast]);

  // Close drawer on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PageLayout>
      <ColorBg />

      {/* Background shell - Dynamic theme */}
      <div className={`relative min-h-screen text-gray-100 ${theme.background}`}>
        {/* Soft gradients */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full ${theme.blobs.blob1} blur-3xl`} />
          <div className={`absolute top-48 -left-24 h-72 w-72 rounded-full ${theme.blobs.blob2} blur-3xl`} />
          <div className={`absolute bottom-0 right-0 h-96 w-96 rounded-full ${periodActive ? 'bg-pink-600/15' : 'bg-blue-600/10'} blur-3xl`} />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-5 pt-[max(1.25rem,env(safe-area-inset-top,1.25rem))] pb-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-2">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${periodActive ? 'bg-red-500/20 ring-red-400/30' : 'bg-white/10 ring-white/10'} ring-1`}>
                  <Sparkles className={`h-4 w-4 ${periodActive ? 'text-red-200' : 'text-purple-200'}`} />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-white">Moonbliss Store</h1>
              </div>
              <p className="text-sm text-white/60">Wellness essentials for you</p>
            </div>

            {/* Cart button with count + notification pulse */}
            <motion.button
              onClick={() => setCartOpen(true)}
              whileTap={{ scale: 0.96 }}
              className={`relative h-11 w-11 rounded-2xl ${periodActive ? 'bg-red-500/20 hover:bg-red-500/30 ring-red-400/30' : 'bg-white/10 hover:bg-white/15 ring-white/10'} ring-1 backdrop-blur-md flex items-center justify-center transition`}
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-white/80" />

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.6, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-semibold text-white flex items-center justify-center ${periodActive ? 'bg-red-600 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'} shadow ring-1 ring-white/10`}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Pulse ring when count changes */}
              <AnimatePresence>
                {flashBadge && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 1.35 }}
                    className={`absolute inset-0 rounded-2xl ring-2 ${periodActive ? 'ring-red-400/50' : 'ring-emerald-400/50'}`}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Sub header chips */}
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { icon: <ShieldCheck className="h-4 w-4" />, label: "Verified Quality" },
              { icon: <Truck className="h-4 w-4" />, label: "24h Dispatch" },
              { icon: <Sparkles className="h-4 w-4" />, label: "New Drops" },
            ].map((c, i) => (
              <motion.div
                key={i}
                variants={slideInFromRight}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 + i * 0.08 }}
                className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-xs text-white/70"
              >
                <span className="text-white/70">{c.icon}</span>
                <span>{c.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.header>

        <div className="relative px-5 space-y-8 pb-24">
          {/* Featured Product Card */}
          <motion.section
            variants={fadeInScale}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            className="rounded-[28px] overflow-hidden bg-white/5 ring-1 ring-white/10 backdrop-blur-xl"
          >
            {/* Hero + carousel */}
            <div className="relative p-4">
              <div className="relative rounded-[22px] overflow-hidden bg-white/5 ring-1 ring-white/10">
                <div className="relative w-full aspect-square">
                  <div
                    className="flex transition-transform duration-500 ease-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {product.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    ))}
                  </div>

                  {/* Gloss overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_320px_at_20%_0%,rgba(255,255,255,0.22),transparent_55%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/35 hover:bg-black/55 ring-1 ring-white/10 flex items-center justify-center backdrop-blur-sm transition"
                    aria-label="Previous image"
                  >
                    <IonIcon icon={chevronBackOutline} className="text-white text-xl" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/35 hover:bg-black/55 ring-1 ring-white/10 flex items-center justify-center backdrop-blur-sm transition"
                    aria-label="Next image"
                  >
                    <IonIcon icon={chevronForwardOutline} className="text-white text-xl" />
                  </button>

                  {/* Pagination Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {product.images.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.92 }}
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? (periodActive ? "bg-red-400 w-8" : "bg-emerald-400 w-8")
                            : "bg-white/30 w-2 hover:bg-white/50"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Favorite Button */}
                  <motion.button
                    onClick={() => setIsFavorite((v) => !v)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-black/35 hover:bg-black/55 ring-1 ring-white/10 flex items-center justify-center backdrop-blur-sm transition"
                    aria-label="Favorite"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isFavorite ? "fill-pink-500 text-pink-500" : "text-white"
                      }`}
                    />
                  </motion.button>

                  {/* Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${periodActive ? 'bg-red-500/90' : 'bg-emerald-500/90'} ring-1 ring-white/10`}>
                    ✨ New
                  </div>
                </div>
              </div>

              {/* Product info */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.16 }}
                className="mt-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {product.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-white/55">(2,345 reviews)</span>
                    </div>
                  </div>

                  {/* Price capsule */}
                  <div className="shrink-0 text-right">
                    <div className="px-3 py-2 rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <p className="text-[11px] text-white/50">Today</p>
                      <p className={`text-lg font-bold ${periodActive ? 'text-red-200' : 'text-emerald-200'}`}>{fmtINR(product.price)}</p>
                    </div>
                    <p className="mt-1 text-xs text-white/35 line-through">
                      {fmtINR(product.compareAt)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-white/70 leading-relaxed">{product.description}</p>

                {/* Quick Features */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { top: "FREE", bottom: "Delivery" },
                    { top: "100%", bottom: "Organic" },
                    { top: "30 DAY", bottom: "Returns" },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 text-center"
                    >
                      <p className="text-[11px] text-white/45">{f.top}</p>
                      <p className="text-xs font-semibold text-white">{f.bottom}</p>
                    </div>
                  ))}
                </div>

                {/* Add to Cart */}
                <motion.button
                  onClick={addToCart}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full ${btnPrimary}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>

                {/* Secondary actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className={`w-full ${btnSecondary}`}>Buy Now</button>
                  <button className={`w-full ${btnSecondary}`}>Gift This</button>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* What's Included */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.22 }}
            className="rounded-[28px] bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">What&apos;s Included</h3>
            <div className="space-y-2">
              {[
                "Premium wellness kit with 5 essential items",
                "Comfortable period products for all flow types",
                "Natural herbal remedies for cramp relief",
                "Eco-friendly reusable storage pouch",
                "Comprehensive wellness guide book",
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-black/20 ring-1 ring-white/10"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-white/10 text-white font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-white/75">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Benefits Grid */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.28 }}
            className="rounded-[28px] bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Why Choose Us</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: "🌿", title: "100% Natural", text: "No chemicals, purely botanical" },
                { emoji: "♻️", title: "Eco-Friendly", text: "Sustainable packaging" },
                { emoji: "⚡", title: "Fast Delivery", text: "Ships in 24 hours" },
                { emoji: "💯", title: "Quality Assured", text: "Tested and verified" },
              ].map((b, i) => (
                <div key={i} className="rounded-[22px] p-4 bg-white/5 ring-1 ring-white/10">
                  <div className="text-3xl mb-2">{b.emoji}</div>
                  <h4 className="font-semibold text-white text-sm mb-1">{b.title}</h4>
                  <p className="text-xs text-white/55 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Customer Reviews Preview */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.34 }}
            className="rounded-[28px] bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Customer Reviews</h3>

            <div className="space-y-3">
              {[
                { name: "Priya", rating: 5, text: "Amazing quality! Highly recommend" },
                { name: "Ananya", rating: 5, text: "Best purchase ever, great value" },
              ].map((review, idx) => (
                <div key={idx} className="rounded-[22px] bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm">{review.name}</h4>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-white/60">{review.text}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Related Products */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="rounded-[28px] bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">You Might Also Like</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: "💊", name: "Supplement Kit", price: 699 },
                { emoji: "🧴", name: "Care Balm Set", price: 599 },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="rounded-[22px] bg-black/20 p-3 ring-1 ring-white/10 cursor-pointer hover:bg-black/30 transition"
                  onClick={() => {
                    const id = `related-${idx}`;
                    setCartItems((prev) => {
                      const found = prev.find((x) => x.id === id);
                      if (found) {
                        return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
                      }
                      return [
                        ...prev,
                        { id, title: item.name, price: item.price, image: product.images[0], qty: 1 },
                      ];
                    });
                    pulseBadge();
                    showToast("Added to cart", `${item.name} × 1`);
                  }}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <h4 className="font-semibold text-white text-sm mb-1">{item.name}</h4>
                  <p className={`text-sm font-semibold ${periodActive ? 'text-red-200' : 'text-emerald-200'}`}>{fmtINR(item.price)}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[60] w-[min(92vw,420px)]"
            >
              <div className="rounded-2xl bg-black/70 backdrop-blur-xl ring-1 ring-white/10 px-4 py-3">
                <div className="text-sm font-semibold text-white">{toast.title}</div>
                <div className="text-xs text-white/60 mt-0.5">{toast.body}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Drawer */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px]"
                aria-label="Close cart overlay"
              />
              <motion.aside
                initial={{ x: 420 }}
                animate={{ x: 0 }}
                exit={{ x: 420 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="fixed right-0 top-0 z-[80] h-full w-[min(92vw,420px)] bg-[#0B0B10]/95 ring-1 ring-white/10 backdrop-blur-xl"
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-white">Your Cart</div>
                      <div className="text-xs text-white/60">
                        {cartCount > 0 ? `${cartCount} item(s)` : "Cart is empty"}
                      </div>
                    </div>

                    <button
                      onClick={() => setCartOpen(false)}
                      className={miniBtn}
                      aria-label="Close cart"
                    >
                      <X className="h-5 w-5 text-white/80" />
                    </button>
                  </div>

                  <div className="mt-4 flex-1 overflow-auto space-y-3 pr-1">
                    {cartItems.length === 0 ? (
                      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-sm text-white/70">
                        Add items to see quantity controls and subtotal.
                      </div>
                    ) : (
                      cartItems.map((it) => (
                        <div
                          key={it.id}
                          className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 flex gap-3"
                        >
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/10 shrink-0">
                            <img
                              src={it.image}
                              alt={it.title}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white truncate">
                                  {it.title}
                                </div>
                                <div className="text-xs text-white/60 mt-0.5">
                                  {fmtINR(it.price)} each
                                </div>
                              </div>

                              <button
                                onClick={() => removeItem(it.id)}
                                className={miniBtn}
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4 text-white/70" />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="inline-flex items-center gap-2 rounded-2xl bg-black/25 ring-1 ring-white/10 p-1.5">
                                <button
                                  onClick={() => decQty(it.id)}
                                  className={miniBtn}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-4 w-4 text-white/80" />
                                </button>

                                <div className="w-10 text-center text-sm font-semibold text-white">
                                  {it.qty}
                                </div>

                                <button
                                  onClick={() => incQty(it.id)}
                                  className={miniBtn}
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-4 w-4 text-white/80" />
                                </button>
                              </div>

                              <div className="text-sm font-semibold text-white">
                                {fmtINR(it.price * it.qty)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">Subtotal</div>
                      <div className="text-lg font-bold text-white">{fmtINR(cartSubtotal)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={clearCart}
                        disabled={cartItems.length === 0}
                        className={`w-full ${btnSecondary}`}
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => showToast("Demo Checkout", "Proceeding to payment (demo)")}
                        disabled={cartItems.length === 0}
                        className={`w-full ${btnPrimary}`}
                      >
                        Checkout
                      </button>
                    </div>

                    <div className="text-[11px] text-white/45">
                      Demo cart only. Quantities and badge update live.
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

export default React.memo(CommerceHome);
