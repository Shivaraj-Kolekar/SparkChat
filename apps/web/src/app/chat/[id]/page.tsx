"use client";
import { useChat, type Message } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BrainIcon,
  Check,
  ChevronsUpDown,
  Copy,
  Globe,
  ListRestart,
  LogInIcon,
  PlusIcon,
  Search,
  Send,
  Settings2,
} from "lucide-react";
import { useRef, useEffect } from "react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import { Markdown } from "@/components/ui/markdown";
import {
  Message as MessageComponent,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { suggestionGroups } from "@/components/suggestions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ChatType, MessageType } from "@/types/chat-types";
import UserMenu from "@/components/user-menu";
import Link from "next/link";
import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { ResponseStream } from "@/components/ui/response-stream";
import Sparkchat from "@/components/sparkchat";
import { ModeToggle } from "@/components/mode-toggle";
import Settings from "@/app/settings/page";
import Image from "next/image";
import { useHotkeys } from "react-hotkeys-hook";

function ChatSidebar({
  onSelectChat,
  selectedChatId,
}: {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}) {
  const { chats, loadingChats, errorChats } = useChatContext();
  const { data: session } = authClient.useSession();

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center gap-2 px-2">
          <Image src="/sparkchat.png" alt="SparkChat" height={60} width={60} />{" "}
          <div className="text-md font-base text-primary tracking-tight">
            <Sparkchat />
          </div>
        </div>
        <Button variant="ghost" className="size-8">
          <Search className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <div className="px-4">
          <Link
            className="mb-4 bg-primary justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none h-9 px-4 py-2 has-[>svg]:px-3 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs hover:bg-primary/90 flex w-full items-center gap-2"
            href="/"
          >
            <PlusIcon className="size-4" />
            <span>New Chat</span>
          </Link>
        </div>
        <SidebarGroup className="h-full">
          <SidebarMenu className="px-2">
            {Array.isArray(chats) &&
              chats.map((chat) => (
                <SidebarMenuButton
                  key={chat.id}
                  className="text-base whitespace-nowrap my-0.5  px-2 py-3"
                  onClick={() => onSelectChat(chat.id)}
                  isActive={chat.id === selectedChatId}
                >
                  <Link href={`/chat/${chat.id}`}>
                    <span className="">{chat.title}</span>
                  </Link>
                </SidebarMenuButton>
              ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarFooter className="justify-end">
          <Link href="/settings">
            <div className="text-center bg-accent px-4 py-3 rounded-md">
              {session ? (
                <h1>{session?.user.name}</h1>
              ) : (
                <span className="flex items-center space-x-2">
                  <LogInIcon size={20} />
                  <h1 className="font-medium">Login</h1>
                </span>
              )}
            </div>
          </Link>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

function AIPage({
  currentChatId,
  currentMessages,
  setCurrentMessages,
  modelValue,
  router,
  session,
}: {
  currentChatId: string | null;
  currentMessages: MessageType[];
  setCurrentMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  modelValue: string;
  router: any;
  session: any;
}) {
  const [selectedModel, setSelectedModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isInitialMessage, setIsInitialMessage] = useState(false);
  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/${chatId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        const transformedMessages = response.data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          chatId: msg.chatId,
          timestamp: msg.created_at,
        }));
        setCurrentMessages(transformedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  // Configure chat with current messages
  const {
    messages,
    reload,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
  } = useChat({
    api: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai`,
    initialMessages: currentMessages.map((msg) => ({
      ...msg,
      id: String(msg.id ?? ""),
    })),
    body: {
      model: selectedModel,
    },
    onFinish: async (message) => {
      const stored = await storeMessage(message, currentChatId as string);
      if (!stored) {
        toast.error(
          "AI response was not saved. The chat history may be incomplete."
        );
      }
      fetchMessages(currentChatId as string);
    },
  });

  // Handle initial prompt from new chat
  // useEffect(() => {
  //   const initialPrompt = sessionStorage.getItem("initialPrompt");
  //   const newChatId = sessionStorage.getItem("newChatId");

  //   if (initialPrompt && newChatId === currentChatId && !isInitialMessage) {
  //     setIsInitialMessage(true);

  //     // Clear the session storage
  //     sessionStorage.removeItem("initialPrompt");
  //     sessionStorage.removeItem("newChatId");

  //     // Set the input value to the initial prompt and submit it
  //     // This will trigger useChat to add the user message and AI response to its own state
  //     setTimeout(() => {
  //       // Create a mock event with a target.value property to match the expected input type
  //       handleInputChange({
  //         target: { value: initialPrompt },
  //       } as React.ChangeEvent<HTMLInputElement>);
  //       setTimeout(() => {
  //         originalHandleSubmit();
  //       }, 50);
  //     }, 50);
  //   }
  // }, [
  //   currentChatId,
  //   isInitialMessage,
  //   originalHandleSubmit,
  //   handleInputChange,
  //   originalHandleSubmit,
  // ]);

  // Add this effect to scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const handleSend = () => {
    if (inputValue.trim()) {
      console.log("Sending:", inputValue);
      setInputValue("");
      setActiveCategory("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptInputValueChange = (value: string) => {
    setInputValue(value);
    // Clear active category when typing something different
    if (value.trim() === "") {
      setActiveCategory("");
    }
  };

  // Get suggestions based on active category
  const activeCategoryData = suggestionGroups.find(
    (group) => group.label === activeCategory
  );

  // Determine which suggestions to show
  const showCategorySuggestions = activeCategory !== "";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storeMessage = async (
    message: Message,
    currentChatId: string,
    retryCount = 0
  ) => {
    try {
      if (!currentChatId) {
        toast.error("No chat id found");
        return false;
      }

      if (!session) {
        toast.error("Please login first");
        return false;
      }

      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/messages`,
        {
          message: {
            content: message.content,
            role: message.role,
          },
          chatId: currentChatId,
        },
        {
          withCredentials: true,
        }
      );

      if (!response.data.success) {
        throw new Error("Failed to store message");
      }

      // Update the current messages list
      setCurrentMessages((prev) => [
        ...prev,
        {
          ...message,
          chatId: currentChatId,
          id: typeof message.id === "string" ? Number(message.id) : message.id,
          timestamp: Date.now(),
        } as MessageType,
      ]);

      return true; // Indicate successful storage
    } catch (error) {
      console.error("Error storing message:", error);

      // Retry logic for failed requests (max 3 attempts)
      if (retryCount < 3) {
        console.log(`Retrying message storage attempt ${retryCount + 1}`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return storeMessage(message, currentChatId, retryCount + 1);
      }

      toast.error("Failed to save message after multiple attempts");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    }
  }, [currentChatId]);
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  const models = [
    {
      value: "gemini",
      label: "gemini 2.0 flash",
    },
    {
      value: "mistral-saba-24b",
      label: "Mistral saba",
    },
    {
      value: "ollama",
      label: "ollama llama3.2",
    },
  ];

  useEffect(() => {
    if (!currentChatId) return;
    let interval: NodeJS.Timeout | null = null;
    let attempts = 0;

    const poll = async () => {
      await fetchMessages(currentChatId);
      // Check if we have both user and assistant messages
      const hasAI = currentMessages.some((msg) => msg.role === "assistant");
      if (!hasAI && attempts < 10) {
        // try for up to ~10 seconds
        attempts++;
      } else {
        if (interval) clearInterval(interval);
      }
    };

    // Start polling every 1s
    interval = setInterval(poll, 1000);

    // Also do an immediate fetch
    poll();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentChatId]);

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="bg-background z-10 justify-between flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1"></SidebarTrigger>
        <div className="flex flex-row gap-2 items-center">
          <Link href="/settings">
            <Button variant={"outline"}>
              <Settings2></Settings2>
            </Button>
          </Link>
          <ModeToggle></ModeToggle>
        </div>
        {/* <div className="text-foreground">{currentChatId}</div> */}
      </header>
      <div className="grid max-w-(--breakpoint-md) grid-rows-[1fr_auto] overflow-hidden w-full mx-auto p-4">
        <div className="overflow-y-auto space-y-4 pb-4">
          <ChatContainerRoot className="flex-1">
            <ChatContainerContent className="space-y-4 p-4">
              {messages.length === 0 ? (
                <div className="">
                  <div className="text-center text-muted-foreground mt-8">
                    Ask me anything to get started {session?.user?.name}!
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageComponent
                    key={message.id}
                    className={
                      message.role === "user" ? "justify-end" : "justify-start"
                    }
                  >
                    <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
                      {message.role === "assistant" ? (
                        <div className="bg-transparent text-foreground prose rounded-lg p-2">
                          {/* <ResponseStream
                            textStream={message.content}
                            mode="typewriter"
                            speed={20}
                            className="prose-invert"
                          ></ResponseStream> */}
                          <Markdown>{message.content}</Markdown>
                          <MessageActions>
                            <MessageAction tooltip="Copy response">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    message.content
                                  );
                                  toast.success("Copied to clipboard");
                                }}
                                className="rounded-full"
                              >
                                <Copy />
                              </Button>
                            </MessageAction>
                            <MessageAction tooltip="reload response">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => reload()}
                                className="rounded-full"
                              >
                                <ListRestart />
                              </Button>
                            </MessageAction>
                          </MessageActions>
                        </div>
                      ) : (
                        <MessageContent className="bg-primary text-primary-foreground">
                          {message.content}
                        </MessageContent>
                      )}
                    </div>
                  </MessageComponent>
                ))
              )}
              <div ref={messagesEndRef} />
            </ChatContainerContent>
          </ChatContainerRoot>
        </div>
        <div className="p-1 max-w-(--breakpoint-md) rounded-xl bg-accent">
          <PromptInput
            value={input}
            onSubmit={originalHandleSubmit}
            className="w-full max-w-(--breakpoint-md)"
          >
            <PromptInputTextarea
              onChange={handleInputChange}
              placeholder="Ask me anything..."
            />
            <PromptInputActions className="justify-between pt-2">
              <div className="flex align-items-center gap-2">
                <PromptInputAction tooltip="Select model">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                      >
                        {value
                          ? models.find(
                              (framework) => framework.value === value
                            )?.label
                          : "Select framework..."}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search framework..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No framework found.</CommandEmpty>
                          <CommandGroup>
                            {models.map((model) => (
                              <CommandItem
                                key={model.value}
                                value={model.value}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );
                                  setOpen(false);
                                  setSelectedModel(currentValue);
                                }}
                              >
                                {model.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    value === model.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </PromptInputAction>
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
              </div>

              <PromptInputAction
                tooltip={isLoading ? "Processing..." : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    originalHandleSubmit();
                  }}
                >
                  {isLoading ? (
                    <Square className="size-5 fill-current" />
                  ) : (
                    <ArrowUp className="size-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </main>
  );
}
function FullChatApp({ params }: { params: { id: string } }) {
  const chatId = params.id;
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  const [modelValue, setModelValue] = useState<string>("llama3.2");
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Load messages for the current chat ID
  const loadChatMessages = async (id: string) => {
    try {
      setCurrentChatId(id);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        const transformedMessages = response.data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          chatId: msg.chatId,
          timestamp: msg.created_at,
        }));
        setCurrentMessages(transformedMessages);
      } else {
        toast.error("Failed to load chat messages");
        setCurrentMessages([]);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
      toast.error("Error loading chat messages");
      setCurrentMessages([]);
    }
  };

  useEffect(() => {
    loadChatMessages(chatId);
  }, [chatId]);

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    router.push(`/chat/${id}`);
  };

  useHotkeys("ctrl+o", (event) => {
    event.preventDefault(); //
    router.replace("/");
    toast.success("CTRL+O pressed");
  });
  useHotkeys("ctrl+b", (event) => {
    const { toggleSidebar } = useSidebar();
    event.preventDefault(); //
    toggleSidebar();
    toast.success("CTRL+B pressed");
  });

  return (
    <SidebarProvider>
      <ChatSidebar
        onSelectChat={handleSelectChat}
        selectedChatId={currentChatId}
      />
      <SidebarInset>
        <AIPage
          currentChatId={currentChatId}
          currentMessages={currentMessages}
          setCurrentMessages={setCurrentMessages}
          modelValue={modelValue}
          router={router}
          session={session}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default FullChatApp;
