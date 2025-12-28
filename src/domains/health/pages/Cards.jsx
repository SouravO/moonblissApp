import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function OnboardingPortal({ onGetStarted }) {
  const steps = useMemo(
    () => [
      {
        icon: Sparkles,
        title: "Welcome to MoonBliss",
        subtitle: "YOUR PERSONAL CALM",
        desc: "A modern sanctuary designed to track your cycle and elevate your daily consistency.",
        bullets: ["Smart AI reminders", "Deep biological insights", "Privacy-first architecture"],
        color: "from-violet-500 to-fuchsia-500",
      },
      {
        icon: ShieldCheck,
        title: "Wellness, Refined",
        subtitle: "CURATED FOR YOU",
        desc: "Receive biological recommendations that adapt to your energy levels. No noise, just data.",
        bullets: ["Phase-sync nutrition", "Intuitive rest cues", "Hydration intelligence"],
        color: "from-blue-500 to-cyan-500",
      },
      {
        icon: Activity,
        title: "Elite Consistency",
        subtitle: "HABIT ARCHITECTURE",
        desc: "Small daily actions lead to monumental shifts. Track progress with elegant precision.",
        bullets: ["Streak visualization", "Guided recovery", "Performance routines"],
        color: "from-emerald-500 to-teal-500",
      },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(0);

  const paginate = (newDir) => {
    const nextStep = step + newDir;
    if (nextStep >= 0 && nextStep < steps.length) {
      setDir(newDir);
      setStep(nextStep);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      filter: "blur(10px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.3 },
    }),
  };

  const StepIcon = steps[step].icon;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0c] text-white selection:bg-white/20">
      
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className={`absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] bg-gradient-to-br ${steps[step].color} opacity-30`} 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 py-12 flex flex-col items-center">
        
        {/* Progress Header */}
        <div className="mb-12 flex items-center gap-4">
          {steps.map((_, idx) => (
            <div key={idx} className="relative h-1 w-12 bg-white/10 rounded-full overflow-hidden">
              {idx <= step && (
                <motion.div 
                  layoutId="progress"
                  className={`absolute inset-0 bg-gradient-to-r ${steps[step].color}`} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full relative min-h-[450px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`mb-8 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl`}
              >
                <StepIcon size={48} className="text-white" />
              </motion.div>

              <span className="text-xs font-bold tracking-[0.3em] text-white/40 mb-3 uppercase">
                {steps[step].subtitle}
              </span>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                {steps[step].title}
              </h1>

              <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-10">
                {steps[step].desc}
              </p>

              {/* Bullet Points with Stagger */}
              <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                {steps[step].bullets.map((bullet, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    key={bullet}
                    className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
                  >
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span className="text-sm font-medium text-slate-300">{bullet}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="mt-16 w-full max-w-sm flex flex-col gap-4">
          <div className="flex gap-4">
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => paginate(-1)}
                className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <ArrowLeft size={18} />
                Back
              </motion.button>
            )}

            {step < steps.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => paginate(1)}
                className="flex-[2] py-4 px-6 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 shadow-xl shadow-white/10 transition-all"
              >
                Continue
                <ArrowRight size={18} />
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = "/login"}
                className={`flex-[2] py-4 px-6 rounded-2xl bg-gradient-to-r ${steps[step].color} text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-400/30`}
              >
                Get Started
                <Sparkles size={18} />
              </motion.button>
            )}
          </div>
          
          <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-medium">
            Step {step + 1} of {steps.length} — Secure & Private
          </p>
        </div>
      </div>
    </div>
  );
}