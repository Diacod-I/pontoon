"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS } from "../../utils/constants";
import { parseEther } from "viem";
import { engineAbi } from "@/utils/abi/engineAbi";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract({});

  const handleCreateGame = async () => {
    if (!isConnected) {
      const card = document.querySelector(".stake-card");
      card?.classList.add("shake-animation");
      setTimeout(() => card?.classList.remove("shake-animation"), 800);
      return;
    }

    if (!stakeAmount || Number(stakeAmount) <= 0) {
      const card = document.querySelector(".stake-card");
      card?.classList.add("shake-animation");
      setTimeout(() => card?.classList.remove("shake-animation"), 800);
      return;
    }

    try {
      setIsLoading(true);

      const betValue = parseEther(stakeAmount);

      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: engineAbi,
        functionName: "createMatch",
        args: [betValue],
        value: betValue,
      });

      console.log("Tx sent:", txHash);

      router.push(`/game?stake=${stakeAmount}`);
    } catch (err) {
      console.error("Tx failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen shadow flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      <div className="flex flex-col items-center">
        <Card
          className={`stake-card w-[450px] border-2 p-8 backdrop-blur
  transition-all duration-300 ease-in-out
  shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
  hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] 
  hover:-translate-y-2
  active:translate-y-1 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
  ${!isConnected ? "border-red-500" : ""}`}
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="stake" className="text-2xl font-semibold">
                Deposit Amount
              </Label>
              <div className="relative mt-4">
                <Input
                  id="stake"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter FLOW amount"
                  className="h-14 w-full border-2 border-black text-xl pr-12 appearance-none 
      [appearance:textfield] 
      [&::-webkit-outer-spin-button]:appearance-none 
      [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  step="0.1"
                  disabled={!isConnected}
                />
                <img
                  src="/flow-logo.png"
                  alt="FLOW"
                  className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 pointer-events-none"
                />
              </div>
              {!isConnected && (
                <p className="warning-text text-lg">
                  Please connect your wallet to continue! 🔐
                </p>
              )}
            </div>
            <Button
              onClick={handleCreateGame}
              variant={isConnected ? "brutal" : "brutalDestructive"}
              disabled={isLoading}
              className="w-full py-5 h-16 px-6 font-semibold"
            >
              {isConnected
                ? isLoading
                  ? "Please wait..."
                  : "Deposit"
                : "Wallet not connected"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
