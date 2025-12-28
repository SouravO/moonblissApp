import { IonReactRouter } from "@ionic/react-router";
import { IonTabs, IonRouterOutlet } from "@ionic/react";
import { Route, Redirect, Switch } from "react-router-dom";
import { useEffect, useState } from "react";

import { storageService } from "@/infrastructure/storage/storageService";
import { useBackButton } from "@/domains/health/hooks/useBackButton";

import HealthHome from "@/domains/health/pages/HealthHome";
import CommerceHome from "@/domains/commerce/pages/CommerceHome";
import Onboarding from "@/shared/pages/Onboarding";
import Profile from "@/shared/pages/Profile";
import Music from "@/shared/pages/Music";
import Activities from "@/shared/pages/Activities";
import BottomNav from "@/shared/layout/BottomNav";
import Quiz from "../../shared/pages/Quiz";
import Calendar from "../../domains/health/components/Calendar";
import Card from "../../domains/health/pages/Cards";

const AppRouter = () => {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = storageService.userProfileService.exists();
      const isOnboarded = storageService.onboardingService.isComplete();

      console.log(
        "Auth check - loggedIn:",
        isLoggedIn,
        "onboarded:",
        isOnboarded
      );

      setLoggedIn(isLoggedIn);
      setOnboarded(isOnboarded);
      setReady(true);
    };

    checkAuth();

    // Listen for storage changes (logout from another tab or component)
    const handleStorageChange = () => {
      console.log("Storage changed - rechecking auth");
      checkAuth();
    };

    // Custom event for onboarding completion
    const handleOnboardingComplete = () => {
      console.log("Onboarding complete event triggered");
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("onboarding-complete", handleOnboardingComplete);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "onboarding-complete",
        handleOnboardingComplete
      );
    };
  }, []);

  if (!ready) return null;

  if (!loggedIn || !onboarded) {
    return (
      <IonReactRouter>
        <OnboardingRouterContent />
      </IonReactRouter>
    );
  }

  return (
    <IonReactRouter>
      <MainRouterContent />
    </IonReactRouter>
  );
};

// Component inside router context for onboarding
const OnboardingRouterContent = () => {
  useBackButton();
  return (
    <Switch>
      <Route exact path="/card" component={Card} />
      <Route exact path="/login" component={Onboarding} />
      <Redirect to="/card" />
    </Switch>
  );
};

// Component inside router context for main app
const MainRouterContent = () => {
  useBackButton();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/health" component={HealthHome} />
        <Route exact path="/activities" component={Activities} />
        <Route exact path="/music" component={Music} />
        <Route exact path="/card" component={Card} />
        {/* quiz */}
        {/* <Route exact path="/quiz" component={Quiz} /> */}
        <Route exact path="/shop" component={CommerceHome} />
        <Route exact path="/calendar" component={Calendar} />
        <Route exact path="/profile" component={Profile} />

        <Route exact path="/">
          <Redirect to="/card" />
        </Route>
      </IonRouterOutlet>

      {/* ✅ SAFE BOTTOM NAV */}
      <BottomNav />
    </IonTabs>
  );
};

export default AppRouter;
