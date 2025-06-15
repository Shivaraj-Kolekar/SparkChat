"use client";
import { useChat, type Message } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BrainIcon,
  Calculator,
  Calendar,
  Check,
  ChevronsUpDown,
  Copy,
  CreditCard,
  Globe,
  ListRestart,
  LogInIcon,
  PlusIcon,
  Search,
  Send,
  Settings,
  Settings2,
  Smile,
  User,
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
  CommandShortcut,
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
import { db } from "../../../server/src/db";
import { chats as chattable } from "../../../server/src/db/schema/auth";
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
import { useChatContext } from "@/contexts/ChatContext";
import Sparkchat from "@/components/sparkchat";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import HotkeyDemo from "@/components/HotkeyDemo";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandSeparator } from "cmdk";

// Define the props type
interface CommandboxProps {
  onClose: () => void; // Specify the type for onClose
}

const Commandbox: React.FC<CommandboxProps> = ({ onClose }) => {
  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Calculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

function ChatSidebar({
  onSelectChat,
  chats,
  loadingChats,
  errorChats,
  selectedChatId,
}: {
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (title: string) => void;
  chats: ChatType[];
  loadingChats: boolean;
  errorChats: string | null;
  selectedChatId: string | null;
}) {
  interface Chat {
    id: string;
    title: string;
    created_at: number;
  }

  const [chatList, setChatList] = useState<Chat[]>([]);
  const [title, setTitle] = useState("");

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success && Array.isArray(response.data.result)) {
        setChatList(response.data.result);
        console.log("Fetched chats:", response.data.result);
      } else {
        console.error("Invalid chat data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [chatList]);

  const { data: session } = authClient.useSession();

  const submit = async (title: string) => {
    try {
      if (!session) {
        toast.error("Please login first");
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`,
        {
          title,
        },
        {
          withCredentials: true,
        }
      );
      fetchChats(); // Refresh the chat list
      toast.success("New chat created");
      setTitle(""); // Clear the input
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Error occurred in chat creation");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-4">
        <div className="flex flex-row items-center  px-2">
          <Image
            className="rounded-sm "
            src="/sparkchat.png"
            alt="SparkChat"
            height={48}
            width={48}
          />{" "}
          <div className="text-lg font-base text-primary tracking-tight">
            <Sparkchat />
          </div>
        </div>
        <Button variant="ghost" className="size-8">
          <Search className="size-4" />
        </Button>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <div className="px-4">
          {/* <Dialog>
            <DialogTrigger className="mb-4 bg-primary  justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none h-9 px-4 py-2 has-[>svg]:px-3 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs hover:bg-primary/90 flex w-full items-center gap-2">
              <Link href="/">
                <PlusIcon className="size-4" />
                <span>New Chat</span>
              </Link>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Name the chat</DialogTitle>
              <Label>Chat title</Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="Enter chat title"
                type="text"
              ></Input>
              <DialogFooter>
                <DialogClose className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 has-[>svg]:px-3 dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-invalid:border-destructive">
                  Close
                </DialogClose>
                <Button onClick={() => submit(title)}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog> */}{" "}
          <Link
            className="mb-4 bg-primary  justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none h-9 px-4 py-2 has-[>svg]:px-3 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs hover:bg-primary/90 flex w-full items-center gap-2"
            href="/"
          >
            <PlusIcon className="size-4" />
            <span>New Chat</span>
          </Link>
        </div>
        <SidebarGroup className="h-full">
          <SidebarMenu className="px-2 ">
            {Array.isArray(chatList) &&
              chatList.map((chat) => (
                <SidebarMenuButton
                  key={chat.id}
                  className="text-base whitespace-nowrap  my-0.5 px-2 py-3 "
                  onClick={() => onSelectChat(chat.id)}
                  isActive={chat.id === selectedChatId}
                >
                  <Link href={`/chat/${chat.id}`}>
                    <span className="">{chat.title}</span>
                  </Link>
                </SidebarMenuButton>
              ))}{" "}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarFooter className="justify-end">
          <Link href={session ? "/settings" : "/login"}>
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
  setCurrentChatId,
  currentMessages,
  setCurrentMessages,
  modelValue,
  chats,
  router,
}: {
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  currentMessages: MessageType[];
  setCurrentMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  modelValue: string;
  chats: ChatType[];
  router: any; // Use the router type from useRouter
}) {
  const [selectedModel, setSelectedModel] = useState(""); // default model
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef("");
  const [isLoading, setIsLoading] = useState(false); // For streaming indicator
  const [chatTitle, setChatTitle] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [value, setValue] = useState("");
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
  // const { models, isLoading, error } = trpc.getOllamaModels.useQuery();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  const storeMessage = async (
    message: Message,
    currentChatId: string,
    retryCount = 0
  ) => {
    try {
      if (!currentChatId) {
        toast.error("No chat id found");
      }

      if (!session) {
        toast.error("Please login first");
        return;
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
      // Store the AI's response
      const stored = await storeMessage(message, chatId as string);
      if (!stored) {
        toast.error(
          "AI response was not saved. The chat history may be incomplete."
        );
      }
    },
  });

  // Wrap the handleSubmit to store user messages

  let chatId = currentChatId;
  const handleSubmit = async (e?: React.FormEvent) => {
    if (!session) {
      toast.error("Please login first");
      return;
    }
    const chatTitle = input.slice(0, 30) + (input.length > 30 ? "..." : "");
    setChatTitle(chatTitle);
    try {
      // If no chat is selected, create a new one with the message as title
      if (!chatId) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`,
          { title: chatTitle },
          { withCredentials: true }
        );

        if (!response.data.success) {
          throw new Error("Failed to create new chat");
        }

        // Get the new chat ID from the response
        const chatsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`,
          { withCredentials: true }
        );

        if (
          chatsResponse.data.success &&
          Array.isArray(chatsResponse.data.result)
        ) {
          // Find the newly created chat (it will be the most recent one)
          const newChat =
            chatsResponse.data.result[chatsResponse.data.result.length - 1];
          chatId = newChat.id;
          setCurrentChatId(chatId);
          router.push(`/chat/${chatId}`);
        } else {
          throw new Error("Failed to get new chat ID");
        }
      }

      // Store the user message with the new or existing chat ID
      const userMessage = {
        content: input,
        role: "user" as const,
        id: Date.now().toString(),
      };

      const stored = await storeMessage(userMessage, chatId as string);
      if (!stored) {
        toast.error("Failed to save your message");
        return;
      }
      originalHandleSubmit(e);
      // Now proceed with the original submit
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to process your message");
    }
  };
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
      <div className="grid  max-w-(--breakpoint-md) grid-rows-[1fr_auto] overflow-hidden w-full mx-auto p-4">
        <div className=" overflow-y-auto  space-y-4 pb-4">
          <ChatContainerRoot className="flex-1">
            <ChatContainerContent className="space-y-4 p-4">
              {messages.length === 0 ? (
                <div className="">
                  <div className="text-center text-muted-foreground mt-8">
                    Ask me anything to get started {session?.user.name}!
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
                          <Markdown>{message.content}</Markdown>
                          <MessageActions>
                            <MessageAction tooltip="Copy response">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {}}
                                className="rounded-full"
                              >
                                <Copy />
                              </Button>
                            </MessageAction>
                            <MessageAction tooltip="reload response">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  reload();
                                }}
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
        {/* <div className="relative flex w-full flex-col items-center justify-center space-y-2">
        <div className="absolute top-0 left-0 h-auto w-full">
          {showCategorySuggestions ? (
            <div className="flex w-full flex-col space-y-1">
              {activeCategoryData?.items.map((suggestion) => (
                <PromptSuggestion
                  key={suggestion}
                  highlight={activeCategoryData.highlight}
                  onClick={() => {
                    setInputValue(suggestion);
                    // Optional: auto-send
                    // handleSend()
                  }}
                >
                  {suggestion}
                </PromptSuggestion>
              ))}
            </div>
          ) : (
            <div className=" flex w-full flex-wrap items-stretch justify-start gap-2">
              {suggestionGroups.map((suggestion) => (
                <PromptSuggestion
                  key={suggestion.label}
                  onClick={() => {
                    setActiveCategory(suggestion.label);
                    setInputValue(""); // Clear input when selecting a category
                  }}
                  className="capitalize"
                >
                  <BrainIcon className="mr-2 h-4 w-4" />
                  {suggestion.label}
                </PromptSuggestion>
              ))}
            </div>
          )}
        </div>
      </div> */}
        <div className="p-1 max-w-(--breakpoint-md) rounded-xl bg-accent">
          <PromptInput
            value={input}
            onSubmit={handleSubmit}
            className="w-full max-w-(--breakpoint-md)"
          >
            <PromptInputTextarea
              onChange={handleInputChange}
              placeholder="Ask me anything..."
            />
            <PromptInputActions className="justify-between  pt-2">
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
                tooltip={isStreaming ? "Processing..." : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    handleSubmit();
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

function NewChatPage() {
  const [input, setInput] = useState("");
  const [isCommandBoxOpen, setIsCommandBoxOpen] = useState(true);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { refreshChats } = useChatContext();

  useHotkeys("ctrl+o", (event) => {
    event.preventDefault(); // Prevent default browser behavior
    router.replace("/");
    toast.success("CTRL+O pressed");
  });

  useHotkeys("ctrl+b", (event) => {
    const { toggleSidebar } = useSidebar();
    event.preventDefault(); // Prevent default browser behavior
    toggleSidebar();
    toast.success("CTRL+B pressed");
  });

  useHotkeys("ctrl+q", (event) => {
    event.preventDefault(); // Prevent default browser behavior
    setIsCommandBoxOpen(true); // Open the Commandbox
    toast.success("CTRL+K pressed! Opening command box...");
    toast.success(isCommandBoxOpen);
  });

  const closeCommandBox = () => {
    setIsCommandBoxOpen(false); // Close the Commandbox
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!session) {
      toast.error("Please login first");
      return;
    }

    try {
      // Create new chat with initial message
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`,
        {
          title: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
          initialMessage: input,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const newChatId = response.data.chatId;
        // Store both the initial prompt and chatId
        sessionStorage.setItem("initialPrompt", input);
        sessionStorage.setItem("newChatId", newChatId);
        // Refresh the chat list
        await refreshChats();
        // Redirect to the new chat
        router.push(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error("Failed to create new chat");
    }
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      {!isCommandBoxOpen && <Commandbox onClose={closeCommandBox} />}
      <div className="grid max-w-(--breakpoint-md) grid-rows-[1fr_auto] overflow-hidden w-full mx-auto p-4">
        <div className="overflow-y-auto space-y-4 pb-4">
          <ChatContainerRoot className="flex-1">
            <ChatContainerContent className="space-y-4 p-4">
              <div className="text-center text-muted-foreground mt-8">
                Start a new chat by typing your message below
              </div>
            </ChatContainerContent>
          </ChatContainerRoot>
        </div>
        <div className="p-1 max-w-(--breakpoint-md) rounded-xl bg-accent">
          <PromptInput
            value={input}
            onSubmit={handleSubmit}
            className="w-full max-w-(--breakpoint-md)"
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message to start a new chat..."
            />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction tooltip="Send message">
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSubmit}
                >
                  <ArrowUp className="size-5" />
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </main>
  );
}

function FullChatApp() {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorChats, setErrorChats] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  const [modelValue, setModelValue] = useState<string>("llama3.2"); // Default model
  const router = useRouter();

  // Fetch all chats when component mounts
  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success && Array.isArray(response.data.result)) {
        setChats(response.data.result);
        console.log("Fetched chats:", response.data.result);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setErrorChats("Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Handle chat selection
  const handleSelectChat = async (id: string) => {
    try {
      setCurrentChatId(id);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/${id}`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        // Transform the messages to match the Message type
        const transformedMessages = response.data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          chatId: msg.chatId,
          timestamp: msg.created_at,
        }));
        setCurrentMessages(transformedMessages);
        console.log("Loaded messages:", transformedMessages);
        router.push(`/chat/${id}`);
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

  return (
    <SidebarProvider>
      <ChatSidebar
        onSelectChat={handleSelectChat}
        onDeleteChat={() => {}}
        chats={chats}
        loadingChats={loadingChats}
        errorChats={errorChats}
        selectedChatId={currentChatId}
      />
      <SidebarInset>
        <AIPage
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          currentMessages={currentMessages}
          setCurrentMessages={setCurrentMessages}
          modelValue={modelValue}
          chats={chats}
          router={router}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default FullChatApp;
