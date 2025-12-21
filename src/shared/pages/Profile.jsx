import React, { useMemo } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { getUserData } from "@/infrastructure/storage/onboarding";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import { LogOut, Mail, User, Cake } from "lucide-react";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Profile = () => {
  const userData = getUserData();
  const userName = userData.name || "User";

  // Memoize age calculation
  const userAge = useMemo(() => {
    if (!userData.age && !userData.dateOfBirth) return null;
    if (userData.age) return userData.age;
    
    const dob = userData.dateOfBirth;
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, [userData.age, userData.dateOfBirth]);

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
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-sm text-gray-400">Your personal information</p>
          </div>
        </motion.header>

        <div className="px-5 space-y-6">
          {/* Profile Avatar & Name Section */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-600/30 shadow-xl mb-4"
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <h2 className="text-2xl font-bold text-white">{userName}</h2>
            {userAge && (
              <p className="text-sm text-gray-400 mt-1">{userAge} years old</p>
            )}
          </motion.section>

          {/* Profile Info Card */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-neutral-900 p-5 border border-white/10 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Account Information
            </h3>

            {/* Name Field */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-sm font-medium text-white">{userName}</p>
              </div>
            </div>

            {/* Age Field */}
            {userAge && (
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                  <Cake className="w-5 h-5 text-pink-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Age</p>
                  <p className="text-sm font-medium text-white">{userAge} years</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            {userData.email && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-white">
                    {userData.email}
                  </p>
                </div>
              </div>
            )}
          </motion.section>

          {/* Preferences Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-neutral-900 p-5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Preferences
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-white/5">
                <span className="text-sm text-gray-300">Notifications</span>
                <div className="w-12 h-6 rounded-full bg-purple-600 relative cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 transition-all" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-white/5">
                <span className="text-sm text-gray-300">Dark Mode</span>
                <div className="w-12 h-6 rounded-full bg-purple-600 relative cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 transition-all" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Security & Logout Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-neutral-900 p-5 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Security
            </h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-neutral-800/50 border border-white/5 hover:border-white/10 transition text-sm text-gray-300 hover:text-white">
                <span>🔐</span>
                Change Password
              </button>
            </div>
          </motion.section>

          {/* Logout Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </motion.button>
          </motion.section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
