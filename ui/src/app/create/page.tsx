"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Connect from "@/components/connect";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS } from "../../utils/constants";
import { parseEther } from "viem";
import { engineAbi } from "@/utils/abi/engineAbi";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      <nav className="fixed start-0 top-0 z-20 w-full border-b-3 border-black bg-black/10 dark:border-gray-600 dark:bg-gray-900">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
          <div className="flexcol mx-2 flex items-center justify-center">
            <img
              src="./logo.png"
              className="mx-3 h-16 rounded-full border-3 border-black"
              alt="Pontoon Logo"
            />
            <span className="mx-auto text-2xl font-semibold dark:text-white">
              Pontoon
            </span>
          </div>
          <div className="flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
            <Connect />
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center">
        <Card
          className={`stake-card w-[450px] border-4 border-black bg-white/90 p-8 backdrop-blur ${!isConnected ? "border-red-500" : ""}`}
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="stake" className="text-2xl font-semibold">
                Stake Amount
              </Label>
              <Input
                id="stake"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter FLOW amount"
                className="mt-4 h-14 border-3 border-black text-xl"
                min="0"
                step="0.1"
                disabled={!isConnected}
              />
              {!isConnected && (
                <p className="warning-text text-lg">
                  Please connect your wallet to continue! 🔐
                </p>
              )}
            </div>
            <button
              onClick={handleCreateGame}
              type="button"
              className={`w-full rounded-lg border-3 border-black px-8 py-4 text-center text-xl font-medium text-white ${
                isConnected
                  ? "bg-blue-500 hover:bg-blue-700"
                  : "bg-red-500 hover:bg-red-700"
              }`}
              disabled={isLoading}
            >
              {isConnected
                ? isLoading
                  ? "Please wait..."
                  : "Stake"
                : "Wallet not connected"}
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
