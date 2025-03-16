import { BrowserProvider, Eip1193Provider } from "ethers";

export const displayWalletAddress = (address?: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'T.B.D';
}

export const formatWalletAddress = (address?: string): `0x${string}`=> { 
    return address ? `0x${address.toString().replace(/^0x/, "")}` : '0x...';
}

/**
 * provider của mạng hiện tại theo metamask
 * @returns
 */
export const getProvider = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Lấy provider từ MetaMask
      return new BrowserProvider(window.ethereum as unknown as Eip1193Provider);
    }
    return null;
  };