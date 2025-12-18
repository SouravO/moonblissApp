import React, { useState, useEffect, useRef, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import {
  closeOutline,
  footstepsOutline,
  playOutline,
  pauseOutline,
  refreshOutline,
  flameOutline,
  timeOutline,
  trendingUpOutline,
} from "ionicons/icons";

/**
 * Step Tracker Modal Component
 * Uses device accelerometer to count walking steps
 */
const StepTrackerModal = ({ isOpen, onClose }) => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Refs for step detection algorithm
  const accelHistory = useRef([]);
  const lastStepTime = useRef(0);
  const timerRef = useRef(null);
  const isTrackingRef = useRef(false);

  // Keep isTrackingRef in sync
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("stepTrackerData");
    if (savedData) {
      const data = JSON.parse(savedData);
      // Check if it's from today
      const savedDate = new Date(data.date);
      const today = new Date();
      if (savedDate.toDateString() === today.toDateString()) {
        setSteps(data.steps || 0);
        setDuration(data.duration || 0);
      }
    }
  }, []);

  // Calculate calories (rough estimate: 0.04 cal per step)
  useEffect(() => {
    const newCalories = Math.round(steps * 0.04);
    const newDistance = ((steps * 0.75) / 1000).toFixed(2);
    setCalories(newCalories);
    setDistance(newDistance);

    // Save to localStorage
    localStorage.setItem(
      "stepTrackerData",
      JSON.stringify({
        steps,
        calories: newCalories,
        distance: parseFloat(newDistance),
        duration,
        date: new Date().toISOString(),
      })
    );
  }, [steps, duration]);

  // Duration timer
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking]);

  // Improved step detection algorithm
  const handleMotion = useCallback((event) => {
    if (!isTrackingRef.current) return;

    // Try both acceleration types
    const accel = event.accelerationIncludingGravity || event.acceleration;

    if (!accel || (accel.x === null && accel.y === null && accel.z === null)) {
      setDebugInfo("No accelerometer data");
      return;
    }

    const x = accel.x || 0;
    const y = accel.y || 0;
    const z = accel.z || 0;

    // Calculate magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Keep a rolling window of acceleration values (last 10 readings)
    accelHistory.current.push(magnitude);
    if (accelHistory.current.length > 10) {
      accelHistory.current.shift();
    }

    // Need at least 5 readings to detect a step
    if (accelHistory.current.length < 5) {
      setDebugInfo(`Collecting data: ${accelHistory.current.length}/5`);
      return;
    }

    // Calculate average and find peaks
    const avg =
      accelHistory.current.reduce((a, b) => a + b, 0) /
      accelHistory.current.length;
    const current = accelHistory.current[accelHistory.current.length - 1];
    const prev = accelHistory.current[accelHistory.current.length - 2];
    const prevPrev = accelHistory.current[accelHistory.current.length - 3];

    // Debug info
    setDebugInfo(`Mag: ${magnitude.toFixed(1)} | Avg: ${avg.toFixed(1)}`);

    // Detect peak: current is less than previous, and previous was greater than its previous
    // This means we just passed a peak
    const isPeak = prev > prevPrev && prev > current;

    // The peak must be significantly above average (step threshold)
    const threshold = avg + 1.5; // Lower threshold for better detection
    const peakIsSignificant = prev > threshold;

    const now = Date.now();
    const timeSinceLastStep = now - lastStepTime.current;

    // Minimum 250ms between steps (max ~4 steps/second for running)
    if (isPeak && peakIsSignificant && timeSinceLastStep > 250) {
      setSteps((prev) => prev + 1);
      lastStepTime.current = now;
    }
  }, []);

  // Request motion permission (required for iOS 13+)
  const requestPermission = async () => {
    try {
      // Check if DeviceMotionEvent is available
      if (typeof window.DeviceMotionEvent === "undefined") {
        setError("Motion sensors not available on this device");
        return false;
      }

      // iOS 13+ requires permission request
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission === "granted") {
            setPermissionGranted(true);
            return true;
          } else {
            setError("Motion permission denied");
            setPermissionGranted(false);
            return false;
          }
        } catch (err) {
          // User gesture required or permission denied
          setError("Please tap again to grant motion permission");
          return false;
        }
      } else {
        // Android and older iOS don't need permission
        setPermissionGranted(true);
        return true;
      }
    } catch (err) {
      console.error("Permission error:", err);
      setError("Failed to request motion permission");
      setPermissionGranted(false);
      return false;
    }
  };

  // Start/Stop tracking
  const toggleTracking = async () => {
    if (!isTracking) {
      // Request permission first time
      if (permissionGranted === null || permissionGranted === false) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Clear history on start
      accelHistory.current = [];
      lastStepTime.current = 0;

      window.addEventListener("devicemotion", handleMotion, true);
      setIsTracking(true);
      setError(null);
      setDebugInfo("Starting...");
    } else {
      window.removeEventListener("devicemotion", handleMotion, true);
      setIsTracking(false);
      setDebugInfo("");
    }
  };

  // Reset tracking
  const resetTracking = () => {
    setSteps(0);
    setCalories(0);
    setDistance(0);
    setDuration(0);
    setIsTracking(false);
    setDebugInfo("");
    accelHistory.current = [];
    window.removeEventListener("devicemotion", handleMotion, true);
    // Clear localStorage
    localStorage.removeItem("stepTrackerData");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [handleMotion]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate goal progress (default goal: 6000 steps)
  const dailyGoal = 6000;
  const progress = Math.min((steps / dailyGoal) * 100, 100);

  // Close modal without resetting data
  const handleClose = () => {
    // Stop tracking if active
    if (isTracking) {
      window.removeEventListener("devicemotion", handleMotion, true);
      setIsTracking(false);
      setDebugInfo("");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Pulse animation styles */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .pulse-ring {
          animation: pulse-ring 1.5s ease-out infinite;
        }
        @keyframes step-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .step-bounce {
          animation: step-bounce 0.3s ease-out;
        }
      `}</style>

      <div className="relative w-[90%] max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <IonIcon
                icon={footstepsOutline}
                className="text-white text-2xl"
              />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Step Tracker</h2>
              <p className="text-white/80 text-sm">
                {isTracking ? "Tracking..." : "Ready to track"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <IonIcon icon={closeOutline} className="text-white text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Step Counter */}
          <div className="relative flex justify-center mb-6">
            {/* Progress Ring */}
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Pulse effect when tracking */}
              {isTracking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-emerald-500/20 pulse-ring" />
                </div>
              )}

              {/* Step count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <IonIcon
                  icon={footstepsOutline}
                  className="text-emerald-500 text-3xl mb-1"
                />
                <span className="text-4xl font-bold text-gray-800">
                  {steps}
                </span>
                <span className="text-sm text-gray-500">
                  / {dailyGoal} steps
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <IonIcon
                icon={flameOutline}
                className="text-orange-500 text-xl mb-1"
              />
              <p className="text-lg font-bold text-gray-800">{calories}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <IonIcon
                icon={trendingUpOutline}
                className="text-blue-500 text-xl mb-1"
              />
              <p className="text-lg font-bold text-gray-800">{distance}</p>
              <p className="text-xs text-gray-500">km</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <IonIcon
                icon={timeOutline}
                className="text-purple-500 text-xl mb-1"
              />
              <p className="text-lg font-bold text-gray-800">
                {formatDuration(duration)}
              </p>
              <p className="text-xs text-gray-500">Time</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          {/* Debug Info - Shows sensor data when tracking */}
          {isTracking && debugInfo && (
            <div className="bg-gray-100 text-gray-600 text-xs p-2 rounded-lg mb-4 text-center font-mono">
              {debugInfo}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            <button
              onClick={toggleTracking}
              className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                isTracking
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
              }`}
            >
              <IonIcon
                icon={isTracking ? pauseOutline : playOutline}
                className="text-xl"
              />
              {isTracking ? "Stop" : "Start Tracking"}
            </button>

            <button
              onClick={resetTracking}
              className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <IonIcon icon={refreshOutline} className="text-xl" />
            </button>
          </div>

          {/* Tip */}
          <p className="text-center text-xs text-gray-400 mt-4">
            💡 Keep your phone in your pocket or hand while walking for best
            accuracy
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepTrackerModal;
