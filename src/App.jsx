import { useEffect } from "react";
import AppRouter from "@/app/router";
import { BackButtonProvider } from "@/infrastructure/context/BackButtonContext";
import { ModalProvider } from "@/infrastructure/context/ModalContext";

const App = () => {
  // Initialize notifications on app start (lazy load to prevent blocking)
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Dynamic import to prevent blocking app render if plugin fails
        const {
          initializeNotificationChannels,
          requestNotificationPermission,
          scheduleGoodMorningNotification,
          scheduleHydrationReminders,
        } = await import("@/infrastructure/notifications/notificationService");

        // Initialize channels first
        await initializeNotificationChannels();

        // Request permission
        const permission = await requestNotificationPermission();
        console.log("Notification permission:", permission);

        if (permission.display === "granted") {
          // Schedule good morning notification at 7:00 AM
          await scheduleGoodMorningNotification(7, 0);

          // Schedule hydration reminders every 2 hours (8 AM - 8 PM)
          await scheduleHydrationReminders();

          console.log("All notifications scheduled!");
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
      <ModalProvider>
        <AppRouter />
      </ModalProvider>
    </BackButtonProvider>
  );
};

export default App;
