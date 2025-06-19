import { UserButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserMenu() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <div className="border-2 dark:border-accent border-accent-foreground p-1 flex items-center rounded-full">
      <UserButton afterSignOutUrl="/login" />
      {/* <span>{user?.fullName || user?.username}</span> */}
    </div>
  );
}
