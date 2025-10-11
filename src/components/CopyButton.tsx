"use client";

import { useState, type FC } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends ButtonProps {
  textToCopy: string;
}

const CopyButton: FC<CopyButtonProps> = ({
  textToCopy,
  className,
  ...props
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      onClick={copyToClipboard}
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      {...props}
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-accent" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">{hasCopied ? "Copied!" : "Copy"}</span>
    </Button>
  );
};

export default CopyButton;
