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

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
};

const Water = ({ className = "" }) => {
  const [showModal, setShowModal] = useState(false);
  const [count, setCount] = useState(() => {
    const key = getTodayKey();
    return parseInt(localStorage.getItem("waterCount-" + key)) || 0;
  });

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleYes = async () => {
    const key = getTodayKey();
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem("waterCount-" + key, newCount);

    // Schedule local notification for 10 seconds later
    try {
      const { LocalNotifications } = await import(
        "@capacitor/local-notifications"
      );
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 90000) + 10000,
            title: "Hydration Reminder",
            body: "Time to drink another glass of water!",
            schedule: { at: new Date(Date.now() + 10000) },
            sound: undefined,
            actionTypeId: undefined,
            extra: null,
          },
        ],
      });
    } catch (e) {
      // Fail silently on web or if plugin not available
      // Optionally, you can console.warn(e);
    }
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
            {count > 0 ? `${count} glass${count > 1 ? "es" : ""}` : "Tips"}
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
                      <h2 className="text-xl font-bold">Hydration</h2>
                      <p className="text-blue-100 text-sm">
                        Have you drunk water?
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

              {/* Modal content: Yes/No buttons */}
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <span className="text-lg font-medium text-slate-700">
                  Have you drunk water?
                </span>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={async () => {
                      await handleYes();
                      handleClose();
                    }}
                    className="px-6 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
                  >
                    No
                  </button>
                </div>
                <div className="mt-4 text-sm text-slate-500">
                  Today:{" "}
                  <span className="font-bold text-blue-700">{count}</span> glass
                  {count !== 1 ? "es" : ""} logged
                </div>
              </div>

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
