import { IonReactRouter } from "@ionic/react-router";
import { IonTabs, IonRouterOutlet } from "@ionic/react";
import { Route, Redirect, Switch } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

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

const HAS_VISITED_KEY = "moonbliss_hasVisited";

const AppRouter = () => {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [hasVisited, setHasVisited] = useState(
    () => !!localStorage.getItem(HAS_VISITED_KEY)
  );
  const [showCard, setShowCard] = useState(false);

  // Track if Card has been shown in this session
  const cardShownRef = useRef(false);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = storageService.userProfileService.exists();
      const isOnboarded = storageService.onboardingService.isComplete();
      setLoggedIn(isLoggedIn);
      setOnboarded(isOnboarded);

      // Check if any user data exists
      const hasUserData = isLoggedIn || isOnboarded;
      const hasVisitedFlag = !!localStorage.getItem(HAS_VISITED_KEY);

      // If no user data and no hasVisited, show Card
      if (!hasUserData && !hasVisitedFlag && !cardShownRef.current) {
        setShowCard(true);
      } else {
        setShowCard(false);
      }
      setHasVisited(hasVisitedFlag);
      setReady(true);
    };

    checkAuth();

    // Listen for storage changes (logout from another tab or component)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Custom event for onboarding completion
    const handleOnboardingComplete = () => {
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

  // Handler when Card is shown and user proceeds
  const handleCardComplete = () => {
    localStorage.setItem(HAS_VISITED_KEY, "1");
    setHasVisited(true);
    cardShownRef.current = true;
    setShowCard(false);
  };

  if (!ready) return null;

  // 1. First visit (empty localStorage): Show Card
  if (showCard) {
    return (
      <IonReactRouter>
        <Switch>
          <Route
            exact
            path="/card"
            render={() => <Card onGetStarted={handleCardComplete} />}
          />
          <Redirect to="/card" />
        </Switch>
      </IonReactRouter>
    );
  }

  // 2. User not logged in/onboarded, but hasVisited: Show Onboarding/Login
  if (!loggedIn && !onboarded && hasVisited) {
    return (
      <IonReactRouter>
        <Switch>
          <Route exact path="/login" component={Onboarding} />
          <Redirect to="/login" />
        </Switch>
      </IonReactRouter>
    );
  }

  // 3. User data present: Show main app (HealthHome as landing)
  return (
    <IonReactRouter>
      <MainRouterContent />
    </IonReactRouter>
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

        {/* Main landing page is /health */}
        <Route exact path="/">
          <Redirect to="/health" />
        </Route>
      </IonRouterOutlet>
      <BottomNav />
    </IonTabs>
  );
};

export default AppRouter;
