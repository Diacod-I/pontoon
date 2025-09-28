'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAccount } from 'wagmi'


export default function CreateGamePage() {
  const router = useRouter()
  const [stakeAmount, setStakeAmount] = useState<string>('')
  const [numRounds, setRoundCount] = useState(0)
  const { isConnected } = useAccount()

  const handleSubmit = () => {
    if (!isConnected) {
      const card = document.querySelector('.stake-card')
      card?.classList.add('shake-animation')
      setTimeout(() => card?.classList.remove('shake-animation'), 800)
      return
    }
    
    if (parseFloat(stakeAmount) > 0) {
      router.push(`/game?match_id=${stakeAmount}`)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
        <div className="flex flex-col items-center">
          <Card className={`stake-card w-[450px] p-8 border-black border-4 bg-white/90 backdrop-blur ${!isConnected ? 'border-red-500' : ''}`}>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="stake" className="text-2xl font-semibold text-center">
                  How much are you willing to stake?
                </Label>
                <Input
                  id="match_id"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter FLOW coin amount"
                  className="border-3 border-black h-14 text-xl mt-4"
                  min="0"
                  step="0.1"
                  disabled={!isConnected}
                />
                {/* <Input
                  id="rounds"
                  type="number"
                  value={numRounds}
                  onChange={(e) => setRoundCount(Number(e.target.value))}
                  placeholder="Number of Rounds"
                  className="border-3 border-black h-14 text-xl"
                  min="0"
                  step="1"
                  disabled={!isConnected}
                /> */}
                {!isConnected && (
                  <p className="warning-text text-lg">
                    Please connect your wallet to continue! 🔐
                  </p>
                )}
              </div>
              <button 
                onClick={handleSubmit}
                type="button" 
                className={`w-full text-white border-black border-3 font-medium rounded-lg text-xl px-8 py-4 text-center ${
                  isConnected ? 'bg-blue-500 hover:bg-blue-700' : 'bg-red-800'
                }`}
              >
                {isConnected ? 'Start Game' : 'Wallet not connected'}
              </button>
            </div>
          </Card>
        </div>
    </main>
  );
}
