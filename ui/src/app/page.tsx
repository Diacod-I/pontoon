import Connect from "@/components/connect";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/50 to-[#baeb34]">
      
      <nav className="bg-transparent dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b-3 border-black dark:border-gray-600">
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
      {/* <div className="bg-[url('/monkey_background.png')] bg-cover bg-center z-0 h-screen"/> */}
      <div className="container flex flex-col items-center justify-center gap-6 py-8 mb-20 mt-15">
        <div className="bg-white border-black border-3 px-6 rounded-md mb-2">
        <span className="text-5xlfont-extrabold tracking-tight text-black sm:text-[5rem] mb-10 text-animation">
          Pontoon
        </span>
        </div>
        <h3 className="text-xl text-center text-black font-thin mt-4">
          PvP betting game where 2 players stake FLOW coins, one guesses safe tiles while another sets traps.
        </h3>
        <h3 className="text-4xl text-center text-black font-thin mb-4">
          Longer you survive, more you earn 🤑!
        </h3>
        <div className="flex flex-wrap gap-8 mt-4">
        <button type="button" className="text-white bg-blue-500 border-black border-3 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create a room</button>
        <button type="button" className="text-black bg-white border-black border-3 hover:bg-zinc-200 focus:ring-4 focus:outline-black focus:ring-blue-300 font-medium rounded-lg text-lg px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Join room</button>
        </div>
      </div>
    </main>
  );
}
