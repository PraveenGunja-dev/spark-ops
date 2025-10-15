import { useTheme as useNextThemes } from "next-themes";
import { useEffect, useState } from "react";

export function useTheme() {
  const { theme, setTheme } = useNextThemes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return { 
    theme: mounted ? theme : "light", 
    toggleTheme,
    setTheme,
    mounted 
  };
}