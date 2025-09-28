"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      {/* <div className="bg-[url('/monkey_background.png')] bg-cover bg-center z-0 h-screen"/> */}
      <div className="container flex flex-col items-center justify-center gap-6 py-8 mb-20 mt-20">
        <div className="px-6 py-4 rounded-md ">
          <h1
            className="text-4xl sm:text-9xl lg:text-[12rem] font-extrabold tracking-tight 
    text-pink-500 [text-shadow:4px_4px_0_#000,8px_8px_0_#222]"
          >
            Pontoon
          </h1>
        </div>
        <h3 className="text-center text-xl text-black">
          Longer you survive, more you earn 🤑!
        </h3>
        <div className="flex flex-wrap gap-8 mt-4">
          <Button
            onClick={() => router.push("/create")}
            type="button"
            variant={"brutal"}
            size={"xl"}
          >
            Play Now
          </Button>
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
