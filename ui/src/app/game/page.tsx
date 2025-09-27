'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAccount } from 'wagmi'


export default function CreateGamePage() {
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
    <h3 className="text-4xl text-center text-black font-thin">
        You are playing against 
    </h3>
        <div className="flex flex-wrap gap-4 items-cente mt-20">
          <button className={`w-[150px] h-[190px] border-black border-4 rounded-lg bg-white/90 backdrop-blur`}></button>
          <button className={`w-[150px] h-[190px] border-black border-4 rounded-lg bg-white/90 backdrop-blur`}></button>
          <button className={`w-[150px] h-[190px] border-black border-4 rounded-lg bg-white/90 backdrop-blur`}></button>
          <button className={`w-[150px] h-[190px] border-black border-4 rounded-lg bg-white/90 backdrop-blur`}></button>
        </div>
    </main>
  );
}
