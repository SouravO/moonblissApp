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

const AppRouter = () => {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    setLoggedIn(storageService.userProfileService.exists());
    setOnboarded(storageService.onboardingService.isComplete());
    setReady(true);
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
  return <Route path="*" component={Onboarding} />;
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
        {/* quiz */}
        {/* <Route exact path="/quiz" component={Quiz} /> */}
        <Route exact path="/shop" component={CommerceHome} />
        <Route exact path="/calendar" component={Calendar} />
        <Route exact path="/profile" component={Profile} />

        <Route exact path="/">
          <Redirect to="/health" />
        </Route>
      </IonRouterOutlet>

      {/* ✅ SAFE BOTTOM NAV */}
      <BottomNav />
    </IonTabs>
  );
};

export default AppRouter;
