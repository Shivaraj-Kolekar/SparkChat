"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <div>
      <div className="flex flex-row items-center justify-between pb-5 pt-2">
        <Link href="/">
          <Button>Back to Chat</Button>
        </Link>

        <div className="flex justify-center items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
