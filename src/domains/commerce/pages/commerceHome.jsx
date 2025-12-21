import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { IonIcon } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";

// Import images
import img1 from "/images/product/product1.png";
import img2 from "/images/product/product2.png";
import img3 from "/images/product/product3.jpg";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};
const CommerceHome = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const product = {
    title: "Moonbliss Wellness Kit",
    description:
      "A thoughtfully curated wellness kit designed to support comfort and balance during your cycle.",
    price: "₹399",
    images: [
      img1,
      img2,
      img3,

      //   "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop",
      //   "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      //   "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    ],
  };

  // Auto-slide (increased interval for better performance)
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
    setCurrentSlide(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  }, [product.images.length]);

  return (
    <PageLayout >
      <ColorBg />

      <div className="relative bg-black text-gray-100">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-6 pb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Moonbliss Store</h1>
              <p className="text-sm text-gray-400">Wellness essentials for you</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 relative">
              <ShoppingCart className="w-5 h-5 text-gray-300" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-white text-xs flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </motion.header>

        <div className="px-5 space-y-8">
          {/* Featured Product Card */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 p-4"
          >
            {/* Image Carousel */}
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-neutral-800">
              <div className="relative h-64">
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

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                >
                  <IonIcon icon={chevronBackOutline} className="text-white text-xl" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                >
                  <IonIcon icon={chevronForwardOutline} className="text-white text-xl" />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {product.images.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "bg-purple-500 w-6"
                          : "bg-white/30 w-2 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Favorite Button */}
                <motion.button
                  onClick={() => setIsFavorite(!isFavorite)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      isFavorite
                        ? "fill-pink-500 text-pink-500"
                        : "text-white"
                    }`}
                  />
                </motion.button>
              </div>

              {/* New Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 rounded-full text-xs font-semibold text-white">
                ✨ New
              </div>
            </div>

            {/* Product Info */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div>
                <h2 className="text-xl font-bold text-white">
                  {product.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">(2,345 reviews)</span>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                {product.description}
              </p>

              {/* Price & Features */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {product.price}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Original Price</p>
                    <p className="text-sm line-through text-gray-500">₹1,599</p>
                  </div>
                </div>

                {/* Quick Features */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-neutral-800/50 p-2 text-center border border-white/5">
                    <p className="text-xs text-gray-400">FREE</p>
                    <p className="text-xs font-semibold text-white">Delivery</p>
                  </div>
                  <div className="rounded-lg bg-neutral-800/50 p-2 text-center border border-white/5">
                    <p className="text-xs text-gray-400">100%</p>
                    <p className="text-xs font-semibold text-white">Organic</p>
                  </div>
                  <div className="rounded-lg bg-neutral-800/50 p-2 text-center border border-white/5">
                    <p className="text-xs text-gray-400">30 DAY</p>
                    <p className="text-xs font-semibold text-white">Returns</p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </motion.button>
            </motion.div>
          </motion.section>

          {/* Product Details Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              What's Included
            </h3>
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
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/50 border border-white/5"
                >
                  <span className="text-purple-400 font-bold">✓</span>
                  <span className="text-sm text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Benefits Grid */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              Why Choose Us
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-purple-950/60 to-purple-900/40 p-4 border border-white/10">
                <div className="text-3xl mb-2">🌿</div>
                <h4 className="font-semibold text-white text-sm mb-1">
                  100% Natural
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  No chemicals, purely botanical
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-pink-950/60 to-pink-900/40 p-4 border border-white/10">
                <div className="text-3xl mb-2">♻️</div>
                <h4 className="font-semibold text-white text-sm mb-1">
                  Eco-Friendly
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sustainable packaging
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-blue-950/60 to-blue-900/40 p-4 border border-white/10">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-white text-sm mb-1">
                  Fast Delivery
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ships in 24 hours
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-yellow-950/60 to-yellow-900/40 p-4 border border-white/10">
                <div className="text-3xl mb-2">💯</div>
                <h4 className="font-semibold text-white text-sm mb-1">
                  Quality Assured
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tested and verified
                </p>
              </div>
            </div>
          </motion.section>

          {/* Customer Reviews Preview */}
          {/* Customer Reviews Preview */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              Customer Reviews
            </h3>
            <div className="space-y-3">
              {[
                { name: "Priya", rating: 5, text: "Amazing quality! Highly recommend" },
                { name: "Ananya", rating: 5, text: "Best purchase ever, great value" },
              ].map((review, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-neutral-900 p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm">
                      {review.name}
                    </h4>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{review.text}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Related Products Section */}
          {/* Related Products Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: "💊", name: "Supplement Kit", price: "₹699" },
                { emoji: "🧴", name: "Care Balm Set", price: "₹599" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl bg-neutral-900 p-3 border border-white/10 cursor-pointer hover:border-white/20 transition"
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {item.name}
                  </h4>
                  <p className="text-sm text-purple-400 font-semibold">
                    {item.price}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </PageLayout>
  );
};

export default React.memo(CommerceHome);