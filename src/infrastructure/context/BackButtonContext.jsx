import React, { createContext, useContext, useCallback, useState } from "react";

const BackButtonContext = createContext();

export const BackButtonProvider = ({ children }) => {
  const [backStack, setBackStack] = useState([]);

  const registerBackHandler = useCallback((handler) => {
    setBackStack((prev) => [...prev, handler]);

    return () => {
      setBackStack((prev) => prev.filter((h) => h !== handler));
    };
  }, []);

  const handleBack = useCallback(() => {
    if (backStack.length > 0) {
      const lastHandler = backStack[backStack.length - 1];
      lastHandler();
      return true; // Back was handled
    }
    return false; // Back was not handled
  }, [backStack]);

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
  }, [handler, context]);
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
