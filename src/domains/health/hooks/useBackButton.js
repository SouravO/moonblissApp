import { useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useBackButtonContext } from "@/infrastructure/context/BackButtonContext";

// Flag to check if running on native platform
const isNativePlatform = () => {
  return (
    typeof window !== "undefined" &&
    (window.capacitor || (window.Capacitor && window.Capacitor.isNative))
  );
};

export const useBackButton = () => {
  const history = useHistory();
  const location = useLocation();
  const { handleBack } = useBackButtonContext();
  const backPressedOnceRef = useRef(false);
  const backPressTimeRef = useRef(null);
  const listenerRef = useRef(null);

  useEffect(() => {
    // Only setup back button on native platforms
    if (!isNativePlatform()) {
      return;
    }

    const handleBackButton = async () => {
      // Try to handle back with modal/context first
      if (handleBack()) {
        return;
      }

      const isHealthHome = location.pathname === "/health";

      if (isHealthHome) {
        // On health home - require double tap to exit
        if (backPressedOnceRef.current) {
          // Second tap - exit app
          try {
            const { App } = window.Capacitor;
            if (App && App.exitApp) {
              App.exitApp();
            }
          } catch (error) {
            console.warn("Capacitor App exit not available");
          }
        } else {
          // First tap - show warning
          backPressedOnceRef.current = true;
          alert("Press back again to exit");

          // Reset flag after 2 seconds
          backPressTimeRef.current = setTimeout(() => {
            backPressedOnceRef.current = false;
          }, 2000);
        }
      } else {
        // On other pages - go back to health home
        history.push("/health");
      }
    };

    const setupBackButton = async () => {
      try {
        const { App } = window.Capacitor;
        if (App && App.addListener) {
          listenerRef.current = await App.addListener(
            "backButton",
            handleBackButton
          );
        }
      } catch (error) {
        console.debug("Capacitor back button not available");
      }
    };

    setupBackButton();

    return () => {
      if (listenerRef.current && listenerRef.current.remove) {
        listenerRef.current.remove();
      }
      if (backPressTimeRef.current) {
        clearTimeout(backPressTimeRef.current);
      }
    };
  }, [history, location.pathname, handleBack]);
};
