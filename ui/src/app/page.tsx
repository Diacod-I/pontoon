"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      {/* <div className="bg-[url('/monkey_background.png')] bg-cover bg-center z-0 h-screen"/> */}
      <div className="container flex flex-col items-center justify-center gap-6 py-8 mb-20 mt-20">
        <div className="bg-white border-black border-3 px-6 rounded-md mb-2 gradient-animation">
          <span className="text-5xlfont-extrabold tracking-tight text-white sm:text-[5rem] mb-10">
            Pontoon
          </span>
        </div>
        <h3 className="text-2xl text-center text-black mt-8">
          A PvP betting game where players stake{" "}
          <span className="bg-[#75d864] px-2 py-1 text-white border-black border-3 rounded-md">
            FLOW
          </span>{" "}
          coins, and guess safe tiles while evading trap tiles!
        </h3>
        <h3 className="text-5xl text-center text-black" />
        <h3 className="text-center text-4xl font-thin text-black">
          Longer you survive, more you earn 🤑!
        </h3>
        <div className="flex flex-wrap gap-8 mt-4">
          <button
            onClick={() => router.push("/create")}
            type="button"
            className="text-white bg-blue-500 border-black border-3 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Play Now
          </button>
          {/* <button 
            onClick={() => router.push('/join')}
            type="button" 
            className="text-black bg-zinc-100 border-black border-3 hover:bg-zinc-300 focus:ring-4 focus:outline-black focus:ring-blue-300 font-medium rounded-lg text-lg px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          <button
            onClick={() => router.push("/join")}
            type="button"
            className="rounded-lg border-3 border-black bg-zinc-100 px-6 py-3 text-center text-lg font-medium text-black hover:bg-zinc-300 focus:ring-4 focus:ring-blue-300 focus:outline-black dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Join room
          </button> */}
        </div>
      </div>
    </main>
  );
}
