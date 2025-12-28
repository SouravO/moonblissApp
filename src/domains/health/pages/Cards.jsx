const BackgroundVisuals = ({ type, colorClass }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* BASE GRADIENT */}
      <motion.div
        key={colorClass}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className={`absolute inset-0 bg-gradient-to-br ${colorClass}`}
      />

      {/* CAMERA DRIFT (GLOBAL MOTION) */}
      <motion.div
        className="absolute inset-[-10%]"
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >

        <AnimatePresence mode="wait">

          {/* =======================
              STEP 1 – NEBULA BREATH
             ======================= */}
          {type === "breathe" && (
            <motion.div
              key="nebula"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full blur-[140px]"
                  style={{
                    width: 500 + i * 120,
                    height: 500 + i * 120,
                    background:
                      "radial-gradient(circle at center, rgba(217,70,239,0.25), transparent 70%)",
                    top: `${Math.random() * 80}%`,
                    left: `${Math.random() * 80}%`,
                  }}
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.2, 0.6, 0.2],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 18 + i * 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* =======================
              STEP 2 – DATA FLOW
             ======================= */}
          {type === "flow" && (
            <motion.div
              key="datastream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {[...Array(14)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[120%] h-[2px]"
                  style={{
                    top: `${i * 7}%`,
                    background:
                      "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)",
                  }}
                  animate={{ x: ["-40%", "40%"] }}
                  transition={{
                    duration: 6 + i * 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}

              {/* PARALLAX GLOW NODES */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`node-${i}`}
                  className="absolute w-3 h-3 rounded-full bg-cyan-400/60 blur-sm"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{ y: [-20, 20, -20] }}
                  transition={{
                    duration: 5 + Math.random() * 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* =======================
              STEP 3 – BIO PULSE CORE
             ======================= */}
          {type === "pulse" && (
            <motion.div
              key="reactor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* CORE */}
              <motion.div
                className="absolute w-[220px] h-[220px] rounded-full bg-emerald-400/30 blur-[40px]"
                animate={{
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* SHOCK RINGS */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border border-emerald-400/30 rounded-full"
                  style={{
                    width: 300 + i * 120,
                    height: 300 + i * 120,
                  }}
                  animate={{
                    scale: [0.6, 1.4],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2 + i * 0.4,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* CINEMATIC FINISH */}
      <div className="absolute inset-0 bg-[#050507]/55 backdrop-blur-[120px]" />
      <div className="absolute inset-0 opacity-25 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
