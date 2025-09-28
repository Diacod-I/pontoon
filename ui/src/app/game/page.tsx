"use client";

import React, { useRef, useState, useEffect } from "react";

export default function CreateGamePage() {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [trapCard, setTrapCard] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [availableCards, setAvailableCards] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7,
  ]);
  const [currentRound, setCurrentRound] = useState<number>(1);

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

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleButtonClick = (buttonIndex: number) => {
    if (result !== null) return;
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
  ];

  const getButtonContent = (index: number) => {
    // If trap has been revealed and this is the trap card → show Joker styling
    if (result !== null && index === trapCard) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full font-extrabold text-3xl">
          <div className="text-5xl">🃏</div>
          <span className="text-xs mt-1 tracking-wider">JOKER</span>
        </div>
      );
    }

    // Normal face (suit + label)
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
      "w-[150px] h-[190px] border-[4px] border-black rounded-lg flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 select-none";

    // removed / disabled
    if (!availableCards.includes(buttonIndex)) {
      return `${base} bg-gray-300 opacity-60 cursor-not-allowed`;
    }

    // After result revealed: style selected/trap differently
    if (result !== null) {
      // Selected card
      if (buttonIndex === selectedButton) {
        // if result === 1 (lost) selected card is losing (red); if 0 (survived) selected becomes green
        return `${base} ${
          result === 1 ? "bg-red-600" : "bg-green-600"
        } text-white`;
      }

      // If trap is elsewhere and should be shown (survive case we reveal trap)
      if (buttonIndex === trapCard) {
        return `${base} bg-red-600 text-white`;
      }

      // Other revealed cards become muted
      return `${base} bg-white/80 opacity-80`;
    }

    // Default clickable state; highlight selected
    const selectedClass =
      selectedButton === buttonIndex
        ? "bg-blue-400 scale-[1.02] ring-2 ring-offset-0 ring-black"
        : "bg-white hover:bg-zinc-200";

    return `${base} ${selectedClass} cursor-pointer active:translate-y-1`;
  };

  const playGame = async () => {
    if (selectedButton === null) return;

    // countdown
    setCountdown("3");
    await sleep(300);
    setCountdown("2");
    await sleep(300);
    setCountdown("1!!!");
    await sleep(300);
    setCountdown("🎲");

    // play audio (safely)
    drumRollRef.current?.play().catch(() => {});

    // wait for dramatic pause
    await sleep(4000);
    setCountdown(null);

    // generate result: 0 = survive, 1 = lose
    const gameResult = Math.round(Math.random());
    setResult(gameResult);

    if (gameResult === 0) {
      // survived -> set a trap card somewhere else (not the selected one)
      let randomTrap: number;
      do {
        randomTrap = Math.floor(Math.random() * 8);
      } while (randomTrap === selectedButton);
      setTrapCard(randomTrap);

      // remove a random card (not selected or trap) from availableCards
      const availableForRemoval = availableCards.filter(
        (c) => c !== selectedButton && c !== randomTrap
      );
      if (availableForRemoval.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * availableForRemoval.length
        );
        const cardToRemove = availableForRemoval[randomIndex];
        setAvailableCards((prev) => prev.filter((c) => c !== cardToRemove));
      }
    } else {
      // lost -> the selected card was the trap; reveal it and remove it
      setTrapCard(selectedButton);
      setAvailableCards((prev) => prev.filter((c) => c !== selectedButton));
    }
  };

  const resetRound = () => {
    setResult(null);
    setSelectedButton(null);
    setTrapCard(null);
    setCountdown(null);
    setCurrentRound((prev) => prev + 1);
  };

  const resetGame = () => {
    setResult(null);
    setSelectedButton(null);
    setTrapCard(null);
    setCountdown(null);
    setCurrentRound(1);
    setAvailableCards([0, 1, 2, 3, 4, 5, 6, 7]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34] p-6">
      <h3 className="text-lg text-center text-black mt-6">
        You are playing against the Conman.
      </h3>
      <h3 className="text-sm text-center text-black font-thin mt-2">
        What's your next move?
      </h3>

      {countdown && (
        <span className="text-3xl font-bold mt-4">{countdown}</span>
      )}

      <div className="flex flex-col items-center">
        <div className="flex flex-wrap gap-4 items-center mt-8">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              className={getButtonStyle(index)}
              disabled={result !== null || !availableCards.includes(index)}
              aria-pressed={selectedButton === index}
              aria-label={`card-${index}`}
              type="button"
            >
              {getButtonContent(index)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center mt-4">
          {[4, 5, 6, 7].map((index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              className={getButtonStyle(index)}
              disabled={result !== null || !availableCards.includes(index)}
              aria-pressed={selectedButton === index}
              aria-label={`card-${index}`}
              type="button"
            >
              {getButtonContent(index)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        {result === null ? (
          <button
            type="button"
            onClick={playGame}
            disabled={selectedButton === null}
            className={`mt-2 text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 text-center ${
              selectedButton === null
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
            }`}
          >
            Ready?
          </button>
        ) : result === 0 ? (
          <div className="flex gap-4">
            <button
              disabled
              className="mt-2 text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 text-center bg-green-500"
            >
              You Survived!
            </button>
            <button
              onClick={resetRound}
              className="mt-2 text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 text-center bg-blue-500 hover:bg-blue-700"
            >
              Next Round →
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              disabled
              className="mt-2 text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 text-center bg-red-500"
            >
              You Lost!
            </button>
            <button
              onClick={resetGame}
              className="mt-2 text-white border-[3px] border-black font-medium rounded-lg text-lg px-6 py-3 text-center bg-blue-500 hover:bg-blue-700"
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
