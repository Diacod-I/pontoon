import Connect from "@/components/connect";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#baeb34]/40 to-[#baeb34]/60">
      
      <nav className="bg-transparent dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b-3 border-black dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <div className="flex flexcol items-center justify-center mx-2">
            <img src="./logo.png" className="h-16 rounded-full mx-3" alt="Pontoon Logo"/>
            <span className="text-2xl font-semibold dark:text-white mx-auto">Pontoon</span>
            </div>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <Connect />
          </div>
        </div>
      </nav>
      {/* <div className="bg-[url('/monkey_background.png')] bg-cover bg-center z-0 h-screen"/> */}
      <div className="container flex flex-col items-center justify-center gap-6 py-8 mb-20">
        <span className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem] mb-10 text-animation">
          Pontoon
        </span>
        <h3 className="text-xl text-center text-black font-thin">
          PvP betting game where 2 players stake FLOW coins, one guesses safe tiles while another sets traps.
        </h3>
        <h3 className="text-4xl text-center text-black font-thin mb-4">
          Longer you survive, more you earn 🤑!
        </h3>
        <button type="button" className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-6 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Get started</button>
      </div>
    </main>
  );
}
