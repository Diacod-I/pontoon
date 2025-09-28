"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function YourGamesPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const activeMatches = useQuery(
    api.matches.getUserActiveMatches,
    address ? { userAddress: address } : "skip"
  );

  const finishedMatches = useQuery(
    api.matches.getUserFinishedMatches,
    address ? { userAddress: address } : "skip"
  );

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34] p-6">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">
            Please connect your wallet to view your games.
          </p>
        </Card>
      </main>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRewardMultiplier = (currentRound: number) => {
    const multipliers = [0, 1.01, 1.02, 1.04, 1.1, 1.25, 1.6, 1.97];
    return multipliers[currentRound - 1] || 1;
  };

  const getPotentialReward = (betAmount: string, currentRound: number) => {
    const bet = parseFloat(betAmount);
    const multiplier = getRewardMultiplier(currentRound);
    return (bet * multiplier).toFixed(4);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Your Games</h1>
          <p className="text-black/80">
            Player: {formatAddress(address || "")}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Button variant="brutal" className="mr-4">
              ← Back to Home
            </Button>
          </Link>
          <Link href="/">
            <Button variant="brutal">+ Start New Game</Button>
          </Link>
        </div>

        {/* Active Games Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
            🎮 Active Games
            {activeMatches && activeMatches.length > 0 && (
              <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                {activeMatches.length}
              </span>
            )}
          </h2>

          {activeMatches === undefined ? (
            <div className="text-center py-8">
              <div className="text-xl">Loading your active games...</div>
            </div>
          ) : activeMatches.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-gray-400">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No Active Games</h3>
              <p className="text-gray-600 mb-4">
                You don't have any active games right now.
              </p>
              <Link href="/">
                <Button variant="brutal">Start Your First Game</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMatches.map((match) => (
                <Card
                  key={match.matchId}
                  className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">
                        Game #{match.matchId}
                      </h3>
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                        ACTIVE
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Bet Amount:</span>
                        <span>{match.betAmount} FLOW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Current Round:</span>
                        <span className="font-bold text-blue-600">
                          {match.currentRound} / 7
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Potential Reward:</span>
                        <span className="font-bold text-green-600">
                          {getPotentialReward(
                            match.betAmount,
                            match.currentRound
                          )}{" "}
                          FLOW
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Multiplier:</span>
                        <span className="font-bold">
                          {getRewardMultiplier(match.currentRound).toFixed(2)}x
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Started:</span>
                        <span>{formatDate(match.timestamp)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{match.currentRound - 1}/7 rounds completed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((match.currentRound - 1) / 7) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <Button
                      variant="brutal"
                      className="w-full"
                      onClick={() => router.push(`/game/${match.matchId}`)}
                    >
                      Continue Playing →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Finished Games Section */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
            📋 Recent Finished Games
            {finishedMatches && finishedMatches.length > 0 && (
              <span className="ml-2 bg-gray-500 text-white px-2 py-1 rounded-full text-sm">
                {finishedMatches.length}
              </span>
            )}
          </h2>

          {finishedMatches === undefined ? (
            <div className="text-center py-4">
              <div className="text-lg">Loading finished games...</div>
            </div>
          ) : finishedMatches.length === 0 ? (
            <Card className="p-6 text-center border-2 border-dashed border-gray-400">
              <div className="text-4xl mb-2">📜</div>
              <p className="text-gray-600">No finished games yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finishedMatches.map((match) => (
                <Card
                  key={match.matchId}
                  className="border-2 border-gray-400 bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">
                        Game #{match.matchId}
                      </h3>
                      <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                        FINISHED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <strong>Bet:</strong> {match.betAmount} FLOW
                        </p>
                        <p>
                          <strong>Rounds:</strong> {match.currentRound - 1}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Reward:</strong> {match.finalReward || "0"}{" "}
                          FLOW
                        </p>
                        <p>
                          <strong>Result:</strong>
                          <span
                            className={
                              match.finalReward === "0"
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {match.finalReward === "0" ? " Lost" : " Won"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {formatDate(match.timestamp)}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs"
                      onClick={() => router.push(`/game/${match.matchId}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {(activeMatches?.length || finishedMatches?.length) && (
          <Card className="mt-8 p-6 border-2 border-black bg-white/90">
            <h3 className="text-lg font-semibold mb-4 text-center">
              📊 Your Gaming Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {activeMatches?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {finishedMatches?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Finished Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {finishedMatches?.filter((m) => m.finalReward !== "0")
                    .length || 0}
                </div>
                <div className="text-sm text-gray-600">Won Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {finishedMatches?.filter((m) => m.finalReward === "0")
                    .length || 0}
                </div>
                <div className="text-sm text-gray-600">Lost Games</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
