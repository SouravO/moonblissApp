import React, { createContext, useContext, useCallback, useRef } from "react";

const BackButtonContext = createContext();

export const BackButtonProvider = ({ children }) => {
  const backStackRef = useRef([]);

  const registerBackHandler = useCallback((handler) => {
    backStackRef.current.push(handler);

    return () => {
      backStackRef.current = backStackRef.current.filter((h) => h !== handler);
    };
  }, []);

  const handleBack = useCallback(() => {
    if (backStackRef.current.length > 0) {
      const lastHandler = backStackRef.current[backStackRef.current.length - 1];
      lastHandler();
      return true; // Back was handled
    }
    return false; // Back was not handled
  }, []);

  return (
    <BackButtonContext.Provider value={{ registerBackHandler, handleBack }}>
      {children}
    </BackButtonContext.Provider>
  );
};

export const useBackHandler = (handler) => {
  const context = useContext(BackButtonContext);

  if (!context) {
    throw new Error("useBackHandler must be used within BackButtonProvider");
  }

  React.useEffect(() => {
    return context.registerBackHandler(handler);
  }, [handler, context.registerBackHandler]);
};

export const useBackButtonContext = () => {
  const context = useContext(BackButtonContext);
  if (!context) {
    throw new Error(
      "useBackButtonContext must be used within BackButtonProvider"
    );
  }
  return context;
};
