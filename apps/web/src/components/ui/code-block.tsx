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

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex my-4 w-full flex-col overflow-clip border",
        "border-border max-w-full sm:max-w-[90vw] md:max-w-[800px] overflow-x-auto bg-card text-card-foreground rounded-xl",
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
    propTheme || (mode === "light" ? "github-light" : "github-dark");

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
    "max-w-full sm:max-w-[90vw] md:max-w-[800px] overflow-x-auto text-[13px] [&>pre]:px-2 sm:[&>pre]:px-4 [&>pre]:py-3 sm:[&>pre]:py-4",
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
  return (
    <div
      className={cn("flex items-center max-w-full sm:max-w-[90vw] md:max-w-[800px] overflow-x-auto justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
