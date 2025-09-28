'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'


export default function CreateGamePage() {
  const router = useRouter()
  const [stakeAmount, setStakeAmount] = useState<string>('')
  const [selectedButton, setSelectedButton] = useState<number | null>(null)
  const [result, setResult] = useState<number | null>(null)
  const [trapCard, setTrapCard] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [availableCards, setAvailableCards] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7])
  const [currentRound, setCurrentRound] = useState<number>(1)
  const { isConnected } = useAccount()

  // Create audio element for drum roll
  const drumRoll = typeof Audio !== 'undefined' 
    ? new Audio('/drumroll.mp3') 
    : null

  const handleButtonClick = (buttonIndex: number) => {
    if (result === null && availableCards.includes(buttonIndex)) {
      setSelectedButton(buttonIndex === selectedButton ? null : buttonIndex)
    }
  }

  const getButtonStyle = (buttonIndex: number) => {
    // If card is not in availableCards, make it look disabled
    if (!availableCards.includes(buttonIndex)) {
      return `w-[150px] h-[190px] border-black border-4 rounded-lg backdrop-blur
        bg-gray-300 opacity-50 cursor-not-allowed`
    }

    if (result !== null) {
      // After result is shown
      if (buttonIndex === selectedButton) {
        // Selected card becomes red or green based on result
        return `w-[150px] h-[190px] border-black border-4 rounded-lg backdrop-blur
          ${result === 1 ? 'bg-red-500' : 'bg-green-500'} 
          transition-colors duration-500`
      } else if (buttonIndex === trapCard && result === 0) {
        // Show trap card in red if player survived
        return `w-[150px] h-[190px] border-black border-4 rounded-lg backdrop-blur
          bg-red-500 transition-colors duration-500`
      }
    }
    
    // Default state
    return `w-[150px] h-[190px] border-black border-4 rounded-lg backdrop-blur
      ${selectedButton === buttonIndex 
        ? 'bg-blue-400' 
        : 'bg-white/90 hover:bg-zinc-300'
      } transition-colors duration-200`
  }

  const playGame = async () => {
    if (selectedButton === null) return

    // Start countdown
    setCountdown('3')
    await new Promise(resolve => setTimeout(resolve, 300))
    setCountdown('2')
    await new Promise(resolve => setTimeout(resolve, 300))
    setCountdown('1!!!')
    await new Promise(resolve => setTimeout(resolve, 300))
    setCountdown('🎲')

    // Play drum roll
    if (drumRoll) {
      drumRoll.play()
    }

    // Wait for drum roll
    await new Promise(resolve => setTimeout(resolve, 4000))
    setCountdown(null)

    // Generate random result (0 or 1)
    const gameResult = Math.round(Math.random())
    setResult(gameResult)

    if (gameResult === 0) {
      // Player survives - select random trap card
      let randomTrap
      do {
        randomTrap = Math.floor(Math.random() * 8)
      } while (randomTrap === selectedButton)
      setTrapCard(randomTrap)

      // Remove a random card (not the selected one or trap card)
      const availableForRemoval = availableCards.filter(
        card => card !== selectedButton && card !== randomTrap
      )
      if (availableForRemoval.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableForRemoval.length)
        const cardToRemove = availableForRemoval[randomIndex]
        setAvailableCards(prev => prev.filter(card => card !== cardToRemove))
      }
    }
  }

  // Add resetRound function
  const resetRound = () => {
    setResult(null)
    setSelectedButton(null)
    setTrapCard(null)
    setCountdown(null)
    setCurrentRound(prev => prev + 1)
  }

  // Add resetGame function
  const resetGame = () => {
    setResult(null);
    setSelectedButton(null);
    setTrapCard(null);
    setCountdown(null);
    setCurrentRound(1);
    setAvailableCards([0, 1, 2, 3, 4, 5, 6, 7]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
    <h3 className="text-4xl text-center text-black mt-25">
        You are playing against the Conman.
    </h3>
    <h3 className="text-2xl text-center text-black font-thin mt-2">
        What's your next move?
    </h3>
        {countdown && (
        <span className="text-3xl font-bold mt-2">
            {countdown}
        </span>
        )}
        <div className="flex flex-col items-center">
            <div className="flex flex-wrap gap-4 items-center mt-8">
            {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              className={getButtonStyle(index)}
              disabled={result !== null || !availableCards.includes(index)}
            />
          ))}
            </div>
            <div className="flex flex-wrap gap-4 items-center mt-4">
            {[4, 5, 6, 7].map((index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              className={getButtonStyle(index)}
              disabled={result !== null || !availableCards.includes(index)}
            />
          ))}
            </div>
        </div>
        <div className="flex items-center gap-4">
          {result === null ? (
            <button 
              type="button" 
              onClick={playGame}
              disabled={selectedButton === null}
              className={`mt-8 text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center
                ${selectedButton === null 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300'
                }`}
            >
              Ready?
            </button>
          ) : result === 0 ? (
            <div className="flex gap-4">
              <button 
                disabled
                className="mt-8 text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-green-500"
              >
                You Survived!
              </button>
              <button 
                onClick={resetRound}
                className="mt-8 text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-blue-500 hover:bg-blue-700"
              >
                Next Round →
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button 
                disabled
                className="mt-8 text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-red-500"
              >
                You Lost!
              </button>
              <button 
                onClick={resetGame}
                className="mt-8 text-white border-black border-3 font-medium rounded-lg text-lg px-6 py-3 text-center bg-blue-500 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Add round counter */}
        <div className="mt-4 text-lg font-semibold">
          Round {currentRound}
        </div>
    </main>
  );
}
