"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      {/* <div className="bg-[url('/monkey_background.png')] bg-cover bg-center z-0 h-screen"/> */}
      <div className="container mt-15 mb-20 flex flex-col items-center justify-center gap-6 py-8">
        <div className="text-animation mb-2 rounded-md border-3 border-black bg-white px-6">
          <span className="text-5xlfont-extrabold mb-10 tracking-tight text-white sm:text-[5rem]">
            Pontoon
          </span>
        </div>
        <h3 className="mt-4 text-center text-xl font-thin text-black">
          A PvP betting game where 2 players stake{" "}
          <span className="rounded-md border-3 border-black bg-[#75d864] px-2 py-1 text-white">
            FLOW
          </span>{" "}
          coins, one guesses safe tiles while another sets traps.
        </h3>
        <h3 className="text-center text-4xl font-thin text-black">
          Longer you survive, more you earn 🤑!
        </h3>
        <div className="mt-4 flex flex-wrap gap-8">
          <button
            onClick={() => router.push("/create")}
            type="button"
            className="rounded-lg border-3 border-black bg-blue-500 px-6 py-3 text-center text-lg font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Create a room
          </button>
          <button
            onClick={() => router.push("/join")}
            type="button"
            className="rounded-lg border-3 border-black bg-zinc-100 px-6 py-3 text-center text-lg font-medium text-black hover:bg-zinc-300 focus:ring-4 focus:ring-blue-300 focus:outline-black dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Join room
          </button>
        </div>
      </div>
    </main>
  );
}
