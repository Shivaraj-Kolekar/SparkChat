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
    <div>
      <UserButton afterSignOutUrl="/login" />
      <span>{user?.fullName || user?.username}</span>
    </div>
  );
}
