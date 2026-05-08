import { createContext, useRef } from "react";

export const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const allowNavigation = useRef(false);

  return (
    <NavigationContext.Provider value={{ allowNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
};