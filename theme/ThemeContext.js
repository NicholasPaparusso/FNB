import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import themes from "./theme";
import { useSharedValue, withTiming } from "react-native-reanimated";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const animatedPrimary = useSharedValue(themes.default.light.primary);
  const [theme, setTheme] = useState(themes.default.light);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("appTheme");
      const savedDarkMode = await AsyncStorage.getItem("darkMode");

      const darkModeEnabled = savedDarkMode === "true";
      setIsDarkMode(darkModeEnabled);

      if (savedTheme && themes[savedTheme]) {
        applyTheme(savedTheme, darkModeEnabled);
      } else {
        applyTheme("default", darkModeEnabled);
      }
    };
    loadTheme();
  }, []);

  const applyTheme = async (themeName, darkMode) => {
    if (themes[themeName]) {
      const mode = darkMode ? "dark" : "light";
      const newTheme = themes[themeName][mode];

      setTheme(newTheme);
      animatedPrimary.value = withTiming(newTheme.primary, { duration: 500 });

      await AsyncStorage.setItem("appTheme", themeName);
      await AsyncStorage.setItem("darkMode", darkMode.toString());
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    const currentTheme = await AsyncStorage.getItem("appTheme") || "default";
    applyTheme(currentTheme, newDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, animatedPrimary, changeTheme: applyTheme, toggleDarkMode, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
