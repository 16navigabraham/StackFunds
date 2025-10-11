"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bitcoin, CheckCircle2, Loader2 } from "lucide-react";

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

type Step = "amount" | "confirming" | "success";

export function FundModal({ isOpen, onClose, projectName }: FundModalProps) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("0.01");

  const handleFund = () => {
    setStep("confirming");
    // Simulate transaction
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep("amount");
      setAmount("0.01");
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px]">
        {step === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle>Fund "{projectName}"</DialogTitle>
              <DialogDescription>
                Enter the amount of sBTC you want to contribute.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="relative col-span-3">
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                  <Bitcoin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleFund} className="w-full">
                Fund with {amount} sBTC
              </Button>
            </DialogFooter>
          </>
        )}
        {step === "confirming" && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-lg font-medium">Processing Transaction...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your contribution.
            </p>
          </div>
        )}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-accent" />
            <h3 className="text-xl font-bold">Success!</h3>
            <p className="text-center text-muted-foreground">
              You've successfully funded this project with {amount} sBTC!
            </p>
            <Button onClick={resetAndClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
