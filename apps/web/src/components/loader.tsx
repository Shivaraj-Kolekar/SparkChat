import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-4">
      <Loader2 className="animate-spin size-12" />
    </div>
  );
}
