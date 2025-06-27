"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import {
  Brain,
  ChevronsUpDown,
  Copy,
  Eye,
  FileText,
  Globe,
  Languages,
  ListRestart,
  LogInIcon,
  PanelLeftIcon,
  Plus,
  PlusIcon,
  RotateCcw,
  Search,
  Settings2,
  Text,
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
import { api, getClerkToken } from "@/lib/api-client";
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
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";

import { suggestionGroups } from "@/components/suggestions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import type { MessageType } from "@/types/chat-types";
import Link from "next/link";
import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ui/reasoning";
import Sparkchat from "@/components/sparkchat";
import { ModeToggle } from "@/components/mode-toggle";

import Image from "next/image";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandDialog } from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/loader";
import { ResponseStream } from "@/components/ui/response-stream";
import Publiclinkdialog from "@/components/public-link-dialog";
import { ChatSidebar } from "@/components/layout/chatSideBar";
import { useChatStore } from "@/store/chatStore";
import { useModelStore } from "@/store/modelStore";

function AIPage({
  // currentChatId,
  // setCurrentChatId,
  currentMessages,
  setCurrentMessages,
  modelValue,
  router,
}: {
  // currentChatId: string | null;
  // setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  currentMessages: MessageType[];
  setCurrentMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  modelValue: string;
  router: any;
}) {
  const { user, isLoaded } = useUser();
  const selectedModel = useModelStore((state) => state.selectedModel);
  const setSelectedModel = useModelStore((state) => state.setSelectedModel);
  const params = useParams();
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);
  const selectedChatId = useChatStore((state) => state.selectedChatId);

  useEffect(() => {
    if (params?.id) {
      const chatId = Array.isArray(params.id) ? params.id[0] : params.id;
      setSelectedChatId(chatId);
      // Optionally: fetch messages for this chat
    }
  }, [params?.id]);
  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== "undefined") {
      const savedModel = localStorage.getItem("selectedModel");
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);

  // useEffect(() => {
  //   // Only save to localStorage in the browser
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("selectedModel", selectedModel);
  //   }
  // }, [selectedModel]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isInitialMessage, setIsInitialMessage] = useState(false);
  const [pendingAssistantMessageId, setPendingAssistantMessageId] = useState<
    string | null
  >(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const fetchMessages = async (chatId: string) => {
    try {
      const response = await api.get(`/api/chat/${chatId}`);
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

  const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = await getClerkToken();
    const headers = new Headers(init?.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  // Add this near the top of AIPage, after state declarations
  const chatIdRef = useRef<string | null>(selectedChatId);
  useEffect(() => {
    chatIdRef.current = selectedChatId;
  }, [selectedChatId]);

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
    fetch: customFetch,
    initialMessages: currentMessages.map((msg) => ({
      ...msg,
      id: String(msg.id ?? ""),
    })),
    body: {
      model: selectedModel,
      searchEnabled: searchEnabled,
    },
    onFinish: async (message) => {
      // Store the AI's response using the latest chatId
      const latestChatId = chatIdRef.current;
      if (pendingAssistantMessageId) {
        message.id = pendingAssistantMessageId;
      }
      const stored = await storeMessage(
        message,
        selectedModel as string,
        latestChatId as string
      );
      setAiLoading(false);
      setPendingAssistantMessageId(null);
      if (!stored) {
        toast.error(
          "AI response was not saved. The chat history may be incomplete."
        );
      }
      fetchMessages(latestChatId as string);
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
    model: string,
    retryCount = 0
  ) => {
    try {
      if (!selectedChatId) {
        toast.error("No chat id found");
        return false;
      }

      if (!user) {
        toast.error("Please login first");
        return false;
      }

      setIsLoading(true);
      const response = await api.post("/api/messages", {
        message: {
          content: message.content,
          role: message.role,
        },
        model: selectedModel,
        chatId: selectedChatId,
      });

      if (!response.data.success) {
        throw new Error("Failed to store message");
      }

      // Update the current messages list
      setCurrentMessages((prev) => [
        ...prev,
        {
          ...message,
          chatId: selectedChatId,
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
        if (selectedChatId) {
          return storeMessage(
            message,
            selectedChatId,
            selectedModel as string,
            retryCount + 1
          ); // Pass the correct chatId
        } else {
          toast.error("No chat id found for message storage.");
          return false;
        }
      }

      toast.error("Failed to save message after multiple attempts");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId]);
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);
  interface UseCaseDetails {
    icon: JSX.Element; // Or React.ReactNode if it can be other things
    color: string; // Tailwind CSS classes will be strings
    tooltip: string; // tooltip content as strings
  }
  const WebSearchModels = [
    "gemini-2.0-flash",
    "gemini-2.5-flash-preview-04-17",
    "gemini-2.0-flash-lite",
  ];
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

  useEffect(() => {
    if (!selectedChatId) return;
    let interval: NodeJS.Timeout | null = null;
    let attempts = 0;

    const poll = async () => {
      await fetchMessages(selectedChatId);
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
  }, [selectedChatId]);

  const [remaining, setRemaining] = useState(10);
  const [rateLimitReset, setRateLimitReset] = useState("");
  const [promptDisabled, setPromptDisabled] = useState(false);

  // Fetch remaining messages after each send
  const fetchRemaining = async () => {
    try {
      const token = await getClerkToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai`, {
        method: "GET",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
      }
    } catch {}
  };

  // Call fetchRemaining after each message is sent
  const handleSubmit = async (e?: React.FormEvent) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (!selectedChatId) {
      // New chat flow
      const chatTitle = input.slice(0, 30) + (input.length > 30 ? "..." : "");
      const response = await api.post("/api/chat", { title: chatTitle });
      if (!response.data.success) {
        toast.error("Failed to create new chat");
        return;
      }
      const chatsResponse = await api.get("/api/chat");
      if (
        chatsResponse.data.success &&
        Array.isArray(chatsResponse.data.result)
      ) {
        // Sort chats by created_at descending to get the latest chat
        const sortedChats = [...chatsResponse.data.result].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const newChat = sortedChats[0];
        setSelectedChatId(newChat.id);
        router.push(`/chat/${newChat.id}`);
        setPendingMessage(input); // Store the message to send after navigation
      } else {
        toast.error("Failed to get new chat ID");
      }
      return; // Do not submit message yet!
    }

    // Existing chat flow
    await actuallySendMessage(input, selectedChatId, e);
  };

  // useEffect to watch for chatId and pendingMessage
  useEffect(() => {
    if (selectedChatId && pendingMessage) {
      actuallySendMessage(pendingMessage, selectedChatId);
      setPendingMessage(null);
    }
  }, [selectedChatId, pendingMessage]);
  const { state } = useSidebar(); // or your sidebar state

  // The actuallySendMessage function
  const actuallySendMessage = async (
    messageText: string,
    chatId: string,
    e?: React.FormEvent
  ) => {
    const userMessage = {
      content: messageText,
      role: "user" as const,
      id: Date.now().toString(),
    };
    const assistantMessageId = (Date.now() + 1).toString();
    setPendingAssistantMessageId(assistantMessageId);
    setAiLoading(true);
    const stored = await storeMessage(
      userMessage,
      selectedModel as string,
      chatId
    );
    if (!stored) {
      toast.error("Failed to save your message");
      setAiLoading(false);
      setPendingAssistantMessageId(null);
      return;
    }
    await originalHandleSubmit(e);
    await fetchRemaining();
  };

  return (
    <main className="flex h-screen flex-col bg-background overflow-hidden">
      <div className="flex h-13 flex-row">
        <div className="h-2 bg-background w-full"></div>
        <header className="bg-transparent opacity-100 z-10 justify-end flex h-auto py-2 my-2 w-fit rounded-bl-lg shrink-0 items-center gap-2 px-4">
          <div className="flex flex-row gap-2 items-center">
            <Tooltip>
              <TooltipTrigger>
                <Publiclinkdialog />
              </TooltipTrigger>
              <TooltipContent>Share Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Link href="/settings">
                  <Button variant={"outline"}>
                    <Settings2></Settings2>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <ModeToggle></ModeToggle>
              </TooltipTrigger>
              <TooltipContent>Change Mode</TooltipContent>
            </Tooltip>
          </div>
        </header>
      </div>
      <hr></hr>
      <div className="grid h-full max-w-(--breakpoint-md) grid-rows-[1fr_auto] overflow-hidden w-full mx-auto ">
        {" "}
        <div className="overflow-y-auto  space-y-4 pb-4">
          <ChatContainerRoot className="flex-1">
            <ChatContainerContent className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="">
                  <div className="text-center text-muted-foreground mt-8">
                    <Loader></Loader>
                    <p className="text-xl">Loading Messages</p>
                  </div>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <MessageComponent
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "justify-end mr-3"
                        : "justify-start"
                    }
                  >
                    <div
                      className={
                        message.role === "assistant"
                          ? "min-w-[95%] flex-1 sm:max-w-[75%]  mr-auto"
                          : " flex-1 min-w-[25%] w-auto max-w-[50%] ml-auto"
                      }
                    >
                      {message.role === "assistant" ? (
                        <div className="bg-transparent min-w-[95%] text-foreground prose rounded-lg p-2">
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
                                  markdown={true}
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
                                <RotateCcw />
                              </Button>
                            </MessageAction>
                            {/* <MessageContent>{value}</MessageContent> */}
                          </MessageActions>
                        </div>
                      ) : (
                        <MessageContent
                          markdown
                          className="bg-primary min-w-[50%]  text-primary-foreground"
                        >
                          {message.content}
                        </MessageContent>
                      )}
                    </div>
                  </MessageComponent>
                ))
              )}
              {/* Show loader as a pending assistant message if aiLoading is true and last message is not assistant */}
              {aiLoading &&
                (!messages.length ||
                  messages[messages.length - 1].role !== "assistant") && (
                  <MessageComponent className="justify-start">
                    <Loader />
                  </MessageComponent>
                )}
              <div ref={messagesEndRef} />
            </ChatContainerContent>
          </ChatContainerRoot>
        </div>
        {/* promtp window */}
        <div
          className={cn(
            "sticky bottom-0 left-0 w-full z-50 bg-background  pt-3 px-2 transition-all duration-200"
          )}
        >
          <div className="w-full max-w-[800px] mx-auto">
            <div className="p-1 max-w-(--breakpoint-md) rounded-xl bg-accent">
              {remaining <= 5 && remaining > 0 && (
                <div className="text-yellow-600 text-center mb-2">
                  {remaining} messages left before your daily limit is reached.
                </div>
              )}
              {remaining === 0 && (
                <div className="text-red-600 text-center mb-2">
                  You have reached your daily message limit. Please wait until
                  your quota resets.
                </div>
              )}
              <PromptInput
                value={input}
                onSubmit={handleSubmit}
                className="w-full max-w-(--breakpoint-md)"
              >
                <PromptInputTextarea
                  onChange={handleInputChange}
                  placeholder="Ask me anything..."
                  disabled={promptDisabled}
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
                              ? models.find((model) => model.value === value)
                                  ?.label
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
                                        currentValue === value
                                          ? ""
                                          : currentValue
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
                                    <div className="space-x-2 my-1.5 inline-flex">
                                      {model.usecase.map((usecase) => {
                                        const config = useCaseConfig[usecase];
                                        if (!config) return null;
                                        return (
                                          <Tooltip key={usecase}>
                                            <TooltipTrigger>
                                              <Badge
                                                className={`flex items-center rounded-sm p-1 gap-1 ${config.color}`}
                                              >
                                                {config.icon && (
                                                  <span className="h-4 rounded-none w-4">
                                                    {config.icon}
                                                  </span>
                                                )}
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
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
                        !user ? "Please login to use Search Web" : "Search Web"
                      }
                    >
                      {selectedModel
                        ? WebSearchModels.includes(selectedModel) && (
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
                                searchEnabled === true ? "default" : "secondary"
                              }
                            >
                              <Globe></Globe>Search
                            </Button>
                          )
                        : ""}
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
                        if (!promptDisabled) handleSubmit();
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
        </div>
      </div>
    </main>
  );
}
function FullChatApp({ params }: { params: Promise<{ id: string }> }) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  const [modelValue, setModelValue] = useState<string>("llama3.2");
  const router = useRouter();
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);

  // Load messages for the current chat ID
  const loadChatMessages = async (id: string) => {
    try {
      setSelectedChatId(id);
      const response = await api.get(`/api/chat/${id}`);
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

  // Handle params as Promise
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setChatId(id);
      await loadChatMessages(id);
    };
    getParams();
  }, [params]);

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    router.push(`/chat/${id}`);
  };

  useHotkeys("ctrl+shift+o", (event) => {
    event.preventDefault(); //
    router.replace("/");
    // toast.success("CTRL+O pressed");
  });
  useHotkeys("ctrl+b", (event) => {
    const { toggleSidebar } = useSidebar();
    event.preventDefault(); //
    toggleSidebar();
    // toast.success("CTRL+B pressed");
  });

  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <AIPage
          // currentChatId={currentChatId}
          // setCurrentChatId={setCurrentChatId}
          currentMessages={currentMessages}
          setCurrentMessages={setCurrentMessages}
          modelValue={modelValue}
          router={router}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default FullChatApp;
