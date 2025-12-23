import { useEffect } from "react";
import AppRouter from "@/app/router";
import { BackButtonProvider } from "@/infrastructure/context/BackButtonContext";

const App = () => {
  // Initialize notifications on app start (lazy load to prevent blocking)
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Dynamic import to prevent blocking app render if plugin fails
        const {
          initializeNotificationChannels,
          requestNotificationPermission,
          sendImmediateNotification,
          scheduleMoodCheckIn,
        } = await import("@/infrastructure/notifications/notificationService");

        // Initialize channels first
        await initializeNotificationChannels();

        // Request permission
        const permission = await requestNotificationPermission();
        console.log("Notification permission:", permission);

        if (permission.display === "granted") {
          // Send a test notification immediately (will appear in 1 second)
          await sendImmediateNotification(
            "Welcome to Moonbliss! 🌸",
            "Notifications are working perfectly!"
          );

          // Schedule daily mood check-in at 8 PM
          await scheduleMoodCheckIn(20, 0);

          console.log("Notifications initialized and test sent!");
        }
      } catch (error) {
        // Silently fail - notifications are not critical for app to work
        console.warn("Notifications not available:", error);
      }
    };

    // Delay initialization slightly to ensure app is fully rendered
    const timer = setTimeout(initNotifications, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BackButtonProvider>
      <AppRouter />
    </BackButtonProvider>
  );
};

export default App;
