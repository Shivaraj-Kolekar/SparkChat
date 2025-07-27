"use client";
import { api } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "../ui/sidebar";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import Loader from "../loader";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  LogInIcon,
  PanelLeftIcon,
  Plus,
  PlusIcon,
  Search,
  SearchIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Sparkchat from "../sparkchat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useChatStore } from "@/store/chatStore";
import { Badge } from "../ui/badge";

export function ChatSidebar() {
  const [showAdditionalButtons, setShowAdditionalButtons] = useState(false);
  const [animateSearch, setAnimateSearch] = useState(false);
  const [animatePlus, setAnimatePlus] = useState(false);
  const [isCmndDialogOpen, setIsCmndDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { user, isLoaded } = useUser();
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);
  // Fetch chats using React Query

  const clearSelectedChatId = useChatStore(
    (state) => state.clearSelectedChatId
  );

  const getchats = async () => {
    const res = await api.get("/api/chat", {
      withcredentials: true,
    });
    return res.data.result;
  };
  const {
    data: chatList = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: getchats,
  });

  useEffect(() => {
    console.log("SELECTED CHAT ID: ", selectedChatId);
  });
  // Sidebar animation logic
  const { toggleSidebar, state } = useSidebar();
  useEffect(() => {
    if (state === "collapsed") {
      setShowAdditionalButtons(true);
      const searchTimeout = setTimeout(() => setAnimateSearch(true), 50);
      const plusTimeout = setTimeout(() => setAnimatePlus(true), 200);
      return () => {
        clearTimeout(searchTimeout);
        clearTimeout(plusTimeout);
        setAnimateSearch(false);
        setAnimatePlus(false);
      };
    } else {
      setAnimateSearch(false);
      setAnimatePlus(false);
      const hideTimeout = setTimeout(() => {
        setShowAdditionalButtons(false);
        setIsCmndDialogOpen(false);
      }, 300);
      return () => clearTimeout(hideTimeout);
    }
  }, [state]);

  useHotkeys("ctrl+k", (event) => {
    event.preventDefault();
    setIsCmndDialogOpen(true);
  });

  // Create new chat
  const submit = async (title: string) => {
    try {
      if (!isLoaded) {
        toast.error("Please login first");
        return;
      }
      await api.post("/api/chat", { title });
      toast.success("New chat created");
      setTitle("");
      refetch();
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Error occurred in chat creation");
    }
  };

  // Delete chat
  const handleDeleteChat = async (id: string) => {
    try {
      await api.delete(`/api/chat/${id}`);
      toast.success("Chat Deleted");
      refetch();
    } catch (error) {
      console.error("Error loading chat messages:", error);
      toast.error("Error loading chat messages");
    }
  };

  return (
    <div className="h-40">
      <div>
        <CommandDialog
          open={isCmndDialogOpen}
          onOpenChange={setIsCmndDialogOpen}
        >
          <Command className="rounded-lg border shadow-md md:min-w-[450px]">
            <CommandInput placeholder="Search your chats" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Recent Chats">
                {Array.isArray(chatList) &&
                  chatList.map((chat: any) => (
                    <Link
                      key={chat.id}
                      href={`/chat/${chat.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChatId(chat.id);
                      }}
                    >
                      <CommandItem
                        key={chat.id}
                        onSelect={() => {
                          setIsCmndDialogOpen(false);
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
        <div>
          {state === "collapsed" ? (
            <div
              className={cn(
                "fixed top-2 left-4 z-50 flex flex-row gap-2 items-center justify-center bg-sidebar/80 rounded-lg px-2 py-1 border  shadow-lg"
              )}
            >
              {showAdditionalButtons && (
                <Button
                  data-sidebar="trigger"
                  data-slot="sidebar-trigger"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-6 rounded-md transition-all duration-300 ease-out",
                    animateSearch
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-full"
                  )}
                  onClick={toggleSidebar}
                >
                  <PanelLeftIcon />
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              )}
              {showAdditionalButtons && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-6 rounded-md transition-all duration-300 ease-out",
                    animateSearch
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-full"
                  )}
                  onClick={() => setIsCmndDialogOpen(true)}
                >
                  <Search />
                  <span className="sr-only">Search Sidebar Chats</span>
                </Button>
              )}
              {showAdditionalButtons && (
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-6 rounded-md transition-all duration-300 ease-out",
                      animateSearch
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-full"
                    )}
                  >
                    <Plus />
                    <span className="sr-only">Add Chat</span>
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Button
              data-sidebar="trigger"
              data-slot="sidebar-trigger"
              variant="ghost"
              size="icon"
              className={cn("size-7 mx-0")}
              onClick={(e) => {
                e.preventDefault();
                toggleSidebar();
              }}
            >
              <PanelLeftIcon />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
        </div>
      </div>
      <Sidebar>
        <SidebarHeader className="flex flex-col items-center  pb-2">
          <span className="inline-flex items-center">
            {/* <Button
              data-sidebar="trigger"
              data-slot="sidebar-trigger"
              variant="ghost"
              size="icon"
              className={cn("size-7 mx-0")}
              onClick={(e) => {
                e.preventDefault();
                toggleSidebar();
              }}
            >
              <PanelLeftIcon />
              <span className="sr-only">Toggle Sidebar</span>
            </Button> */}
            <div className="flex flex-row items-center  ">
              <Image
                className="rounded-sm "
                src="/sparkchat.png"
                alt="SparkChat"
                height={48}
                width={48}
              />
              <div className="text-lg font-base text-primary tracking-tight">
                <Sparkchat />
              </div>
            </div>
          </span>
          <div className="px-4 space-y-2 w-full">
                    

            <Button
              className="w-full"
              onClick={() => {
                clearSelectedChatId();
              }}
            >
              {" "}
              <Link
                className="flex w-full justify-between"
                // className="mb-4 bg-primary  justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none h-9 px-4 py-2 has-[>svg]:px-3 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs hover:bg-primary/90 flex w-full items-center gap-2"
                href="/"
              >
                
              
                  {/* <PlusIcon className="size-4" /> */}
                  <p>
                    New Chat
                    </p>
                <Badge variant={'secondary'}>CTRL + O</Badge>
              </Link>
            </Button>
            <Button
              className="w-full flex justify-between"
              onClick={() => {
                setIsCmndDialogOpen(true);
              }}
            >
            
              Search Chats
              <Badge variant={'secondary'}>CTRL + K</Badge>
            </Button>
          </div>
        </SidebarHeader>
        <hr className="my-2 border-accent dark:border-accent"></hr>
        <SidebarGroupContent className="pt-2 h-full overflow-y-scroll">
          <SidebarGroup className=" overflow-y-hidden">
            <h1 className="pl-4 text-base text-primary">Recent Chats</h1>
            {error ? (
              <SidebarMenu>
                <div className="h-40 flex items-center justify-center">
                  <p className="error">{(error as Error).message}</p>
                </div>
              </SidebarMenu>
            ) : chatList.length === 0 && isLoading ? (
              <SidebarMenu>
                <div className="h-40 flex flex-col items-center justify-center">
                  <Loader />
                  <span className="ml-2">Loading chats...</span>
                </div>
              </SidebarMenu>
            ) : (
              <SidebarMenu className="px-2 ">
                {Array.isArray(chatList) &&
                  chatList.map((chat: any) => (
                    <SidebarMenuButton
                      key={chat.id}
                      className="text-base my-0.5 px-2 py-3 relative group"
                      onClick={() => setSelectedChatId(chat.id)}
                      isActive={chat.id === selectedChatId}
                    >
                      <Link
                        href={`/chat/${chat.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChatId(chat.id);
                        }}
                        className="absolute inset-0 flex items-center pl-2 pr-10"
                      >
                        <div className="relative flex-grow min-w-0">
                          <span className="block whitespace-nowrap overflow-hidden text-ellipsis">
                            {chat.title}
                          </span>
                        </div>
                      </Link>
                      {/* Delete Button */}
                      <div
                        className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                          chat.id === selectedChatId ? "block" : ""
                        }`}
                      >
                        <Dialog>
                          <DialogTrigger>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Delete Chat</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Chat</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                              Are you sure you want to delete this chat ?
                            </DialogDescription>
                            <DialogFooter>
                              <DialogClose>Close</DialogClose>
                              <Button
                                variant={"destructive"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChat(chat.id);
                                  toast.success("Chat deleted");
                                }}
                              >
                                Delete Chat
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </SidebarMenuButton>
                  ))}
              </SidebarMenu>
            )}
          </SidebarGroup>
        </SidebarGroupContent>        <hr className="mt-2"></hr>

        <SidebarFooter className="justify-end">
          <div className="text-center bg-accent px-4 py-3 rounded-md">
            {isLoaded && user ? (
              <Link href="/settings">
                <h1>
                  {user.firstName} {user.lastName}
                </h1>
              </Link>
            ) : (
              <Link href="/login">
                <span className="flex items-center space-x-2">
                  <LogInIcon size={20} />
                  <h1 className="font-medium">Login</h1>
                </span>
              </Link>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
