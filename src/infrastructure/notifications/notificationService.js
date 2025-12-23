import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

/**
 * Moonbliss Notification Service
 * Handles local notifications for period reminders, medication, hydration, etc.
 */

// Notification Channel IDs
export const CHANNELS = {
    PERIOD: "period-reminders",
    MEDICATION: "medication-reminders",
    HYDRATION: "hydration-reminders",
    MOOD: "mood-tracking",
    GENERAL: "general-notifications",
};

// Notification Types
export const NOTIFICATION_TYPES = {
    PERIOD_APPROACHING: 1000,
    PERIOD_TODAY: 1001,
    PERIOD_OVERDUE: 1002,
    MEDICATION_REMINDER: 2000,
    HYDRATION_REMINDER: 3000,
    MOOD_CHECK: 4000,
    DAILY_TIP: 5000,
    GOOD_MORNING: 6000,
};

// Motivational messages for variety
const MORNING_MESSAGES = [
    { title: "Good Morning, Beautiful! ☀️", body: "Start your day with 5 minutes of gentle stretching. Your body will thank you!" },
    { title: "Rise & Shine! 🌸", body: "A new day, a fresh start. How about some morning yoga to energize your soul?" },
    { title: "Hello Sunshine! 🌺", body: "Take a deep breath, set your intentions, and make today amazing!" },
    { title: "Good Morning Queen! 👑", body: "Your wellness journey starts with this moment. Try some light yoga today!" },
    { title: "Wake Up & Glow! ✨", body: "10 minutes of morning meditation can transform your entire day. Give it a try!" },
];

const HYDRATION_MESSAGES = [
    { title: "Hydration Check! 💧", body: "Your cells are thirsty! Grab a glass of water and feel the refresh." },
    { title: "Water Break Time! 💦", body: "Staying hydrated keeps your skin glowing and your mind sharp. Drink up!" },
    { title: "Sip Sip Hooray! 🥤", body: "2 hours since your last drink - time to refuel with some H2O!" },
    { title: "Hydration Reminder 💧", body: "Water is life! Take a moment to hydrate your beautiful self." },
    { title: "Thirsty? You Should Be! 💦", body: "Your body is 60% water. Keep the balance - drink a glass now!" },
];

/**
 * Initialize notification channels (Android 8+)
 */
export async function initializeNotificationChannels() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Period reminders channel
        await LocalNotifications.createChannel({
            id: CHANNELS.PERIOD,
            name: "Period Reminders",
            description: "Notifications about your upcoming period",
            importance: 4,
            visibility: 1,
            vibration: true,
            lights: true,
            lightColor: "#FF69B4",
        });

        // Medication reminders channel
        await LocalNotifications.createChannel({
            id: CHANNELS.MEDICATION,
            name: "Medication Reminders",
            description: "Daily medication and supplement reminders",
            importance: 5,
            visibility: 1,
            vibration: true,
        });

        // Hydration reminders channel
        await LocalNotifications.createChannel({
            id: CHANNELS.HYDRATION,
            name: "Hydration Reminders",
            description: "Water intake reminders",
            importance: 3,
            visibility: 1,
            vibration: false,
        });

        // Mood tracking channel
        await LocalNotifications.createChannel({
            id: CHANNELS.MOOD,
            name: "Mood Tracking",
            description: "Daily mood check-in prompts",
            importance: 3,
            visibility: 1,
            vibration: false,
        });

        // General notifications channel
        await LocalNotifications.createChannel({
            id: CHANNELS.GENERAL,
            name: "General",
            description: "General app notifications",
            importance: 3,
            visibility: 1,
        });

        console.log("Notification channels initialized");
    } catch (error) {
        console.error("Failed to create notification channels:", error);
    }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermission() {
    if (!Capacitor.isNativePlatform()) {
        console.log("Not native platform, returning granted");
        return { display: "granted" };
    }

    try {
        console.log("Checking notification permissions...");
        const permission = await LocalNotifications.checkPermissions();
        console.log("Current permission status:", permission);

        if (permission.display === "granted") {
            console.log("Permission already granted");
            return permission;
        }

        if (permission.display === "denied") {
            console.log("Permission denied");
            return permission;
        }

        // Request permission
        console.log("Requesting notification permission...");
        const result = await LocalNotifications.requestPermissions();
        console.log("Permission request result:", result);
        return result;
    } catch (error) {
        console.error("Failed to request notification permission:", error);
        return { display: "denied" };
    }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled() {
    if (!Capacitor.isNativePlatform()) return true;

    try {
        const result = await LocalNotifications.areEnabled();
        return result.value;
    } catch (error) {
        console.error("Failed to check notification status:", error);
        return false;
    }
}

/**
 * Schedule a period reminder notification
 */
export async function schedulePeriodReminder(nextPeriodDate, daysUntil) {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Cancel existing period reminders
        await cancelPeriodReminders();

        const notifications = [];

        // 3 days before reminder
        if (daysUntil > 3) {
            const threeDaysBefore = new Date(nextPeriodDate);
            threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
            threeDaysBefore.setHours(9, 0, 0, 0);

            notifications.push({
                id: NOTIFICATION_TYPES.PERIOD_APPROACHING,
                title: "Period Coming Soon 🌸",
                body: "Your period is expected in 3 days. Time to prepare!",
                schedule: { at: threeDaysBefore, allowWhileIdle: true },
                channelId: CHANNELS.PERIOD,
                smallIcon: "ic_stat_icon",
                iconColor: "#FF69B4",
                extra: { type: "period_reminder", daysUntil: 3 },
            });
        }

        // 1 day before reminder
        if (daysUntil > 1) {
            const oneDayBefore = new Date(nextPeriodDate);
            oneDayBefore.setDate(oneDayBefore.getDate() - 1);
            oneDayBefore.setHours(9, 0, 0, 0);

            notifications.push({
                id: NOTIFICATION_TYPES.PERIOD_APPROACHING + 1,
                title: "Period Tomorrow 💕",
                body: "Your period is expected tomorrow. Stay prepared!",
                schedule: { at: oneDayBefore, allowWhileIdle: true },
                channelId: CHANNELS.PERIOD,
                smallIcon: "ic_stat_icon",
                iconColor: "#FF69B4",
                extra: { type: "period_reminder", daysUntil: 1 },
            });
        }

        // Day of period
        const dayOf = new Date(nextPeriodDate);
        dayOf.setHours(8, 0, 0, 0);

        notifications.push({
            id: NOTIFICATION_TYPES.PERIOD_TODAY,
            title: "Period Day 🌺",
            body: "Your period is expected to start today. Take care of yourself!",
            schedule: { at: dayOf, allowWhileIdle: true },
            channelId: CHANNELS.PERIOD,
            smallIcon: "ic_stat_icon",
            iconColor: "#FF69B4",
            extra: { type: "period_reminder", daysUntil: 0 },
        });

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
            console.log("Period reminders scheduled:", notifications.length);
        }
    } catch (error) {
        console.error("Failed to schedule period reminder:", error);
    }
}

/**
 * Cancel all period reminder notifications
 */
export async function cancelPeriodReminders() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await LocalNotifications.cancel({
            notifications: [
                { id: NOTIFICATION_TYPES.PERIOD_APPROACHING },
                { id: NOTIFICATION_TYPES.PERIOD_APPROACHING + 1 },
                { id: NOTIFICATION_TYPES.PERIOD_TODAY },
                { id: NOTIFICATION_TYPES.PERIOD_OVERDUE },
            ],
        });
    } catch (error) {
        console.error("Failed to cancel period reminders:", error);
    }
}

/**
 * Schedule daily medication reminder
 */
export async function scheduleMedicationReminder(hour = 18, minute = 15, name = "medication") {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Cancel existing medication reminders
        await LocalNotifications.cancel({
            notifications: [{ id: NOTIFICATION_TYPES.MEDICATION_REMINDER }],
        });

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: NOTIFICATION_TYPES.MEDICATION_REMINDER,
                    title: "Time for Your Medication 💊",
                    body: `Don't forget to take your ${name}!`,
                    schedule: {
                        on: { hour, minute },
                        every: "day",
                        allowWhileIdle: true,
                    },
                    channelId: CHANNELS.MEDICATION,
                    smallIcon: "ic_stat_icon",
                    iconColor: "#FF69B4",
                    extra: { type: "medication_reminder" },
                },
            ],
        });

        console.log(`Medication reminder scheduled for ${hour}:${minute.toString().padStart(2, "0")}`);
    } catch (error) {
        console.error("Failed to schedule medication reminder:", error);
    }
}

/**
 * Schedule hydration reminders every 2 hours during daytime (8 AM - 10 PM)
 */
export async function scheduleHydrationReminders() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Cancel existing hydration reminders (IDs 3000-3010)
        const cancelIds = [];
        for (let i = 0; i <= 10; i++) {
            cancelIds.push({ id: NOTIFICATION_TYPES.HYDRATION_REMINDER + i });
        }
        await LocalNotifications.cancel({ notifications: cancelIds });

        // Schedule reminders every 2 hours: 8 AM, 10 AM, 12 PM, 2 PM, 4 PM, 6 PM, 8 PM
        const hydrationHours = [8, 10, 12, 14, 16, 18, 20];
        const notifications = hydrationHours.map((hour, index) => {
            const msg = HYDRATION_MESSAGES[index % HYDRATION_MESSAGES.length];
            return {
                id: NOTIFICATION_TYPES.HYDRATION_REMINDER + index,
                title: msg.title,
                body: msg.body,
                schedule: {
                    on: { hour, minute: 0 },
                    every: "day",
                    allowWhileIdle: true,
                },
                channelId: CHANNELS.HYDRATION,
                smallIcon: "ic_stat_icon",
                iconColor: "#87CEEB",
                extra: { type: "hydration_reminder" },
            };
        });

        await LocalNotifications.schedule({ notifications });
        console.log("Hydration reminders scheduled every 2 hours (8 AM - 8 PM)");
    } catch (error) {
        console.error("Failed to schedule hydration reminders:", error);
    }
}

/**
 * Schedule good morning wellness notification
 */
export async function scheduleGoodMorningNotification(hour = 7, minute = 0) {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Cancel existing morning notification
        await LocalNotifications.cancel({
            notifications: [{ id: NOTIFICATION_TYPES.GOOD_MORNING }],
        });

        // Pick a random message
        const msg = MORNING_MESSAGES[Math.floor(Math.random() * MORNING_MESSAGES.length)];

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: NOTIFICATION_TYPES.GOOD_MORNING,
                    title: msg.title,
                    body: msg.body,
                    schedule: {
                        on: { hour, minute },
                        every: "day",
                        allowWhileIdle: true,
                    },
                    channelId: CHANNELS.GENERAL,
                    smallIcon: "ic_stat_icon",
                    iconColor: "#FFB6C1",
                    extra: { type: "good_morning" },
                },
            ],
        });

        console.log(`Good morning notification scheduled for ${hour}:${minute.toString().padStart(2, "0")}`);
    } catch (error) {
        console.error("Failed to schedule good morning notification:", error);
    }
}

/**
 * Schedule daily mood check-in
 */
export async function scheduleMoodCheckIn(hour = 20, minute = 0) {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Cancel existing mood reminders
        await LocalNotifications.cancel({
            notifications: [{ id: NOTIFICATION_TYPES.MOOD_CHECK }],
        });

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: NOTIFICATION_TYPES.MOOD_CHECK,
                    title: "How Are You Feeling? 🌙",
                    body: "Take a moment to log your mood for today.",
                    schedule: {
                        on: { hour, minute },
                        every: "day",
                        allowWhileIdle: true,
                    },
                    channelId: CHANNELS.MOOD,
                    smallIcon: "ic_stat_icon",
                    iconColor: "#DDA0DD",
                    extra: { type: "mood_check" },
                },
            ],
        });

        console.log(`Mood check-in scheduled for ${hour}:${minute.toString().padStart(2, "0")}`);
    } catch (error) {
        console.error("Failed to schedule mood check-in:", error);
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
        }
        console.log("All notifications cancelled");
    } catch (error) {
        console.error("Failed to cancel all notifications:", error);
    }
}

/**
 * Get all pending notifications
 */
export async function getPendingNotifications() {
    if (!Capacitor.isNativePlatform()) return [];

    try {
        const result = await LocalNotifications.getPending();
        return result.notifications;
    } catch (error) {
        console.error("Failed to get pending notifications:", error);
        return [];
    }
}

/**
 * Send an immediate notification
 */
export async function sendImmediateNotification(title, body, channelId = CHANNELS.GENERAL) {
    if (!Capacitor.isNativePlatform()) {
        console.log("Not native platform, skipping notification");
        return;
    }

    try {
        const notificationId = Math.floor(Math.random() * 100000);
        console.log("Scheduling notification with id:", notificationId);

        const result = await LocalNotifications.schedule({
            notifications: [
                {
                    id: notificationId,
                    title,
                    body,
                    // Schedule 3 seconds from now
                    schedule: { at: new Date(Date.now() + 3000) },
                    // Don't specify icon - use system default
                    autoCancel: true,
                },
            ],
        });

        console.log("Notification scheduled successfully:", result);
    } catch (error) {
        console.error("Failed to send immediate notification:", error);
    }
}

/**
 * Add listener for notification received
 */
export function addNotificationReceivedListener(callback) {
    if (!Capacitor.isNativePlatform()) return () => { };

    const listener = LocalNotifications.addListener("localNotificationReceived", callback);
    return () => listener.then((l) => l.remove());
}

/**
 * Add listener for notification action performed
 */
export function addNotificationActionListener(callback) {
    if (!Capacitor.isNativePlatform()) return () => { };

    const listener = LocalNotifications.addListener("localNotificationActionPerformed", callback);
    return () => listener.then((l) => l.remove());
}
