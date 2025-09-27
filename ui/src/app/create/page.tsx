'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Connect from "@/components/connect"
import { useAccount } from 'wagmi'


export default function HomePage() {
  const router = useRouter()
  const [stakeAmount, setStakeAmount] = useState<string>('')
  const { isConnected } = useAccount()

  const handleSubmit = () => {
    if (!isConnected) {
      // Add shake animation to card
      const card = document.querySelector('.stake-card')
      card?.classList.add('shake-animation')
      setTimeout(() => card?.classList.remove('shake-animation'), 800)
      return
    }
    
    if (parseFloat(stakeAmount) > 0) {
      router.push(`/game?stake=${stakeAmount}`)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      
      <nav className="bg-black/10 dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b-3 border-black dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <div className="flex flexcol items-center justify-center mx-2">
            <img src="./logo.png" className="h-16 border-black border-3 rounded-full mx-3" alt="Pontoon Logo"/>
            <span className="text-2xl font-semibold dark:text-white mx-auto">Pontoon</span>
            </div>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <Connect />
          </div>
        </div>
      </nav>

        <div className="flex flex-col items-center">
          <Card className={`stake-card w-[450px] p-8 border-black border-4 bg-white/90 backdrop-blur ${!isConnected ? 'border-red-500' : ''}`}>
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
                  className="border-3 border-black h-14 text-xl mt-4"
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
                onClick={handleSubmit}
                type="button" 
                className={`w-full text-white border-black border-3 font-medium rounded-lg text-xl px-8 py-4 text-center ${
                  isConnected ? 'bg-blue-500 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-700'
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
