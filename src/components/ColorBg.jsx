import React from "react";
import { motion } from "framer-motion";

const ColorBg = React.memo(() => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-soft via-background to-secondary" />

      {/* Animated orbs - reduced animation intensity */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, hsl(350 60% 75% / 0.5), transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[10%] left-[-15%] w-[50%] h-[50%] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, hsl(270 50% 80% / 0.5), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, hsl(40 80% 75% / 0.4), transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
});

ColorBg.displayName = "ColorBg";

export default ColorBg;
    