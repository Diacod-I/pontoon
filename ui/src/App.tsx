import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@rainbow-me/rainbowkit/styles.css' 
import { ConnectButton } from '@rainbow-me/rainbowkit'

function App() {

  return (
    <>
      <h1>Pontoon</h1>
      <div className="card">
        <ConnectButton />
      </div>
    </>
  )
}

export default App
