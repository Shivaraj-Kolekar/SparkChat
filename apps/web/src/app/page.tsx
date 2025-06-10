"use client";

import { useChat } from "@ai-sdk/react";
import { Input } from "@/components/ui/input";
import { Globe, Send } from "lucide-react";
import { useRef, useEffect } from "react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import { Markdown } from "@/components/ui/markdown";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { useState } from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
export default function AIPage() {
  const { messages, status, input, handleInputChange, handleSubmit } = useChat({
    api: `${process.env.NEXT_PUBLIC_SERVER_URL}/ai`,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectModel, setSelectModel] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef("");
  // const { models, isLoading, error } = trpc.getOllamaModels.useQuery();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="grid  max-w-(--breakpoint-md) grid-rows-[1fr_auto] overflow-hidden w-full mx-auto p-4">
      <div className=" overflow-y-auto  space-y-4 pb-4">
        <ChatContainerRoot className="flex-1">
          <ChatContainerContent className="space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-8">
                Ask me anything to get started {session?.user.name}!
              </div>
            ) : (
              messages.map((message) => (
                <Message
                  key={message.id}
                  className={
                    message.role === "user" ? "justify-end" : "justify-start"
                  }
                >
                  {/* {message.role === "assistant" && (
                    <MessageAvatar
                      src="/avatars/ai.png"
                      alt="AI Assistant"
                      fallback="AI"
                    />
                  )} */}
                  <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
                    {message.role === "assistant" ? (
                      <div className="bg-transparent text-foreground prose rounded-lg p-2">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    ) : (
                      <MessageContent className="bg-primary text-primary-foreground">
                        {message.content}
                      </MessageContent>
                    )}
                  </div>
                </Message>
              ))
            )}
            <div ref={messagesEndRef} />
          </ChatContainerContent>
        </ChatContainerRoot>
      </div>

      {/* <form
        onSubmit={handleSubmit}
        className="w-full flex items-center space-x-2 pt-2 border-t"
      >
        <Input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1"
          autoComplete="off"
          autoFocus
        />
        <Button type="submit" size="icon">
          <Send size={18} />
        </Button>
      </form> */}
      <div className="p-2 max-w-(--breakpoint-md) rounded-xl bg-accent">
        <PromptInput
          value={input}
          //isLoading={isLoading}
          onSubmit={handleSubmit}
          className="w-full drop-shadow-2xl max-w-(--breakpoint-md)"
        >
          <PromptInputTextarea
            onChange={handleInputChange}
            placeholder="Ask me anything..."
          />
          <PromptInputActions className="justify-end pt-2">
            <PromptInputAction
              tooltip={
                !session ? "Please login to use Search Web" : "Search Web"
              }
            >
              <Button
                onClick={() => {
                  setSearchEnabled(true);
                }}
                variant={"outline"}
              >
                <Globe></Globe>Search
              </Button>
            </PromptInputAction>
            <PromptInputAction tooltip="Select model">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button>Select model</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Google gemini</DropdownMenuItem>
                  <DropdownMenuItem>Ollama</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PromptInputAction>
            <PromptInputAction
              // tooltip={isLoading ? "Stop generation" : "Send message"}
              tooltip={"Send message"}
            >
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  handleSubmit();
                }}
              >
                {/* {isLoading ? (
                <Square className="size-5 fill-current" />
                ) : (
                  <ArrowUp className="size-5" />
                  )} */}
                <ArrowUp className="size-5" />
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
