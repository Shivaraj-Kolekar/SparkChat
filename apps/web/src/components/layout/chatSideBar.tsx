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
  Ellipsis,
  LogInIcon,
  PanelLeftIcon,
  Plus,
  PlusIcon,
  Search,
  SearchIcon,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Publiclinkdialog from "../public-link-dialog";

export function ChatSidebar() {
  const [showAdditionalButtons, setShowAdditionalButtons] = useState(false);
  const [animateSearch, setAnimateSearch] = useState(false);
  const [animatePlus, setAnimatePlus] = useState(false);
  const [isCmndDialogOpen, setIsCmndDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

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
        {/* <div>
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
        </div> */}
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
            <hr></hr>
          </span>

          <div className="px-4   space-y-2 w-full">
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
                <p>New Chat</p>
                <Badge variant={"secondary"}>CTRL + O</Badge>
              </Link>
            </Button>
            <Button
              className="w-full flex justify-between"
              onClick={() => {
                setIsCmndDialogOpen(true);
              }}
            >
              Search Chats
              <Badge variant={"secondary"}>CTRL + K</Badge>
            </Button>
          </div>
        </SidebarHeader>
        <hr className="my-2 "></hr>
        <SidebarGroupContent className="pt-2 h-full overflow-y-scroll">
          <SidebarGroup className=" overflow-y-hidden">
            {
              //   error ? (
              //   <SidebarMenu>
              //     <div className="h-40 flex items-center justify-center">
              //       <p className="error">{(error as Error).message}</p>
              //     </div>
              //   </SidebarMenu>
              // ) :
              !isLoaded || !user ? (
                <SidebarMenu>
                  <div className="h-40 px-4 flex flex-col items-center justify-center text-muted-foreground text-base">
                    <span>{"Please login to see your chats."}</span>
                  </div>
                </SidebarMenu>
              ) : chatList.length === 0 && !isLoading ? (
                <SidebarMenu>
                  <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-base">
                    <span>No chats created yet.</span>
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
                // Grouped and sorted chat sections
                (() => {
                  // Helper function for date comparison
                  function isToday(date: Date) {
                    const today = new Date();
                    return (
                      date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear()
                    );
                  }

                  function isLast30Days(date: Date) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return date > thirtyDaysAgo && !isToday(date);
                  }

                  function groupChats(chats: any[]) {
                    const now = new Date();
                    // Start of today in local time
                    const startOfToday = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate()
                    );
                    // 30 days ago from now
                    const startOf30DaysAgo = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() - 29
                    );

                    console.log("Time boundaries:", {
                      startOfToday: startOfToday.toISOString(),
                      startOf30DaysAgo: startOf30DaysAgo.toISOString(),
                    });

                    const todayChats: any[] = [];
                    const last30DaysChats: any[] = [];
                    const olderChats: any[] = [];

                    // Chats are already sorted by created_at desc from the API
                    chats.forEach((chat) => {
                      const created = new Date(chat.created_at);

                      if (isToday(created)) {
                        todayChats.push(chat);
                      } else if (isLast30Days(created)) {
                        last30DaysChats.push(chat);
                      } else {
                        olderChats.push(chat);
                      }
                    });

                    return {
                      todayChats,
                      last30DaysChats,
                      olderChats,
                    };
                  }

                  // Chats come sorted from API, just group them
                  const sortedChats = Array.isArray(chatList) ? chatList : [];

                  const { todayChats, last30DaysChats, olderChats } =
                    groupChats(sortedChats);

                  return (
                    <SidebarMenu className="px-2">
                      {/* Today Section */}
                      {todayChats.length > 0 && (
                        <>
                          <div className="pl-2 py-1 text-xs font-semibold text-gray-500">
                            Today
                          </div>
                          {todayChats.map((chat) => (
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
                                  {/*<span className="text-xs text-gray-400">
                                          {new Date(chat.created_at).toLocaleString()}
                                        </span>*/}
                                </div>
                              </Link>
                              {/* Delete Button */}
                              <div
                                className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                  chat.id === selectedChatId ? "block" : ""
                                }`}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <Ellipsis />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuLabel>
                                      Chat Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator></DropdownMenuSeparator>
                                    <DropdownMenuGroup>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setChatToDelete(chat.id);
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Chat
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                        }}
                                      >
                                        <Publiclinkdialog chatId={chat.id} />
                                      </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </SidebarMenuButton>
                          ))}{" "}
                          <hr></hr>
                        </>
                      )}

                      {/* Last 30 Days Section */}
                      {last30DaysChats.length > 0 && (
                        <>
                          <div className="pl-2 py-1 text-xs font-semibold text-gray-500">
                            Last 30 Days
                          </div>
                          {last30DaysChats.map((chat) => (
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
                                  {/*<span className="text-xs text-gray-400">
                                    {new Date(chat.created_at).toLocaleString()}
                                  </span>*/}
                                </div>
                              </Link>
                              {/* Delete Button */}
                              <div
                                className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                                  chat.id === selectedChatId ? "block" : ""
                                }`}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <Ellipsis />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuLabel>
                                      Chat Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuGroup>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setChatToDelete(chat.id);
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Chat
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                        }}
                                      >
                                        <Publiclinkdialog chatId={chat.id} />
                                      </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </SidebarMenuButton>
                          ))}
                          <hr></hr>
                        </>
                      )}

                      {/* Older Section */}
                      {olderChats.length > 0 && (
                        <>
                          <div className="pl-2 py-1 text-xs font-semibold text-gray-500">
                            Older
                          </div>
                          {olderChats.map((chat) => (
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
                                <DropdownMenu>
                                  <DropdownMenuTrigger>
                                    <Ellipsis />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuLabel>
                                      Chat Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuGroup>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setChatToDelete(chat.id);
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Chat
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onSelect={(e) => {
                                          e.preventDefault();
                                        }}
                                      >
                                        <Publiclinkdialog chatId={chat.id} />
                                      </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </SidebarMenuButton>
                          ))}
                        </>
                      )}
                    </SidebarMenu>
                  );
                })()
              )
            }
          </SidebarGroup>
        </SidebarGroupContent>{" "}
        <hr className="mt-2"></hr>
        <SidebarFooter className="justify-end">
          <div className="text-center bg-accent px-4 py-3 rounded-md">
            {isLoaded && user ? (
              <Link href="/settings">
                <h1>
                  {user.firstName} {user.lastName}
                </h1>
              </Link>
            ) : (
              <a
                href="https://accounts.sparkchat.shivraj-kolekar.in/sign-in"
                className="flex items-center space-x-2"
              >
                <LogInIcon size={20} />
                <h1 className="font-medium">Login</h1>
              </a>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Delete Chat Dialog - Outside of dropdown */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this chat? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                if (chatToDelete) {
                  handleDeleteChat(chatToDelete);
                  toast.success("Chat deleted");
                  setDeleteDialogOpen(false);
                  setChatToDelete(null);
                }
              }}
            >
              Delete Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
