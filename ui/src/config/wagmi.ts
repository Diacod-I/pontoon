'use client';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { flowMainnet, flowTestnet } from 'viem/chains';
import { flowWallet } from './flowWallet';


const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined');
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [flowWallet]
    },
  ],
  {
    appName: 'RainbowKit App',
    projectId,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [flowTestnet, flowMainnet],
  ssr: true,
  transports: {
    [flowMainnet.id]: http(),
    [flowTestnet.id]: http(),
  },
});