"use client ";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Copy, Share } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useChatStore } from "@/store/chatStore";

// Accept chatId as prop
function Publiclinkdialog({ chatId }: { chatId: string }) {
  const selectedChatId = useChatStore((state) => state.selectedChatId);

  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/public/${chatId}`
      : "";

  // Fetch current public status on open
  const handleOpen = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/chat/${chatId}`);
      setIsPublic(res.data?.chat?.public === true);
    } catch {
      setIsPublic(false);
    } finally {
      setLoading(false);
    }
  };

  // Toggle public status
  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/api/chat/${chatId}`, { public: !isPublic });
      if (res.data.success) {
        setIsPublic(!isPublic);
        toast.success(
          !isPublic ? "Chat is now public!" : "Chat is now private."
        );
      } else {
        toast.error("Failed to update public status");
      }
    } catch {
      toast.error("Failed to update public status");
    } finally {
      setLoading(false);
    }
  };

  // Copy link
  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <Dialog onOpenChange={handleOpen}>
        <DialogTrigger
          className={` border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`}
        >
          <Share></Share>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Chat Link</DialogTitle>
          </DialogHeader>
          <span className="inline-flex items-center gap-2 ">
            <Input value={publicUrl} readOnly />
            <Button onClick={handleCopy} disabled={!isPublic || copied}>
              <Copy />
            </Button>
          </span>
          <span className="inline-flex items-center gap-2 ">
            <p>Make Chat Public </p>
            <Switch
              checked={isPublic}
              onCheckedChange={handleToggle}
              disabled={loading}
            />
          </span>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Publiclinkdialog;
