import { IonReactRouter } from "@ionic/react-router";
import { IonTabs, IonRouterOutlet } from "@ionic/react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useEffect, useState } from "react";
import { storageService } from "@/infrastructure/storage/storageService.js";
import HealthHome from "@/domains/health/pages/HealthHome.jsx";
import CommerceHome from "../../domains/commerce/pages/CommerceHome.jsx";
import Onboarding from "../../shared/pages/Onboarding.jsx";
import Profile from "../../shared/pages/Profile.jsx";
import BottomNav from "../../shared/layout/BottomNav.jsx";

/**
 * Main App Router
 * Handles:
 * - Authentication state checking
 * - Onboarding flow
 * - Protected routes
 * - Tab navigation
 */
const AppRouter = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const loggedIn = storageService.userProfileService.exists();
        const onboardingComplete =
          storageService.onboardingService.isComplete();

        setIsLoggedIn(loggedIn);
        setIsOnboardingComplete(onboardingComplete);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Loading state - show nothing while checking
  if (isLoading || isLoggedIn === null || isOnboardingComplete === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="text-5xl">🌸</div>
          <p className="text-gray-600">Loading Moonbliss...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show onboarding/login
  if (!isLoggedIn) {
    return (
      <IonReactRouter>
        <Switch>
          <Route path="*" component={Onboarding} />
        </Switch>
      </IonReactRouter>
    );
  }

  // Logged in but onboarding not complete - show onboarding
  if (!isOnboardingComplete) {
    return (
      <IonReactRouter>
        <Switch>
          <Route path="*" component={Onboarding} />
        </Switch>
      </IonReactRouter>
    );
  }

  // Logged in and onboarded - show app with tab navigation
  return (
    <IonReactRouter>
      <Switch>
        <Route
          exact
          path="/onboarding"
          render={() => <Redirect to="/health" />}
        />
        <Route path="/(health|store|profile)">
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/health" component={HealthHome} />
              <Route exact path="/store" component={CommerceHome} />
              <Route exact path="/profile" component={Profile} />
            </IonRouterOutlet>
            <BottomNav />
          </IonTabs>
        </Route>
        <Route exact path="/">
          <Redirect to="/health" />
        </Route>
      </Switch>
    </IonReactRouter>
  );
};

export default AppRouter;
