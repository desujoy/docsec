import { createConfig, webSocket } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [metaMask()],
  transports: {
    [sepolia.id]: webSocket("wss://ethereum-sepolia-rpc.publicnode.com"),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
