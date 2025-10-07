"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/store/themeStore";
import { Tooltip,TooltipContent,TooltipTrigger } from "./ui/tooltip";
export function ModeToggle() {
  const { setTheme, systemTheme } = useTheme();

  const { baseTheme, mode, setBaseTheme, setMode } = useThemeStore();

  React.useEffect(() => {
    setTheme(`${baseTheme}-${mode}`);
  }, [baseTheme, mode, setTheme]);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
        >
          {mode === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Theme Switcher</TooltipContent>
    </Tooltip>
  );
}
