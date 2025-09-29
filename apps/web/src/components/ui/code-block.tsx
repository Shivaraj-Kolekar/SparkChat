"use client";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/themeStore";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;
const themeBackgrounds: Record<string, string> = {
  "catppuccin-latte": "#eff1f5",
  "catppuccin-mocha": "#1f1e2f",
  // Add more themes as needed
};
function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const { baseTheme, mode, setBaseTheme, setMode } = useThemeStore();

  const currentTheme =(mode === "light" ? "catppuccin-latte" : "catppuccin-mocha");
const backgroundColor = themeBackgrounds[currentTheme] || "#fff";

  return (
    <div
      style={{backgroundColor}}
      className={cn(
        "not-prose flex my-4  flex-col overflow-clip border",
        "border max-w-[380px] md:max-w-[700px]  overflow-x-auto dark:bg-[#1f1e2f] bg-[#eff1f5] text-card-foreground rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  theme: propTheme,
  className,
  ...props
}: CodeBlockCodeProps) {
  const { theme } = useTheme();
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const { baseTheme, mode, setBaseTheme, setMode } = useThemeStore();

  const currentTheme =
    propTheme || (mode === "light" ? "catppuccin-latte" : "catppuccin-mocha");

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }

      const html = await codeToHtml(code, {
        lang: language,
        theme: currentTheme,
      });
      setHighlightedHtml(html);
    }
    highlight();
  }, [code, language, currentTheme]);

  const classNames = cn(
    "max-w-[380px] md:max-w-[700px] text-wrap overflow-x-auto text-[13px] [&>pre]:px-2 sm:[&>pre]:px-4 [&>pre]:py-3 sm:[&>pre]:py-4",
    className
  );

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  const { baseTheme, mode, setBaseTheme, setMode } = useThemeStore();

  const currentTheme =(mode === "light" ? "catppuccin-latte" : "catppuccin-mocha");
const backgroundColor = themeBackgrounds[currentTheme] || "#fff";

  return (
    <div
      style={{backgroundColor}}
      className={cn(
        "flex items-center max-w-[380px] md:max-w-[700px] dark:bg-[#1f1e2f] bg-[#eff1f5]  overflow-x-auto justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
