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
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ui/reasoning";
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
        <div className="flex flex-row items-center px-2">
          <Image src="/sparkchat.png" alt="SparkChat" height={48} width={48} />{" "}
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
  const [selectedModel, setSelectedModel] = useState(() => {
    const savedModel = localStorage.getItem("selectedModel");
    return savedModel || "gemini-2.0-flash"; // default model if none saved
  });

  useEffect(() => {
    localStorage.setItem("selectedModel", selectedModel);
  }, [selectedModel]);
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
  const [searchEnabled, setSearchEnabled] = useState(false);

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
      searchEnabled: searchEnabled,
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
      label: "Llama 4 Scout",
      value: "meta-llama/llama-4-scout-17b-16e-instruct",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
    },

    {
      value: "llama3-8b-8192",
      label: "Llama 3",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
    },
    {
      value: "llama-3.1-8b-instant",
      label: "Llama 3.1",
      svg: {
        path: "M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z",
        title: "Meta",
        viewbox: "0 0 256 171 ",
      },
    },
    {
      value: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
    },

    {
      value: "gemini-2.0-flash-lite",
      label: "Gemini 2.0 Flash Lite",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
    },
    {
      value: "gemini-2.5-flash-preview-04-17",
      label: "Gemini 2.5 Flash",
      svg: {
        path: "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z",
        title: "Gemini",
        viewbox: "0 0 16 16",
      },
    },
    {
      value: "qwen-qwq-32b",
      label: "Qwen QwQ",
      svg: {
        path: "M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z",
        title: "Qwen",
        viewbox: "0 0 24 24 ",
      },
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
      if (!hasAI && attempts < 3) {
        // Reduced attempts to limit API calls
        attempts++;
      } else {
        if (interval) clearInterval(interval);
      }
    };

    // Start polling with a longer interval to reduce API calls
    interval = setInterval(poll, 3000);

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
                          {(() => {
                            const thinkMatch = message.content.match(
                              /<think>([\s\S]*?)<\/think>/
                            );
                            const thinkingContent = thinkMatch
                              ? thinkMatch[1].trim()
                              : "";
                            const displayContent = thinkingContent
                              ? message.content
                                  .replace(/<think>[\s\S]*?<\/think>/, "")
                                  .trim()
                              : message.content;
                            return (
                              <>
                                {thinkingContent && (
                                  <Reasoning isStreaming={false}>
                                    <ReasoningTrigger>
                                      Thinking Process
                                    </ReasoningTrigger>
                                    <ReasoningContent markdown={true}>
                                      {thinkingContent}
                                    </ReasoningContent>
                                  </Reasoning>
                                )}
                                <MessageContent
                                  className="prose dark:prose-invert max-w-none"
                                  markdown
                                >
                                  {displayContent}
                                </MessageContent>
                              </>
                            );
                          })()}
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
        <div className="p-1 max-w-(--breakpoint-md) rounded-xl bg-accent">
          <PromptInput
            value={input}
            onSubmit={() => {
              if (input.trim()) {
                const userMessage = {
                  id: Date.now().toString(),
                  content: input,
                  role: "user" as const,
                };
                storeMessage(userMessage, currentChatId as string).then(
                  (stored) => {
                    if (stored) {
                      originalHandleSubmit();
                    } else {
                      toast.error("Failed to save your message");
                    }
                  }
                );
              }
            }}
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
                          ? models.find((model) => model.value === value)?.label
                          : "Select model"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px]  p-0">
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
                                <svg
                                  className="size-4 text-color-heading"
                                  viewBox={model.svg.viewbox}
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="currentColor"
                                >
                                  <title>{model.svg?.title}</title>
                                  <path d={model.svg?.path}></path>
                                </svg>
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
                    variant={
                      searchEnabled === true ? "destructive" : "secondary"
                    }
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
                    if (input.trim()) {
                      const userMessage = {
                        id: Date.now().toString(),
                        content: input,
                        role: "user" as const,
                      };
                      storeMessage(userMessage, currentChatId as string).then(
                        (stored) => {
                          if (stored) {
                            originalHandleSubmit();
                          } else {
                            toast.error("Failed to save your message");
                          }
                        }
                      );
                    }
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
