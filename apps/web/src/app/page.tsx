"use client";
import { useChat, type Message } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Brain,
  BrainIcon,
  Calculator,
  Calendar,
  Check,
  ChevronsUpDown,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Globe,
  Languages,
  ListRestart,
  LogInIcon,
  PanelLeftIcon,
  Plus,
  PlusIcon,
  Search,
  Send,
  Settings,
  Settings2,
  Smile,
  Text,
  User,
  X,
  Zap,
} from "lucide-react";
import { useRef, useEffect, type JSX } from "react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import {
  Command,
  CommandDialog,
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
  SidebarGroupAction,
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
  DialogOverlay,
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ChatSidebar({
  onSelectChat,
  onDeleteChat,
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
  const [showAdditionalButtons, setShowAdditionalButtons] = useState(false);
  const [animateSearch, setAnimateSearch] = useState(false);
  const [animatePlus, setAnimatePlus] = useState(false);
  const [isCmndDialogOpen, setIsCmndDialogOpen] = useState(false);
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
  }, []);

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
  const { toggleSidebar, state } = useSidebar();
  useEffect(() => {
    if (state === "collapsed") {
      // When closing the sidebar, prepare to show and animate buttons
      setShowAdditionalButtons(true); // Make them visible (opacity 0 initially)

      // Animate search button after a small delay
      const searchTimeout = setTimeout(() => {
        setAnimateSearch(true);
      }, 50); // Small delay for the search button to start animating

      // Animate plus button after another delay
      const plusTimeout = setTimeout(() => {
        setAnimatePlus(true);
      }, 200); // Delay for plus button to follow search

      return () => {
        clearTimeout(searchTimeout);
        clearTimeout(plusTimeout);
        // Reset states if sidebar opens before animation completes
        setAnimateSearch(false);
        setAnimatePlus(false);
      };
    } else {
      // When opening the sidebar, immediately hide and reset animation states
      setAnimateSearch(false);
      setAnimatePlus(false);
      // Give a tiny moment for the opacity/transform to reset before hiding the container
      const hideTimeout = setTimeout(() => {
        setShowAdditionalButtons(false);
        setIsCmndDialogOpen(false);
      }, 300); // Match this with your longest transition duration

      return () => clearTimeout(hideTimeout);
    }
  }, [state]);
  useHotkeys("ctrl+k", (event) => {
    event.preventDefault(); //
    setIsCmndDialogOpen(true);
    toast.success("CTRL+K pressed");
  });

  const buttonContainerWidthClass = state === "collapsed" ? "w-28" : "w-7"; // Adjust w-28 as needed for 3 buttons
  return (
    <div>
      <div>
        {" "}
        <CommandDialog
          open={isCmndDialogOpen}
          onOpenChange={setIsCmndDialogOpen}
        >
          {/* CommandDialog automatically includes a way to close itself usually */}
          <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            <CommandInput placeholder="Search your chats" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Recent Chats">
                {Array.isArray(chatList) &&
                  chatList.map((chat) => (
                    <Link
                      key={chat.id}
                      href={`/chat/${chat.id}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation for the button click
                        onSelectChat(chat.id); // Ensure chat selection happens
                      }}
                    >
                      <CommandItem
                        key={chat.id} // Use a unique ID for the key prop
                        onSelect={() => {
                          // Handle selection, e.g., navigate to chat or select it
                          console.log("Selected chat:", chat.title);
                          setIsCmndDialogOpen(false); // Close dialog on select
                        }}
                      >
                        {chat.title}
                      </CommandItem>
                    </Link>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        {state === "collapsed" ? (
          // When sidebar is closed, show all three buttons with animation
          <div
            className={cn(
              "bg-sidebar mt-4 mb-1 py-1 mx-2 px-1 rounded-sm flex items-center",
              "overflow-hidden", // Crucial for hiding content as it shrinks
              "transition-all duration-300 ease-out", // Animation for width
              buttonContainerWidthClass
            )}
          >
            {showAdditionalButtons && (
              <Button
                data-sidebar="trigger"
                data-slot="sidebar-trigger"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7 rounded-md",
                  "transition-all duration-300 ease-out", // Base transition
                  animateSearch
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full" // Animation classes
                )}
                onClick={toggleSidebar}
              >
                <PanelLeftIcon />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            )}

            {showAdditionalButtons && (
              <>
                {/* Search Button (now directly opens CommandDialog) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-7 rounded-md",
                    "transition-all duration-300 ease-out", // Base transition
                    animatePlus
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-full", // Animation classes
                    // Apply a margin-left to create space after the search button
                    "ml-2"
                  )}
                  onClick={() => setIsCmndDialogOpen(true)} // Toggle CommandDialog open state
                >
                  <Search />
                  <span className="sr-only">Search Sidebar Chats</span>
                </Button>
              </>
            )}

            {/* Plus Button */}
            {showAdditionalButtons && (
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-7 rounded-md",
                    "transition-all duration-300 ease-out", // Base transition
                    animatePlus
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-full", // Animation classes
                    // Apply a margin-left to create space after the search button
                    "ml-2"
                  )}
                >
                  <Plus />
                  <span className="sr-only">Add Chat</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          // When sidebar is open, show only the toggle button
          <div className="my-5 py-1 mx-2 rounded-sm">
            <Button
              data-sidebar="trigger"
              data-slot="sidebar-trigger"
              variant="ghost"
              size="icon"
              className={cn("size-7")}
              onClick={toggleSidebar}
            >
              <PanelLeftIcon />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
        )}
      </div>
      <Sidebar>
        <SidebarHeader className="flex flex-row items-center gap-2 py-2">
          {/* */}{" "}
          <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            variant="ghost"
            size="icon"
            className={cn("size-7 ")}
            onClick={(e) => {
              e.preventDefault();
              toggleSidebar();
            }}
          >
            <PanelLeftIcon />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <div className="flex flex-row items-center  ">
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
        </SidebarHeader>
        <SidebarContent className="pt-2">
          <div className="px-4">
            <Link
              className="mb-4 bg-primary  justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none h-9 px-4 py-2 has-[>svg]:px-3 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs hover:bg-primary/90 flex w-full items-center gap-2"
              href="/"
            >
              <PlusIcon className="size-4" />
              <span>New Chat</span>
            </Link>
          </div>
          <SidebarGroup className="h-full">
            <SidebarMenu className="px-2">
              {Array.isArray(chatList) &&
                chatList.map((chat) => (
                  <SidebarMenuButton
                    key={chat.id}
                    className="text-base my-0.5 px-2 py-3 relative group" // Add 'group' class here
                    onClick={() => onSelectChat(chat.id)}
                    isActive={chat.id === selectedChatId}
                  >
                    {/* Title Container with Blur Effect */}
                    <Link
                      href={`/chat/${chat.id}`}
                      // Prevent Link's default behavior from interfering with button click
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation for the button click
                        onSelectChat(chat.id); // Ensure chat selection happens
                      }}
                      className="absolute inset-0 flex items-center pr-10" // pr-10 to make space for the delete button
                      // This div wraps the span to apply the gradient and ensure overflow properties work
                    >
                      <div
                        className="relative flex-grow min-w-0" // min-w-0 to allow flex item to shrink
                      >
                        {/* <span
                        className="block whitespace-nowrap overflow-hidden pr-8" // pr-8 for gradient space
                        style={{
                          // Apply linear-gradient for the blur effect
                          // Make sure the background of the parent (Link) is set, e.g., white or matching your theme
                          maskImage:
                            "linear-gradient(to right, black 85%, transparent 100%)",
                          WebkitMaskImage:
                            "linear-gradient(to right, black 85%, transparent 100%)",
                        }}
                      >
                        {chat.title}
                      </span>
                      Optional: if you want a classic ellipsis, use this instead of maskImage */}
                        <span className="block whitespace-nowrap overflow-hidden text-ellipsis">
                          {chat.title}
                        </span>
                      </div>
                    </Link>

                    {/* Delete Button */}
                    <div
                      className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                        chat.id === selectedChatId ? "block" : "" // Keep delete button visible if active (optional)
                      }`}
                    >
                      <Button
                        variant="outline" // Use a ghost variant for a subtle look
                        size="icon" // Make it a small, icon-only button
                        className="h-8 w-8 text-gray-500 hover:text-red-500" // Adjust size and color
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent onSelectChat from firing
                          onDeleteChat(chat.id); // Call the actual delete function
                          toast.success("Chat deleted");
                        }}
                      >
                        <X className="h-4 w-4" /> {/* Adjust icon size */}
                        <span className="sr-only">Delete Chat</span>{" "}
                        {/* Accessibility text */}
                      </Button>
                    </div>
                  </SidebarMenuButton>
                ))}
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
    </div>
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
  const { refreshChats } = useChatContext();
  const [selectedModel, setSelectedModel] = useState(() => {
    const savedModel = localStorage.getItem("selectedModel");
    return savedModel || "gemini-2.0-flash"; // default model if none saved
  });
  useEffect(() => {
    localStorage.setItem("selectedModel", selectedModel);
  }, [selectedModel]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef("");
  const [isLoading, setIsLoading] = useState(false); // For streaming indicator
  const [chatTitle, setChatTitle] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [value, setValue] = useState("");
  const [remaining, setRemaining] = useState(10);
  const [rateLimitReset, setRateLimitReset] = useState("");
  const [promptDisabled, setPromptDisabled] = useState(false);

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
    currentChatId: string, // Changed from currentChatId to chatId (local scope)
    retryCount = 0
  ) => {
    try {
      if (!currentChatId) {
        // Check against the passed chatId
        toast.error("No chat id found for message storage.");
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
          chatId: currentChatId, // Use the passed chatId
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
          chatId: currentChatId, // Use the passed chatId
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
        return storeMessage(message, currentChatId, retryCount + 1); // Pass the correct chatId
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
    credentials: "include",
    initialMessages: currentMessages.map((msg) => ({
      ...msg,
      id: String(msg.id ?? ""),
    })),
    body: {
      model: selectedModel,
      searchEnabled: searchEnabled,
    },
    onFinish: async (message) => {
      fetchRemaining(); // Re-added fetchRemaining here
      // Store the AI's response
      const stored = await storeMessage(message, chatId as string); // Use currentChatId from state
      if (!stored) {
        toast.error(
          "AI response was not saved. The chat history may be incomplete."
        );
      }
    },
  });

  // Fetch remaining messages after each send
  const fetchRemaining = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setRemaining(data.remaining);
        setRateLimitReset(data.resetAt);
        if (data.remaining === 0) {
          setPromptDisabled(true);
          toast.error(
            "No more messages are available. Please wait until your quota resets."
          );
        } else {
          setPromptDisabled(false);
        }
      } else {
        console.error(
          "Failed to fetch remaining messages:",
          res.status,
          res.statusText
        );
      }
    } catch (e) {
      console.error("Error fetching remaining messages:", e);
    }
  };

  // Call fetchRemaining after each message is sent
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
        await refreshChats();
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
  useEffect(() => {
    fetchRemaining();
  }, []);

  interface UseCaseDetails {
    icon: JSX.Element; // Or React.ReactNode if it can be other things
    color: string; // Tailwind CSS classes will be strings
    tooltip: string; // tooltip content as strings
  }

  const models = [
    {
      label: "Llama 4 Scout",
      value: "meta-llama/llama-4-scout-17b-16e-instruct",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
      description:
        "Llama 4 Scout is a versatile multimodal model from Meta, capable of understanding and generating content from text and images. It excels in tasks requiring both visual and textual comprehension, and supports a wide range of languages, making it ideal for diverse global applications.",
      usecase: ["Vision", "Text", "Multilingual"],
    },

    {
      value: "llama3-8b-8192",
      label: "Llama 3",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
      description:
        "Llama 3 is a powerful text-based large language model by Meta. It is designed for generating high-quality text, engaging in natural conversations, and performing various language understanding tasks. Its multilingual capabilities make it suitable for global applications requiring sophisticated text processing.",
      usecase: ["Text", "Multilingual"],
    },
    {
      value: "llama-3.1-8b-instant",
      label: "Llama 3.1",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
      description:
        "Llama 3.1 is an advanced iteration of Meta's Llama series, primarily focused on refined text generation and improved multilingual support. It offers enhanced conversational abilities and is optimized for complex language tasks, providing more nuanced and contextually aware responses.",
      usecase: ["Text", "Multilingual"],
    },
    {
      value: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
      description:
        "Gemini 2.0 Flash is a high-performance multimodal model from Google. It excels in processing and understanding both text and visual information, including insights from PDFs, and integrates robust search capabilities for comprehensive data retrieval and analysis.",
      usecase: ["Text", "Vision", "PDFs", "Search"],
    },

    {
      value: "gemini-2.0-flash-lite",
      label: "Gemini 2.0 Flash Lite",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
      description:
        "Gemini 2.0 Flash Lite is a streamlined and faster version of Gemini 2.0 Flash. It's optimized for quick responses and efficient processing of text, images, and PDFs, making it perfect for applications where speed and responsiveness are critical.",
      usecase: ["Fast", "Text", "Vision", "PDFs"],
    },
    {
      value: "gemini-2.5-flash-preview-04-17",
      label: "Gemini 2.5 Flash",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
      description:
        "Gemini 2.5 Flash, a cutting-edge model from Google, offers advanced multimodal capabilities, seamlessly handling text, vision, and PDF content. It features enhanced search integration for superior information access and is designed for complex, data-rich applications.",
      usecase: ["Text", "Vision", "PDFs", "Search"],
    },
    {
      value: "qwen-qwq-32b",
      label: "Qwen QwQ",
      svg: {
        path: "M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z",
        title: "Qwen",
        viewbox: "0 0 24 24 ",
      },
      description:
        "Qwen QwQ is a robust language model known for its strong reasoning abilities and efficient text processing. Developed for tasks requiring logical deduction and coherent text generation, it's particularly effective in scenarios demanding analytical insights and structured outputs.",
      usecase: ["Text", "Reasoning"],
    },
  ];
  // Somewhere accessible in your project, e.g., in a separate config file or directly in your component file
  const useCaseConfig: { [key: string]: UseCaseDetails } = {
    Text: {
      icon: <Text size={4} />,
      tooltip: "Supports text generation",
      color: "bg-blue-200 text-blue-800 ", // Tailwind CSS classes
    },
    Vision: {
      icon: <Eye size={8}></Eye>,
      tooltip: "Supports image uploads and analysis",
      color: "bg-green-100 text-green-800",
    },
    Multilingual: {
      icon: <Languages size={8} />,
      tooltip: "Supports multiple languages",
      color: "bg-purple-100 text-purple-800",
    },
    PDFs: {
      icon: <FileText size={8} />,
      tooltip: "Supports PDFs upload and analysis",
      color: "bg-red-100 text-red-800",
    },
    Search: {
      icon: <Globe size={4} />,
      tooltip: "Supports Web Search to answer questions",
      color: "bg-yellow-100 text-yellow-800",
    },
    Fast: {
      icon: <Zap size={4} />,
      tooltip: "Very fast model",
      color: "bg-orange-100 text-orange-800",
    },
    Reasoning: {
      icon: <Brain size={4} />,
      tooltip: "Supports Reasoning capabilities",
      color: "bg-fuchsia-100  text-fuchsia-800 ",
    },
  };
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-13 flex-row">
        <div className="h-2 bg-background w-full"></div>
        <header className="bg-background z-10 justify-end flex h-auto py-2 my-2 w-fit -rounded-start-5 rounded-bl-lg  shrink-0 items-center gap-2 px-4">
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
      </div>
      <hr></hr>
      <div className="grid  max-w-(--breakpoint-md) grid-rows-[1fr_auto] overflow-hidden w-full mx-auto pb-4">
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
                        <MessageContent
                          markdown
                          className="bg-primary text-primary-foreground"
                        >
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
        <div className="p-1 flex flex-col justify-center align-items-center max-w-(--breakpoint-md) rounded-xl bg-accent">
          {remaining <= 5 && remaining > 0 && (
            <div className="text-yellow-600 text-center mb-2">
              {remaining} messages left before your daily limit.
            </div>
          )}
          {remaining === 0 && (
            <div className="text-red-600 text-center mb-2">
              You have reached your daily message limit. Please wait until your
              quota resets.
            </div>
          )}
          <PromptInput
            value={input}
            onSubmit={handleSubmit}
            className="w-full  max-w-(--breakpoint-md)"
          >
            <PromptInputTextarea
              onChange={handleInputChange}
              placeholder="Ask me anything..."
              //disabled={promptDisabled}
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
                          ? models.find((model) => model.value === value)?.label
                          : "Select Model"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px]  p-0">
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
                                className={cn(
                                  "ml-auto",
                                  "flex flex-row justify-between items-center",
                                  value === model.value
                                    ? "bg-accent"
                                    : "bg-none"
                                )}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );
                                  setOpen(false);
                                  setSelectedModel(currentValue);
                                }}
                              >
                                <div className="inline-flex gap-2 items-center">
                                  <svg
                                    className="size-4 text-color-heading"
                                    viewBox={model.svg.viewbox}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                  >
                                    <title>{model.svg?.title}</title>
                                    <path d={model.svg?.path}></path>
                                  </svg>
                                  <p className="text-base">{model.label}</p>{" "}
                                </div>
                                <div className="space-x-2 my-3 inline-flex">
                                  {model.usecase.map((usecase) => {
                                    const config = useCaseConfig[usecase];
                                    if (!config) return null; // Handle cases where a use case might not have a config

                                    return (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge
                                            key={usecase}
                                            className={`flex items-center rounded-sm p-1 gap-1 ${config.color}`}
                                          >
                                            {config.icon && (
                                              <span className="h-4 rounded-none w-4">
                                                {config.icon}
                                              </span>
                                            )}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent key={usecase}>
                                          {config.tooltip}
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })}
                                </div>
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
                    !session ? "Please login to use Web Search" : "Search Web"
                  }
                >
                  <Button
                    onClick={() => {
                      setSearchEnabled((prevSearchEnabled) => {
                        const newState = !prevSearchEnabled;
                        if (newState) {
                          toast.success("Web search enabled");
                        } else {
                          toast.info("Web search disabled");
                        }
                        return newState;
                      });
                    }}
                    variant={searchEnabled === true ? "default" : "outline"}
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
                  disabled={promptDisabled}
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

function FullChatApp() {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorChats, setErrorChats] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  const [modelValue, setModelValue] = useState<string>("llama3.2"); // Default model
  const router = useRouter();

  // No need to fetch chats directly; useChatContext provides the data

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
