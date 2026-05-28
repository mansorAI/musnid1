"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SubmitButtonProps = Readonly<{
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}>;

export function SubmitButton({ children, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(className, "disabled:cursor-not-allowed disabled:opacity-75")}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
