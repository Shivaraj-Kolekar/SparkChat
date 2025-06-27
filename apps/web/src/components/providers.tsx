"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/utils/trpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemeStore } from "@/store/themeStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const { baseTheme, mode } = useThemeStore();

  useEffect(() => {
    // On mount, set the theme from Zustand to next-themes
    setTheme(`${baseTheme}-${mode}`);
  }, [baseTheme, mode, setTheme]);
  return (
    <ThemeProvider
      attribute="class"
      value={{
        "amethyst-light": "amethyst-light",
        "amethyst-dark": "amethyst-dark",
        "graphite-light": "graphite-light",
        "graphite-dark": "graphite-dark",
        "tangerine-light": "tangerine-light",
        "tangerine-dark": "tangerine-dark",
        "t3-light": "t3-light",
        "t3-dark": "t3-dark",
      }}
      // defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}
