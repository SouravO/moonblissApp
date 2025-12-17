import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { logoGoogle, logoFacebook, logoTwitter } from "ionicons/icons";
import { useState, useCallback } from "react";
import { useQuestionnaireFlow } from "@/domains/health/hooks/useQuestionnaireFlow.js";
import { storageService } from "@/infrastructure/storage/storageService.js";
import ComprehensiveQuestionnaireModal from "@/domains/health/components/ComprehensiveQuestionnaireModal.jsx";

/**
 * Onboarding Page
 * Handles:
 * - Login/authentication (simple email/password)
 * - Comprehensive medical questionnaire (20 questions)
 * - Complete onboarding flow
 */
const Onboarding = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState("login"); // 'login' or 'questionnaire'

  const {
    showQuestionnaire,
    openQuestionnaire,
    closeQuestionnaire,
    handleQuestionnaireComplete,
  } = useQuestionnaireFlow();

  /**
   * Handle login submission
   */
  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user profile
      const userProfile = storageService.userProfileService.get();
      userProfile.email = email;
      userProfile.name = email.split("@")[0]; // Use email username as name
      userProfile.onboardingStartedAt = new Date().toISOString().split("T")[0];

      storageService.userProfileService.save(userProfile);

      // Move to questionnaire step
      setStep("questionnaire");
      openQuestionnaire();
    } catch (error) {
      console.error("Login error:", error);
      alert("Error during login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, openQuestionnaire]);

  /**
   * Handle questionnaire completion
   */
  const handleQuestionnairesComplete = useCallback(
    async (answers) => {
      try {
        // Questionnaire completion is handled by the hook
        handleQuestionnaireComplete(answers);

        // Mark onboarding as complete
        storageService.onboardingService.markComplete();

        // Trigger page reload to update router state
        setTimeout(() => {
          window.location.href = "/health";
        }, 500);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        alert("Error saving your information. Please try again.");
      }
    },
    [handleQuestionnaireComplete]
  );

  return (
    <>
      <IonPage>
        <IonContent fullscreen className="bg-white">
          {step === "login" ? (
            <div className="flex flex-col items-center justify-center min-h-full px-8 py-12">
              {/* Logo */}
              <div className="mb-12 mt-8">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                  moonbliss
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-normal text-gray-800 mb-10">
                Login to your Account
              </h1>

              {/* Form Container */}
              <div className="w-full max-w-md space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-base text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                    className="w-full px-0 py-2 bg-white border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Password Input */}
                <div className="mt-8">
                  <label className="block text-base text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className="w-full px-0 py-2 bg-white border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50"
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                {/* Sign In Button */}
                <button
                  onClick={handleLogin}
                  disabled={!email.trim() || !password.trim() || isSubmitting}
                  className="w-full h-12 bg-white text-gray-800 border border-gray-300 rounded-md font-medium mt-8 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>

                {/* Divider */}
                <div className="flex items-center justify-center my-8">
                  <div className="border-t border-gray-300 flex-grow"></div>
                  <span className="px-4 text-sm text-gray-600">
                    Or sign in with
                  </span>
                  <div className="border-t border-gray-300 flex-grow"></div>
                </div>

                {/* Social Login Buttons */}
                <div className="flex justify-center gap-6 mb-8">
                  <button
                    className="text-3xl text-red-500 hover:opacity-80 transition-opacity disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <IonIcon icon={logoGoogle} />
                  </button>
                  <button
                    className="text-3xl text-blue-600 hover:opacity-80 transition-opacity disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <IonIcon icon={logoFacebook} />
                  </button>
                  <button
                    className="text-3xl text-blue-400 hover:opacity-80 transition-opacity disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <IonIcon icon={logoTwitter} />
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center text-base text-gray-700 mt-8">
                  Don't have an account?{" "}
                  <span className="text-purple-600 font-semibold cursor-pointer hover:underline">
                    Sign up
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </IonContent>
      </IonPage>

      {/* Comprehensive Questionnaire Modal */}
      <ComprehensiveQuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={closeQuestionnaire}
        onComplete={handleQuestionnairesComplete}
      />
    </>
  );
};

export default Onboarding;
