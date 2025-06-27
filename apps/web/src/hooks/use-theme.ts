import { useState, useEffect } from "react";
type Theme = "amethyst" | "graphite" | "t3";
type Mode = "light" | "dark";

// Custom Hook for Theme and Mode Management
export const useThemeMode = () => {
  const [theme, setTheme] = useState<Theme>("amethyst");
  const [mode, setMode] = useState<Mode>("light");

  // Function to get current theme and mode
  const getCurrentThemeAndMode = (): [Theme, Mode] => [theme, mode];

  // Function to handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    // You can also store the theme in localStorage or cookies here
  };

  // Function to handle mode change
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    // You can also store the mode in localStorage or cookies here
  };

  // useEffect to load theme and mode from localStorage or cookies (optional)
  useEffect(() => {
    // Example:
    // const storedTheme = localStorage.getItem("theme") as Theme | null;
    // const storedMode = localStorage.getItem("mode") as Mode | null;
    // if (storedTheme) setTheme(storedTheme);
    // if (storedMode) setMode(storedMode);
  }, []);

  return {
    theme,
    mode,
    getCurrentThemeAndMode,
    handleThemeChange,
    handleModeChange,
  };
};
