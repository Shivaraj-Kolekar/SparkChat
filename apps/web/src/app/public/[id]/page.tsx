"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";
import Loader from "@/components/loader";
import { Message, MessageContent } from "@/components/ui/message";
import { ChatContainerRoot, ChatContainerContent } from "@/components/ui/chat-container";
import { toast } from "sonner";
import Sparkchat from "@/components/sparkchat";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicChatPage() {
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [notPublic, setNotPublic] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPublicChat = async () => {
      setLoading(true);
      setNotFound(false);
      setNotPublic(false);
      try {
        const response = await api.get(`/api/chat/${chatId}`);
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
          setChatTitle(response.data.title || "Public Chat");
          setLoading(false);
        } else if (response.data && response.data.error) {
          if (response.data.error.includes("not public")) {
            setNotPublic(true);
          } else {
            setNotFound(true);
          }
          setLoading(false);
        } else {
          setNotFound(true);
          setLoading(false);
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else if (err?.response?.status === 403) {
          setNotPublic(true);
        } else {
          toast.error("Failed to load chat");
        }
        setLoading(false);
      }
    };
    if (chatId) fetchPublicChat();
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader />
        <div className="mt-4 text-muted-foreground text-lg">Loading public chat...</div>
      </div>
    );
  }
  if (notFound) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-xl">Chat not found.</div>;
  }
  if (notPublic) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-xl">This chat is not public.</div>;
  }
  return (
    <main className="flex h-screen flex-col bg-background ">
      {/* Header */}
      <div className="flex h-13 flex-row">
        <div className="h-2 bg-background w-full"></div>
        <header className="bg-transparent opacity-100 z-10 justify-between flex h-auto py-2 my-2 w-full rounded-bl-lg shrink-0 items-center gap-2 px-4">
          <div className="flex flex-row gap-2 items-center">
            <Sparkchat />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <ModeToggle />
            <Link href="https://accounts.sparkchat.shivraj-kolekar.in/sign-in">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </header>
      </div>
      <hr />
      <div className="grid h-full max-w-(--breakpoint-md) grid-rows-[1fr_auto] w-full mx-auto ">
        <div className="space-y-4 pb-4">
          <ChatContainerRoot className="flex-1">
            <ChatContainerContent className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground mt-8">
                  <Loader />
                  <p className="text-xl">No messages yet.</p>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <Message
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        message.role === "user"
                          ? "bg-primary text-primary-foreground  rounded-lg mr-3 max-w-[75%] w-fit ml-auto"
                          : "bg-background text-foreground  rounded-lg max-w-[100%] w-fit mr-auto"
                      }
                    >
                      {message.role === "assistant" ? (
                        <div className="bg-transparent min-w-[95%] text-foreground prose rounded-lg p-2">
                          <MessageContent
                            className="prose dark:prose-invert max-w-none"
                            markdown={true}
                          >
                            {message.content}
                          </MessageContent>
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
                  </Message>
                ))
              )}
              <div ref={messagesEndRef} />
            </ChatContainerContent>
          </ChatContainerRoot>
        </div>
      </div>
    </main>
  );
}
