/**
 * Water Component
 *
 * Displays water/hydration tips card with a modal for detailed information
 *
 * RULE: This component is self-contained with its own state
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, X, Clock, Sparkles, Heart, Leaf } from "lucide-react";

// Animation presets
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Water tips data
const WATER_TIPS = [
  {
    icon: Droplets,
    title: "Stay Hydrated",
    description:
      "Drink at least 8 glasses of water daily for optimal energy levels.",
  },
  {
    icon: Clock,
    title: "Morning Routine",
    description:
      "Start your day with a glass of water to kickstart your metabolism.",
  },
  {
    icon: Sparkles,
    title: "Set Reminders",
    description:
      "Use phone reminders to drink water regularly throughout the day.",
  },
  {
    icon: Heart,
    title: "During Periods",
    description:
      "Increase water intake during menstruation to reduce bloating and cramps.",
  },
  {
    icon: Leaf,
    title: "Infuse Your Water",
    description:
      "Add fruits, cucumber, or mint to make drinking water more enjoyable.",
  },
];

const Water = ({ className = "" }) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const addCount = () => {
    let count = localStorage.getItem("waterCount") || 0;
    count = parseInt(count) + 1;
    localStorage.setItem("waterCount", count);
    alert(`Great! You've logged ${count} glasses of water today.`);
  };

  return (
    <>
      {/* Water Card */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.26 }}
        className={`rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm hover:shadow-md transition cursor-pointer ${className}`}
        onClick={handleOpen}
      >
        <div className="flex items-center justify-between">
          <motion.div
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Droplets className="w-5 h-5" />
          </motion.div>
          <span className="text-xs text-slate-500 bg-blue-100 px-2 py-1 rounded-full">
            Tips
          </span>
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">Hydration</h3>
        <p className="text-xs text-slate-500 mt-1">
          Stay refreshed & energized
        </p>

        <div className="mt-4 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Droplets className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span>Drink 8 glasses daily</span>
          </div>
        </div>
      </motion.section>

      {/* Water Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Hydration Tips</h2>
                      <p className="text-blue-100 text-sm">
                        Stay healthy & refreshed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* content - a button when pressed will calculate a dink water   */}
              <button
                className="flex justify-center items-center"
                onClick={addCount()}
              >
                Done
              </button>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Water;
