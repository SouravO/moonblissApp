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

      <div className="relative w-[90%] max-w-md rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl overflow-hidden border border-blue-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <IonIcon
                icon={footstepsOutline}
                className="text-white text-2xl"
              />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">Step Tracker</h2>
              <p className="text-white/70 text-xs font-medium">
                {isTracking ? "🔴 Tracking active" : "⏸️ Ready to track"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/25 transition-colors backdrop-blur-sm border border-white/20"
          >
            <IonIcon icon={closeOutline} className="text-white text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Step Counter */}
          <div className="relative flex justify-center">
            {/* Progress Ring */}
            <div className="relative w-56 h-56">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg">
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="12"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="url(#blueGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 100}
                  strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                  className="transition-all duration-500 drop-shadow-lg"
                />
                <defs>
                  <linearGradient
                    id="blueGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Pulse effect when tracking */}
              {isTracking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-blue-500/20 pulse-ring backdrop-blur-sm" />
                </div>
              )}

              {/* Step count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <IonIcon
                  icon={footstepsOutline}
                  className="text-blue-400 text-3xl mb-2 drop-shadow-lg"
                />
                <span className="text-5xl font-bold text-white drop-shadow-lg">
                  {steps}
                </span>
                <span className="text-sm text-blue-200/80 mt-1">
                  / {dailyGoal} steps
                </span>
                <div className="mt-3 text-xs text-white/60">
                  {Math.round(progress)}% complete
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-600/30 to-blue-700/20 rounded-2xl p-4 text-center border border-blue-500/30 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
              <IonIcon
                icon={flameOutline}
                className="text-blue-300 text-2xl mb-2 inline-block"
              />
              <p className="text-2xl font-bold text-white">{calories}</p>
              <p className="text-xs text-blue-200/70 mt-1 font-medium">Calories</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-600/30 to-cyan-700/20 rounded-2xl p-4 text-center border border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/50 transition-colors">
              <IonIcon
                icon={trendingUpOutline}
                className="text-cyan-300 text-2xl mb-2 inline-block"
              />
              <p className="text-2xl font-bold text-white">{distance}</p>
              <p className="text-xs text-cyan-200/70 mt-1 font-medium">km</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-600/30 to-indigo-700/20 rounded-2xl p-4 text-center border border-indigo-500/30 backdrop-blur-sm hover:border-indigo-500/50 transition-colors">
              <IonIcon
                icon={timeOutline}
                className="text-indigo-300 text-2xl mb-2 inline-block"
              />
              <p className="text-2xl font-bold text-white">
                {formatDuration(duration)}
              </p>
              <p className="text-xs text-indigo-200/70 mt-1 font-medium">Time</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/15 text-red-300 text-sm p-4 rounded-2xl text-center border border-red-500/30 backdrop-blur-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Debug Info - Shows sensor data when tracking */}
          {isTracking && debugInfo && (
            <div className="bg-blue-600/20 text-blue-200 text-xs p-3 rounded-xl text-center font-mono border border-blue-500/30 backdrop-blur-sm">
              📊 {debugInfo}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            <button
              onClick={toggleTracking}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                isTracking
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-600/30"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-600/30"
              }`}
            >
              <IonIcon
                icon={isTracking ? pauseOutline : playOutline}
                className="text-xl"
              />
              {isTracking ? "Stop" : "Start"}
            </button>

            <button
              onClick={resetTracking}
              className="w-14 h-14 bg-slate-700/50 rounded-2xl flex items-center justify-center text-blue-300 hover:bg-slate-700 transition-all transform active:scale-95 border border-slate-600/50 backdrop-blur-sm"
              title="Reset all data"
            >
              <IonIcon icon={refreshOutline} className="text-xl" />
            </button>
          </div>

          {/* Tip */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-3 border border-blue-500/30 backdrop-blur-sm">
            <p className="text-center text-xs text-blue-200 font-medium">
              💡 Keep your phone in your pocket while walking for best accuracy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTrackerModal;
