"use client";
import { useState } from "react";
import Card from "./card";

export default function CreateGamePage() {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [trapCard, setTrapCard] = useState<number | null>(null);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [availableCards, setAvailableCards] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7,
  ]);
  const [result, setResult] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const cardFaces = [
    { symbol: "♠️", label: "A" },
    { symbol: "♦️", label: "K" },
    { symbol: "♣️", label: "Q" },
    { symbol: "♥️", label: "J" },
    { symbol: "♠️", label: "10" },
    { symbol: "♦️", label: "9" },
    { symbol: "♣️", label: "8" },
    { symbol: "♥️", label: "7" },
  ];

  const handleCardClick = async (index: number) => {
    if (selectedButton !== null || result !== null) return;
    if (!availableCards.includes(index)) return;

    setSelectedButton(index);
    setFlippedCards((prev) => [...prev, index]);

    const gameResult = Math.round(Math.random());
    setResult(gameResult);

    if (gameResult === 0) {
      let randomTrap;
      do {
        randomTrap = Math.floor(Math.random() * 8);
      } while (randomTrap === index);
      setTrapCard(randomTrap);
      setFlippedCards((prev) => [...prev, randomTrap]);

      const availableForRemoval = availableCards.filter(
        (c) => c !== index && c !== randomTrap
      );
      if (availableForRemoval.length > 0) {
        const cardToRemove =
          availableForRemoval[
            Math.floor(Math.random() * availableForRemoval.length)
          ];
        setAvailableCards((prev) => prev.filter((c) => c !== cardToRemove));
      }
    } else {
      // Player loses
      setTrapCard(index);
    }
  };

  const resetRound = () => {
    setResult(null);
    setSelectedButton(null);
    setTrapCard(null);
    setFlippedCards([]);
    setCurrentRound((prev) => prev + 1);
  };

  const resetGame = () => {
    setResult(null);
    setSelectedButton(null);
    setTrapCard(null);
    setFlippedCards([]);
    setCurrentRound(1);
    setAvailableCards([0, 1, 2, 3, 4, 5, 6, 7]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      <h3 className="text-4xl text-center text-black mt-8">
        You are playing against thedasdas Conman.
      </h3>
      <h3 className="text-2xl text-center text-black font-thin mt-2">
        What's your next move?
      </h3>

      <div className="flex flex-col items-center mt-8">
        <div className="flex flex-wrap gap-4 items-center">
          {cardFaces.map((face, index) => (
            <Card
              key={index}
              index={index}
              isSelected={selectedButton === index}
              isTrap={trapCard === index}
              isFlipped={flippedCards.includes(index)}
              disabled={result !== null || !availableCards.includes(index)}
              onClick={() => handleCardClick(index)}
              face={face}
            />
          ))}
        </div>
      </div>

      {/* Result + Controls */}
      <div className="flex items-center gap-4 mt-6">
        {result === null ? null : result === 0 ? (
          <div className="flex gap-4">
            <button
              disabled
              className="text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-green-500"
            >
              You Survived!
            </button>
            <button
              onClick={resetRound}
              className="text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-blue-500 hover:bg-blue-700"
            >
              Next Round →
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              disabled
              className="text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-red-500"
            >
              You Lost!
            </button>
            <button
              onClick={resetGame}
              className="text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-blue-500 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-lg font-semibold">Round {currentRound}</div>
    </main>
  );
}
