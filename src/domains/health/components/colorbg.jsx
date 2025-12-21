import PageLayout from "@/shared/layout/PageLayout";
import PeriodTracker from "@/domains/health/components/PeriodTracker";
import { getUserData } from "@/infrastructure/storage/onboarding";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg"; // ✅ FIXED IMPORT
import { Search, Heart, Droplets, Zap } from "lucide-react";

/* ---------------- Animation presets ---------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardHover = {
  whileHover: { y: -4 },
  whileTap: { scale: 0.98 },
};

const HealthHome = () => {
  const userData = getUserData();
  const userName = userData?.name || "Lesley";

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  return (
    <PageLayout >
      {/* 🌈 Shader Background */}
      <ColorBg />

      {/* UI Layer */}
      <div className="relative min-h-screen pb-28 text-gray-900">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-5 pt-12 pb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                Hello {userName}
              </h1>
              <p className="text-sm text-gray-500">
                Today {formattedDate}
              </p>
            </div>
          </div>

          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        </motion.header>

        <div className="px-5 space-y-8">

          {/* HERO / DAILY FOCUS */}
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-[28px] p-6 h-[190px] overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg, #FDA4AF 0%, #FB7185 50%, #F43F5E 100%)",
            }}
          >
            <div className="relative z-10">
              <h2 className="text-[26px] font-bold text-white leading-tight mb-2">
                Cycle focus
              </h2>
              <p className="text-white/80 text-sm max-w-[80%]">
                You’re in the luteal phase. Prioritize rest, hydration and calm movement.
              </p>

              <div className="mt-4 flex gap-3">
                <span className="px-3 py-1 rounded-full bg-white/30 text-xs text-white">
                  Luteal phase
                </span>
                <span className="px-3 py-1 rounded-full bg-white/30 text-xs text-white">
                  Low energy
                </span>
              </div>
            </div>

            {/* Decorative bubbles */}
            <div className="absolute right-3 top-4 w-32 h-32">
              <div className="absolute w-10 h-10 rounded-full bg-white/30 top-0 right-6" />
              <div className="absolute w-8 h-8 rounded-full bg-white/20 top-8 right-0" />
              <div className="absolute w-12 h-12 rounded-full bg-white/25 top-16 right-8" />
            </div>
          </motion.section>

          {/* Period Tracker */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-[28px] bg-white p-5 shadow-sm"
          >
            <PeriodTracker />
          </motion.section>

          {/* My Journal */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-lg font-semibold mb-3"
            >
              My Journal
            </motion.h2>

            <motion.div
              variants={fadeUp}
              {...cardHover}
              className="rounded-[28px] p-6 h-[200px] flex flex-col justify-between bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A]"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Morning reflection
                </h3>
                <p className="text-sm text-gray-700 max-w-[85%]">
                  Write how your body and mind feel today.
                </p>
              </div>

              <div className="text-3xl">📝</div>
            </motion.div>
          </motion.section>

          {/* Quick Journal */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-lg font-semibold mb-3"
            >
              Quick Journal
            </motion.h2>

            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {[
                {
                  title: "Gratitude",
                  text: "One thing you appreciate today",
                  gradient: "from-[#E0EAFC] to-[#CFDEF3]",
                },
                {
                  title: "Mood check",
                  text: "How do you feel right now?",
                  gradient: "from-[#FCE7F3] to-[#FBCFE8]",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  {...cardHover}
                  className={`min-w-[210px] rounded-[24px] p-5 bg-gradient-to-br ${card.gradient}`}
                >
                  <h3 className="font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-700">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Cycle Insight */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-[28px] p-6 bg-gradient-to-br from-[#DBEAFE] to-[#E0F2FE]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Cycle Insight</h3>
                <p className="text-sm text-gray-600">
                  Your next period is expected in
                </p>
              </div>

              <div className="text-4xl font-bold text-blue-700">
                5d
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <span className="px-4 py-1 rounded-full bg-white/70 text-xs font-medium text-indigo-700">
                Luteal phase
              </span>
              <span className="px-4 py-1 rounded-full bg-white/70 text-xs font-medium text-emerald-700">
                Low fertility
              </span>
            </div>
          </motion.section>

          {/* Wellness */}
          <motion.section>
            <h2 className="text-lg font-semibold mb-3">Wellness</h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[20px] p-4 bg-rose-100">
                <Heart className="text-rose-600 mb-2" />
                <p className="text-sm font-medium">Heart</p>
                <p className="text-lg font-bold">72 bpm</p>
              </div>

              <div className="rounded-[20px] p-4 bg-sky-100">
                <Droplets className="text-sky-600 mb-2" />
                <p className="text-sm font-medium">Water</p>
                <p className="text-lg font-bold">1.5L</p>
              </div>

              <div className="rounded-[20px] p-4 bg-amber-100">
                <Zap className="text-amber-600 mb-2" />
                <p className="text-sm font-medium">Energy</p>
                <p className="text-lg font-bold">Low</p>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
    </PageLayout>
  );
};

export default HealthHome;
