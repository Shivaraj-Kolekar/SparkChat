import React from "react";
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

type PublicLinkDialogProps = {
  id: string;
};

function Publiclinkdialog() {
  return (
    <div>
      <Dialog>
        <DialogTrigger className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive">
          <Share></Share>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Chat Link</DialogTitle>
          </DialogHeader>
          <span className="inline-flex items-center gap-2 ">
            <Input value={""}></Input>
            <Button>
              <Copy></Copy>
            </Button>
          </span>
          <span className="inline-flex items-center gap-2 ">
            <p>Make Chat Public </p>
            <Switch></Switch>
          </span>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Publiclinkdialog;
