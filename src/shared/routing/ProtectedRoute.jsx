import React from "react";
import { Route, Redirect } from "react-router-dom";
import { storageService } from "../infrastructure/storage/storageService.js";

/**
 * Protected Route Component
 * Validates user authentication and onboarding status
 * Redirects to appropriate page based on user state
 */
const ProtectedRoute = ({
  component: Component,
  requireOnboarding = true,
  ...rest
}) => {
  // Check user state
  const isLoggedIn = storageService.userProfileService.exists();
  const isOnboardingComplete = storageService.onboardingService.isComplete();

  return (
    <Route
      {...rest}
      render={(props) => {
        // Not logged in - redirect to login
        if (!isLoggedIn) {
          return <Redirect to="/login" />;
        }

        // Logged in but onboarding not complete - redirect to onboarding
        if (requireOnboarding && !isOnboardingComplete) {
          return <Redirect to="/onboarding" />;
        }

        // User authenticated and onboarded - render component
        return <Component {...props} />;
      }}
    />
  );
};

/**
 * Public Route Component
 * Routes that should redirect away if user is already logged in
 */
const PublicRoute = ({ component: Component, ...rest }) => {
  const isLoggedIn = storageService.userProfileService.exists();
  const isOnboardingComplete = storageService.onboardingService.isComplete();

  return (
    <Route
      {...rest}
      render={(props) => {
        // Already logged in and onboarded - redirect to home
        if (isLoggedIn && isOnboardingComplete) {
          return <Redirect to="/health" />;
        }

        // Render public component
        return <Component {...props} />;
      }}
    />
  );
};

export { ProtectedRoute, PublicRoute };
