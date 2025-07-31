import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

export type MessageProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

const Message = ({ children, className, ...props }: MessageProps) => (
  <div className={cn("flex gap-3", className)} {...props}>
    {children}
  </div>
);

export type MessageAvatarProps = {
  src: string;
  alt: string;
  fallback?: string;
  delayMs?: number;
  className?: string;
};

const MessageAvatar = ({
  src,
  alt,
  fallback,
  delayMs,
  className,
}: MessageAvatarProps) => {
  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)}>
      <AvatarImage src={src} alt={alt} />
      {fallback && (
        <AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>
      )}
    </Avatar>
  );
};

export type MessageContentProps = {
  children: React.ReactNode;
  markdown?: boolean;
  className?: string;
} & React.ComponentProps<typeof Markdown> &
  React.HTMLProps<HTMLDivElement>;

const MessageContent = ({
  children,
  markdown = false,
  className,
  ...props
}: MessageContentProps) => {
  const classNames = cn(
    // Base styles with message cards like messaginbg apps
    // "rounded-md p-4 text-foreground bg-muted/60 prose prose-sm sm:prose-base break-words whitespace-normal border border-border shadow-sm",
    // Base styles with ai chats apps look
    "rounded-md p-4 text-foreground  prose prose-sm sm:prose-base break-words whitespace-normal ",
    // Headings
    "prose-headings:font-bold prose-headings:text-primary prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-base prose-h6:text-base prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2",
    // Paragraphs
    "prose-p:my-3 prose-p:text-base prose-p:text-foreground prose-p:leading-relaxed",
    // Lists
    "prose-ul:pl-6 prose-ul:mb-4 prose-ol:pl-6 prose-ol:mb-4 prose-li:my-2 prose-li:text-foreground prose-li:leading-relaxed prose-li:ml-2",
    // Blockquotes
    "prose-blockquote:pl-4 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-accent prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:py-2",
    // Links
    "prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:transition-colors prose-a:duration-150 prose-a:font-medium prose-a:mx-1",
    // Inline code
    "prose-code:rounded-sm prose-code:bg-accent prose-code:px-1 prose-code:py-0.5 prose-code:text-primary prose-code:font-mono prose-code:text-sm prose-code:mx-1",
    className
  );

  return markdown ? (
    <Markdown className={classNames} {...props}>
      {children as string}
    </Markdown>
  ) : (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
};

export type MessageActionsProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

const MessageActions = ({
  children,
  className,
  ...props
}: MessageActionsProps) => (
  <div
    className={cn("text-muted-foreground flex items-center gap-2", className)}
    {...props}
  >
    {children}
  </div>
);

export type MessageActionProps = {
  className?: string;
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
} & React.ComponentProps<typeof Tooltip>;

const MessageAction = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: MessageActionProps) => {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={className}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageActions,
  MessageAction,
};
