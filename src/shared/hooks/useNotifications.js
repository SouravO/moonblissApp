import { useState, useEffect, useCallback } from "react";
import {
    requestNotificationPermission,
    areNotificationsEnabled,
    schedulePeriodReminder,
    scheduleMedicationReminder,
    scheduleMoodCheckIn,
    scheduleHydrationReminders,
    cancelAllNotifications,
    getPendingNotifications,
    addNotificationReceivedListener,
    addNotificationActionListener,
} from "@/infrastructure/notifications/notificationService";

/**
 * Hook for managing local notifications
 */
export function useNotifications() {
    const [permissionStatus, setPermissionStatus] = useState("prompt");
    const [enabled, setEnabled] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState([]);

    // Check notification status on mount
    useEffect(() => {
        checkNotificationStatus();
    }, []);

    // Set up notification listeners
    useEffect(() => {
        const removeReceivedListener = addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
        });

        const removeActionListener = addNotificationActionListener((action) => {
            console.log("Notification action performed:", action);
            // Handle notification tap - navigate to appropriate screen
            handleNotificationAction(action);
        });

        return () => {
            removeReceivedListener();
            removeActionListener();
        };
    }, []);

    const checkNotificationStatus = useCallback(async () => {
        const isEnabled = await areNotificationsEnabled();
        setEnabled(isEnabled);
        await refreshPendingNotifications();
    }, []);

    const refreshPendingNotifications = useCallback(async () => {
        const pending = await getPendingNotifications();
        setPendingNotifications(pending);
    }, []);

    const requestPermission = useCallback(async () => {
        const result = await requestNotificationPermission();
        setPermissionStatus(result.display);
        if (result.display === "granted") {
            setEnabled(true);
        }
        return result;
    }, []);

    const handleNotificationAction = useCallback((action) => {
        const { extra } = action.notification;

        if (!extra?.type) return;

        switch (extra.type) {
            case "period_reminder":
                // Navigate to period tracker
                window.location.hash = "#/health";
                break;
            case "medication_reminder":
                // Navigate to health page
                window.location.hash = "#/health";
                break;
            case "mood_check":
                // Navigate to activities (mood tracker)
                window.location.hash = "#/activities";
                break;
            case "hydration_reminder":
                // Navigate to activities
                window.location.hash = "#/activities";
                break;
            default:
                break;
        }
    }, []);

    // Schedule period reminder based on next period date
    const schedulePeriodNotification = useCallback(async (nextPeriodDate, daysUntil) => {
        if (!enabled) {
            const permission = await requestPermission();
            if (permission.display !== "granted") return false;
        }

        await schedulePeriodReminder(nextPeriodDate, daysUntil);
        await refreshPendingNotifications();
        return true;
    }, [enabled, requestPermission, refreshPendingNotifications]);

    // Schedule daily medication reminder
    const scheduleMedication = useCallback(async (hour, minute, name) => {
        if (!enabled) {
            const permission = await requestPermission();
            if (permission.display !== "granted") return false;
        }

        await scheduleMedicationReminder(hour, minute, name);
        await refreshPendingNotifications();
        return true;
    }, [enabled, requestPermission, refreshPendingNotifications]);

    // Schedule mood check-in
    const scheduleMoodReminder = useCallback(async (hour = 20, minute = 0) => {
        if (!enabled) {
            const permission = await requestPermission();
            if (permission.display !== "granted") return false;
        }

        await scheduleMoodCheckIn(hour, minute);
        await refreshPendingNotifications();
        return true;
    }, [enabled, requestPermission, refreshPendingNotifications]);

    // Schedule hydration reminders
    const scheduleHydration = useCallback(async () => {
        if (!enabled) {
            const permission = await requestPermission();
            if (permission.display !== "granted") return false;
        }

        await scheduleHydrationReminders();
        await refreshPendingNotifications();
        return true;
    }, [enabled, requestPermission, refreshPendingNotifications]);

    // Cancel all notifications
    const cancelAll = useCallback(async () => {
        await cancelAllNotifications();
        setPendingNotifications([]);
    }, []);

    return {
        permissionStatus,
        enabled,
        pendingNotifications,
        requestPermission,
        checkNotificationStatus,
        schedulePeriodNotification,
        scheduleMedication,
        scheduleMoodReminder,
        scheduleHydration,
        cancelAll,
        refreshPendingNotifications,
    };
}
