"use client";

import React, { useRef, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useWriteContract, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from "../../../utils/constants";
import { engineAbi } from "@/utils/abi/engineAbi";
import { decodeEventLog } from "viem";

export default function GamePage() {
  const params = useParams();
  const matchId = parseInt(params.id as string);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({});
  const publicClient = usePublicClient();

  // Convex queries and mutations
  const matchData = useQuery(api.matches.getMatchById, { matchId });
  const updateMatchStatus = useMutation(api.matches.updateMatchStatus);
  const createRound = useMutation(api.rounds.createRound);

  // Game state
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [trapCard, setTrapCard] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableCards, setAvailableCards] = useState<number[]>([]);

  const drumRollRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof Audio !== "undefined") {
      drumRollRef.current = new Audio("/drumroll.mp3");
    }
    return () => {
      if (drumRollRef.current) {
        drumRollRef.current.pause();
        drumRollRef.current = null;
      }
    };
  }, []);

  // Initialize available cards based on current round
  useEffect(() => {
    if (matchData && matchData.status === "ACTIVE") {
      const currentRound = matchData.currentRound;
      const tilesForRound = 9 - currentRound; // Based on your contract logic
      setAvailableCards(Array.from({ length: tilesForRound }, (_, i) => i));
    }
  }, [matchData]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleButtonClick = (buttonIndex: number) => {
    if (result !== null || isPlaying) return;
    if (!availableCards.includes(buttonIndex)) return;
    setSelectedButton((prev) => (prev === buttonIndex ? null : buttonIndex));
  };

  const cardFaces = [
    { symbol: "♠️", label: "A" },
    { symbol: "♦️", label: "K" },
    { symbol: "♣️", label: "Q" },
    { symbol: "♥️", label: "J" },
    { symbol: "♠️", label: "10" },
    { symbol: "♦️", label: "9" },
    { symbol: "♣️", label: "8" },
    { symbol: "♥️", label: "7" },
    { symbol: "♠️", label: "6" },
  ];

  const getButtonContent = (index: number) => {
    if (result !== null && index === trapCard) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full font-extrabold text-3xl">
          <div className="text-5xl">💣</div>
          <span className="text-xs mt-1 tracking-wider">BOMB</span>
        </div>
      );
    }

    const face = cardFaces[index];
    return (
      <div className="flex flex-col items-center justify-center h-full w-full font-extrabold text-3xl">
        <div className="text-4xl">{face?.symbol}</div>
        <span className="text-sm mt-1 tracking-wider">{face?.label}</span>
      </div>
    );
  };

  const getButtonStyle = (buttonIndex: number) => {
    const base =
      "w-[120px] h-[160px] border-[4px] border-black rounded-lg flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 select-none";

    if (!availableCards.includes(buttonIndex)) {
      return `${base} bg-gray-300 opacity-60 cursor-not-allowed`;
    }

    if (result !== null) {
      if (buttonIndex === selectedButton) {
        return `${base} ${
          result === 1 ? "bg-red-600" : "bg-green-600"
        } text-white`;
      }
      if (buttonIndex === trapCard) {
        return `${base} bg-red-600 text-white`;
      }
      return `${base} bg-white/80 opacity-80`;
    }

    const selectedClass =
      selectedButton === buttonIndex
        ? "bg-blue-400 scale-[1.02] ring-2 ring-offset-0 ring-black"
        : "bg-white hover:bg-zinc-200";

    return `${base} ${selectedClass} cursor-pointer active:translate-y-1`;
  };

  const playRound = async () => {
    if (selectedButton === null || !matchData || !address) return;

    setIsPlaying(true);

    // Countdown
    setCountdown("3");
    await sleep(500);
    setCountdown("2");
    await sleep(500);
    setCountdown("1");
    await sleep(500);
    setCountdown("🎲");

    drumRollRef.current?.play().catch(() => {});
    await sleep(3000);
    setCountdown(null);

    try {
      // Call blockchain contract
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: engineAbi,
        functionName: "playRound",
        args: [BigInt(matchId), BigInt(selectedButton + 1)],
      });

      console.log("Round tx sent:", txHash);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      // Parse RoundPlayed event
      let roundResult: any = null;
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
          continue;
        }

        try {
          const decoded = decodeEventLog({
            abi: engineAbi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "RoundPlayed") {
            roundResult = {
              matchId: Number(decoded.args.matchId),
              roundNumber: Number(decoded.args.roundNumber),
              playerChoice: Number(decoded.args.playerChoice),
              winningNumber: Number(decoded.args.winningNumber),
              won: decoded.args.won,
            };
            break;
          }
        } catch (decodeError) {
          console.error("Failed to decode log:", decodeError);
        }
      }

      if (!roundResult) {
        throw new Error("Could not parse round result");
      }

      // Store round in Convex
      await createRound({
        matchId: matchId,
        roundNumber: roundResult.roundNumber,
        playerChoice: roundResult.playerChoice,
        winningNumber: roundResult.winningNumber,
        won: roundResult.won,
        timestamp: Date.now(),
        txHash: txHash,
      });

      // Update UI based on result
      const bombPosition = roundResult.winningNumber - 1; // Convert back to 0-indexed
      setTrapCard(bombPosition);
      setResult(roundResult.won ? 0 : 1);

      // Update match status if game ended
      if (!roundResult.won) {
        await updateMatchStatus({
          matchId: matchId,
          status: "FINISHED",
          currentRound: roundResult.roundNumber,
          finalReward: "0",
        });
      } else {
        await updateMatchStatus({
          matchId: matchId,
          status: "ACTIVE",
          currentRound: roundResult.roundNumber + 1,
        });
      }
    } catch (error) {
      console.error("Round failed:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  const leaveGame = async () => {
    if (!matchData || !address) return;

    try {
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: engineAbi,
        functionName: "leaveMatch",
        args: [BigInt(matchId)],
      });

      console.log("Leave game tx sent:", txHash);

      if (!publicClient) {
        throw new Error("Public client not available");
      }

      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Update match status
      await updateMatchStatus({
        matchId: matchId,
        status: "FINISHED",
        currentRound: matchData.currentRound,
      });
    } catch (error) {
      console.error("Leave game failed:", error);
    }
  };

  const resetRound = () => {
    setResult(null);
    setSelectedButton(null);
    setTrapCard(null);
    setCountdown(null);

    // Update available cards for next round
    if (matchData && matchData.status === "ACTIVE") {
      const nextRound = matchData.currentRound;
      const tilesForRound = 9 - nextRound;
      setAvailableCards(Array.from({ length: tilesForRound }, (_, i) => i));
    }
  };

  if (matchData === undefined) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
        <div className="text-2xl">Loading game...</div>
      </main>
    );
  }

  if (matchData === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Game Not Found</h1>
          <p className="mt-4">The requested game does not exist.</p>
        </Card>
      </main>
    );
  }

  if (matchData.userAddress.toLowerCase() !== address?.toLowerCase()) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4">You can only play your own games.</p>
        </Card>
      </main>
    );
  }

  if (matchData.status === "FINISHED") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34] p-6">
        <Card className="p-8 text-center max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Game Over</h1>
          <div className="space-y-4">
            <p>
              <strong>Match ID:</strong> {matchId}
            </p>
            <p>
              <strong>Bet Amount:</strong> {matchData.betAmount} FLOW
            </p>
            <p>
              <strong>Rounds Completed:</strong> {matchData.currentRound - 1}
            </p>
            {matchData.finalReward && (
              <p>
                <strong>Final Reward:</strong> {matchData.finalReward} FLOW
              </p>
            )}
          </div>

          {matchData.rounds && matchData.rounds.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Round History</h2>
              <div className="space-y-2">
                {matchData.rounds.map((round) => (
                  <div
                    key={round.roundNumber}
                    className={`p-3 rounded border ${round.won ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <p>
                      Round {round.roundNumber}: Chose {round.playerChoice},
                      Bomb was {round.winningNumber} -{" "}
                      {round.won ? "Survived!" : "Hit Bomb!"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen pt-40 flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34] p-6">
      {/* Game Info Header */}
      <Card className="p-4 mb-6 w-full max-w-4xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-semibold">Match ID</p>
            <p>{matchId}</p>
          </div>
          <div>
            <p className="font-semibold">Bet Amount</p>
            <p>{matchData.betAmount} FLOW</p>
          </div>
          <div>
            <p className="font-semibold">Current Round</p>
            <p>{matchData.currentRound} / 7</p>
          </div>
        </div>
      </Card>

      <h3 className="text-lg text-center text-black">
        You are playing against the Conman.
      </h3>
      <h3 className="text-sm text-center text-black font-thin mt-2">
        Choose wisely - one tile has a bomb! 💣
      </h3>

      {countdown && (
        <span className="text-4xl font-bold mt-4 animate-pulse">
          {countdown}
        </span>
      )}

      {/* Game Board */}
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-4 gap-4 mt-8">
          {availableCards.map((index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              className={getButtonStyle(index)}
              disabled={
                result !== null || isPlaying || !availableCards.includes(index)
              }
              type="button"
            >
              {getButtonContent(index)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-8">
        {result === null ? (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={playRound}
              disabled={selectedButton === null || isPlaying}
              className={`text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 ${
                selectedButton === null || isPlaying
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
            >
              {isPlaying ? "Playing..." : "Play Round"}
            </button>
            <button
              type="button"
              onClick={leaveGame}
              className="text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 bg-yellow-500 hover:bg-yellow-600"
            >
              Leave & Collect Reward
            </button>
          </div>
        ) : result === 0 ? (
          <div className="flex gap-4">
            <button
              disabled
              className="text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 bg-green-500"
            >
              You Survived! 🎉
            </button>
            <button
              onClick={resetRound}
              className="text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 bg-blue-500 hover:bg-blue-700"
            >
              Next Round →
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              disabled
              className="text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 bg-red-500"
            >
              You Hit the Bomb! 💥
            </button>
          </div>
        )}
      </div>

      {/* Round History */}
      {matchData.rounds && matchData.rounds.length > 0 && (
        <Card className="mt-6 p-4 w-full max-w-2xl">
          <h3 className="font-semibold mb-2">Previous Rounds</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {matchData.rounds.map((round) => (
              <div
                key={round.roundNumber}
                className={`text-sm p-2 rounded ${round.won ? "bg-green-100" : "bg-red-100"}`}
              >
                Round {round.roundNumber}: Choice {round.playerChoice} | Bomb{" "}
                {round.winningNumber} | {round.won ? "✅" : "💥"}
              </div>
            ))}
          </div>
        </Card>
      )}
    </main>
  );
}
