export const displayWalletAddress = (address?: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'T.B.D';
}

export const formatWalletAddress = (address?: string): `0x${string}`=> { 
    return address ? `0x${address.toString().replace(/^0x/, "")}` : '0x...';
}