import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { logoGoogle, logoFacebook, logoTwitter } from "ionicons/icons";
import { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useQuestionnaireFlow } from "@/domains/health/hooks/useQuestionnaireFlow.js";
import { storageService } from "@/infrastructure/storage/storageService.js";
import ComprehensiveQuestionnaireModal from "@/domains/health/components/ComprehensiveQuestionnaireModal.jsx";
// Silk component removed - using CSS gradient instead for better performance
import logo from '../../assets/Logo.png';
const Onboarding = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState("login");
  const [reveal, setReveal] = useState(false);

  const {
    showQuestionnaire,
    openQuestionnaire,
    closeQuestionnaire,
    handleQuestionnaireComplete,
  } = useQuestionnaireFlow();
// login handler
  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      return alert("Please enter both email and password");
    }
    if (!email.includes("@")) {
      return alert("Please enter a valid email");
    }

    setIsSubmitting(true);
    try {
      const userProfile = storageService.userProfileService.get();
      userProfile.email = email;
      userProfile.name = email.split("@")[0];
      userProfile.onboardingStartedAt = new Date().toISOString().split("T")[0];
      storageService.userProfileService.save(userProfile);

      // Open questionnaire modal (DON'T mark onboarding as complete yet)
      setStep("questionnaire");
      openQuestionnaire();
    } catch (error) {
      console.error("Login error:", error);
      alert("Error during login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, openQuestionnaire]);

  const handleQuestionnairesComplete = useCallback(
    async (answers) => {
      try {
        console.log("Questionnaire completed with answers:", answers);
        
        // Save questionnaire answers using the hook
        handleQuestionnaireComplete(answers);
        
        // Mark onboarding as complete in storage
        storageService.onboardingService.markComplete();
        console.log("Onboarding marked complete");
        
        // Close the questionnaire modal first
        closeQuestionnaire();
        console.log("Questionnaire modal closed");
        
        // Dispatch custom event to trigger AppRouter re-check
        window.dispatchEvent(new Event("onboarding-complete"));
        console.log("Onboarding complete event dispatched");
        
        // Then navigate to health page after a brief delay to ensure state updates
        setTimeout(() => {
          console.log("Navigating to /health");
          history.push("/health");
        }, 300);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        alert("Error saving your information. Please try again.");
      }
    },
    [handleQuestionnaireComplete, closeQuestionnaire, history]
  );

  return (
    <>
      <IonPage>
        <IonContent
          fullscreen
          className="min-h-screen"
          style={{ "--background": "#1a43bf", background: "#1a43bf" }}
        >
          {step === "login" ? (
            <div className="relative min-h-screen w-full overflow-hidden">
              {/* Animated gradient background - lightweight CSS replacement for Silk */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 opacity-40 animate-pulse" />

              {/* Soft noise overlay */}
              <div
                className="absolute inset-0 z-[0.5] mix-blend-overlay opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Vignette overlay */}
              <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(70%_60%_at_50%_35%,rgba(255,255,255,0.10),rgba(0,0,0,0.30))]" />

              {/* Floating sparkles */}
              <div className="pointer-events-none absolute inset-0 z-[1] opacity-70">
                <div className="absolute left-[10%] top-[18%] h-2 w-2 rounded-full bg-white/60 blur-[0.2px] animate-[sparkle_5.8s_ease-in-out_infinite]" />
                <div className="absolute left-[78%] top-[22%] h-2.5 w-2.5 rounded-full bg-white/50 blur-[0.2px] animate-[sparkle_6.6s_ease-in-out_infinite]" />
                <div className="absolute left-[22%] top-[72%] h-1.5 w-1.5 rounded-full bg-white/55 blur-[0.2px] animate-[sparkle_7.2s_ease-in-out_infinite]" />
                <div className="absolute left-[84%] top-[76%] h-1.5 w-1.5 rounded-full bg-white/45 blur-[0.2px] animate-[sparkle_6.2s_ease-in-out_infinite]" />
                <div className="absolute left-[52%] top-[12%] h-1.5 w-1.5 rounded-full bg-white/50 blur-[0.2px] animate-[sparkle_7.8s_ease-in-out_infinite]" />
              </div>

              {/* Foreground */}
              <div className="relative z-[2] min-h-screen px-5 py-12 md:py-16 flex flex-col items-center justify-center">
                {/* Logo */}
                <div className="mb-3">
                  <div className="relative">
                    <div className="text-[42px] sm:text-[51px] md:text-[62px] font-extrabold tracking-[-0.05em] text-white/90 drop-shadow-[0_14px_40px_rgba(0,0,0,0.25)] animate-[floaty_4.8s_ease-in-out_infinite]">
                     <img
  src={logo}
  alt=""
  className="w-[45%] sm:w-[60%] md:w-full mx-auto"
/>
                    </div>
                    <div className="pointer-events-none absolute -inset-x-10 -inset-y-6 blur-2xl opacity-70 bg-[radial-gradient(closest-side,rgba(255,255,255,0.26),rgba(255,255,255,0))] animate-[glow_3.0s_ease-in-out_infinite]" />
                  </div>
                </div>

                {/* Title */}
                <h1 className="mb-6 text-[22px] md:text-[24px] font-medium text-white/90 animate-[fadeUp_650ms_ease_both]">
                  Login to your Account
                </h1>

                {/* Card */}
                <div className="w-full max-w-[460px]">
                  <div className="relative group">
                    {/* animated gradient border */}
                    <div className="absolute -inset-[1px] rounded-[26px] bg-[conic-gradient(from_180deg_at_50%_50%,#1a43bf,rgba(255,255,255,0.65),#3b82f6,#60a5fa,#1a43bf)] opacity-70 blur-[10px] group-hover:opacity-95 transition duration-500 animate-[spinSlow_8s_linear_infinite]" />
                    <div className="absolute -inset-[1.5px] rounded-[26px] bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0.10))] opacity-60" />

                    {/* actual card */}
                    <div className="relative rounded-[26px] border border-white/30 bg-white/12 backdrop-blur-[18px] shadow-[0_26px_90px_rgba(0,0,0,0.35)] overflow-hidden animate-[pop_560ms_cubic-bezier(.2,.9,.2,1)_both]">
                      {/* aurora wash */}
                      <div className="pointer-events-none absolute inset-0 opacity-70">
                        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-blue-300/25 blur-3xl animate-[orb_7.5s_ease-in-out_infinite]" />
                        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-blue-200/35 blur-3xl animate-[orb_9.5s_ease-in-out_infinite]" />
                        <div className="absolute left-1/3 -bottom-24 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl animate-[orb_10.5s_ease-in-out_infinite]" />
                      </div>

                      <div className="relative p-5 md:p-6">
                        {/* header row */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-white/90">
                            <div className="text-[14px] font-semibold tracking-wide uppercase">
                              Welcome back
                            </div>
                            <div className="text-[12px] text-white/70">
                              Sign in to continue
                            </div>
                          </div>

                          <div className="h-10 w-10 rounded-2xl border border-white/25 bg-white/10 backdrop-blur grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                            <div className="h-2 w-2 rounded-full bg-white/70 animate-[pulseDot_1.6s_ease-in-out_infinite]" />
                          </div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                          {/* Email */}
                          <div className="relative">
                            <div className="relative">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" "
                                disabled={isSubmitting}
                                className="peer w-full h-[54px] rounded-[18px]
                                           border border-white/18 bg-white/10 text-white/90
                                           px-4 pt-5 pb-2 outline-none
                                           transition duration-300
                                           focus:border-white/40 focus:bg-white/12
                                           focus:shadow-[0_14px_40px_rgba(255,255,255,0.10),0_18px_50px_rgba(255,60,163,0.18)]
                                           disabled:opacity-60"
                              />
                              <label
                                className="absolute left-4 top-[16px] text-[13px] text-white/65 pointer-events-none
                                                 transition-all duration-200
                                                 peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:text-white/80
                                                 peer-[:not(:placeholder-shown)]:top-[8px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-white/80"
                              >
                                Email
                              </label>

                              <div className="pointer-events-none absolute left-4 right-4 bottom-[10px] h-[2px] rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-0 bg-[linear-gradient(90deg,rgba(26,67,191,0.0),rgba(26,67,191,0.9),rgba(255,255,255,0.8),rgba(26,67,191,0.0))] peer-focus:w-full transition-all duration-500" />
                              </div>
                            </div>

                            <div className="mt-1 text-[11px] text-white/55">
                              Use your Moonbliss email
                            </div>
                          </div>

                          {/* Password */}
                          <div className="relative">
                            <div className="relative">
                              <input
                                type={reveal ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                disabled={isSubmitting}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleLogin()
                                }
                                className="peer w-full h-[54px] rounded-[18px]
                                           border border-white/18 bg-white/10 text-white/90
                                           px-4 pt-5 pb-2 outline-none
                                           transition duration-300
                                           focus:border-white/40 focus:bg-white/12
                                           focus:shadow-[0_14px_40px_rgba(255,255,255,0.10),0_18px_50px_rgba(255,60,163,0.18)]
                                           disabled:opacity-60"
                              />
                              <label
                                className="absolute left-4 top-[16px] text-[13px] text-white/65 pointer-events-none
                                                 transition-all duration-200
                                                 peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:text-white/80
                                                 peer-[:not(:placeholder-shown)]:top-[8px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-white/80"
                              >
                                Password
                              </label>

                              <button
                                type="button"
                                onClick={() => setReveal((v) => !v)}
                                disabled={isSubmitting || !password}
                                className="absolute right-3 top-1/2 -translate-y-1/2
                                           h-9 px-3 rounded-xl
                                           border border-white/18 bg-white/10 text-white/80 text-[12px] font-semibold
                                           transition hover:bg-white/14 hover:-translate-y-[1px]
                                           disabled:opacity-50 disabled:hover:translate-y-0"
                              >
                                {reveal ? "Hide" : "Show"}
                              </button>

                              <div className="pointer-events-none absolute left-4 right-4 bottom-[10px] h-[2px] rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-0 bg-[linear-gradient(90deg,rgba(26,67,191,0.0),rgba(26,67,191,0.9),rgba(255,255,255,0.8),rgba(26,67,191,0.0))] peer-focus:w-full transition-all duration-500" />
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-[11px] text-white/55">
                                Tip: Use 123 / 123 (demo)
                              </div>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                className="text-[12px] font-semibold text-white/80 hover:text-white transition"
                                onClick={() => alert("Forgot password (demo).")}
                              >
                                Forgot?
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Button */}
                        <button
                          onClick={handleLogin}
                          disabled={
                            !email.trim() || !password.trim() || isSubmitting
                          }
                          className="relative mt-5 w-full h-[54px] rounded-[18px] font-extrabold text-white
                                     bg-[linear-gradient(135deg,#1a43bf,rgba(255,255,255,0.35),#3b82f6)]
                                     shadow-[0_18px_44px_rgba(26,67,191,0.30)]
                                     transition
                                     hover:-translate-y-[1px] hover:brightness-[1.05]
                                     active:translate-y-0
                                     disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          <span className="relative z-[1]">
                            {isSubmitting ? "Signing in..." : "Sign in"}
                          </span>
                        </button>

                        {/* Divider */}
                        <div className="my-5 flex items-center gap-2 text-[12px] text-white/70">
                          <div className="h-px flex-1 bg-white/20" />
                          <span>Or continue with</span>
                          <div className="h-px flex-1 bg-white/20" />
                        </div>

                        {/* Social */}
                        <div className="flex justify-center gap-3">
                          {[
                            {
                              icon: logoGoogle,
                              color: "text-[#ea4335]",
                              label: "Google",
                            },
                            {
                              icon: logoFacebook,
                              color: "text-[#1877f2]",
                              label: "Facebook",
                            },
                            {
                              icon: logoTwitter,
                              color: "text-[#1da1f2]",
                              label: "Twitter",
                            },
                          ].map((s) => (
                            <button
                              key={s.label}
                              disabled={isSubmitting}
                              aria-label={`Sign in with ${s.label}`}
                              className={`relative h-[52px] w-[52px] rounded-[18px]
                                          border border-white/18 bg-white/10 backdrop-blur
                                          grid place-items-center text-[22px] ${s.color}
                                          shadow-[0_14px_30px_rgba(0,0,0,0.14)]
                                          transition
                                          hover:-translate-y-[1px] hover:bg-white/14
                                          disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                            >
                              <IonIcon icon={s.icon} />
                            </button>
                          ))}
                        </div>

                        {/* Sign up */}
                        <div className="mt-5 text-center text-[14px] text-white/80">
                          Don't have an account?{" "}
                          <span className="font-extrabold text-white cursor-pointer underline decoration-white/50 hover:decoration-white transition">
                            Sign up
                          </span>
                        </div>
                      </div>

                      {/* bottom shimmer */}
                      <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 h-24 w-[70%] rounded-full bg-white/20 blur-2xl opacity-60 animate-[shimmer_3.8s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>

                {/* Keyframes (JSX-safe) */}
                <style>{`
                  @keyframes pop {
                    from { opacity: 0; transform: translateY(14px) scale(0.985); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes floaty {
                    0%,100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                  }
                  @keyframes glow {
                    0%,100% { filter: drop-shadow(0 10px 28px rgba(255,255,255,0.16)); }
                    50% { filter: drop-shadow(0 18px 40px rgba(255,255,255,0.26)); }
                  }
                  @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes orb {
                    0%,100% { transform: translate(0px, 0px) scale(1); opacity: 0.75; }
                    50% { transform: translate(18px, -12px) scale(1.08); opacity: 0.95; }
                  }
                  @keyframes shimmer {
                    0%,100% { transform: translateX(-50%) translateY(0); opacity: 0.45; }
                    50% { transform: translateX(-50%) translateY(-10px); opacity: 0.65; }
                  }
                  @keyframes sparkle {
                    0%,100% { transform: translateY(0) scale(1); opacity: 0.25; }
                    50% { transform: translateY(-14px) scale(1.25); opacity: 0.65; }
                  }
                  @keyframes pulseDot {
                    0%,100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.6); opacity: 1; }
                  }
                `}</style>
              </div>
            </div>
          ) : null}
        </IonContent>
      </IonPage>

      <ComprehensiveQuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={closeQuestionnaire}
        onComplete={handleQuestionnairesComplete}
      />
    </>
  );
};

export default Onboarding;
