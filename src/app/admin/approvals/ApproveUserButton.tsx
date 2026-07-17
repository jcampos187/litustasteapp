"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

interface ApproveUserButtonProps {
  userId: string;
  action: "approve" | "decline";
  clerkId: string;
}

export default function ApproveUserButton({ userId, action, clerkId }: ApproveUserButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, clerkId }),
      });

      if (!res.ok) throw new Error("Error");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  if (action === "approve") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-xl bg-lt-olive/10 px-4 py-2 text-sm font-medium text-lt-olive-dark transition-all hover:bg-lt-olive/20 disabled:opacity-50"
      >
        <CheckCircle className="h-4 w-4" />
        {isLoading ? "..." : "Aprobar"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
    >
      <XCircle className="h-4 w-4" />
      {isLoading ? "..." : "Rechazar"}
    </button>
  );
}
