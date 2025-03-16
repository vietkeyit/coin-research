export const USDT_CONTRACTS = {
    1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum
    137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // Polygon
    56: "0x55d398326f99059fF775485246999027B3197955", // BSC
    42161: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // Arbitrum
};

// ERC20 ABI để đọc thông tin về token hoặc dùng với useReadContract của wagmi 
export const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
];

// Hiện chỉ hỗ trợ USDT và Native token của mỗi mạng
export const TOKENBYCHAIN = {

    // Ethereum
    1: [
        { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", name: "ETH" },
        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", name: "USDT" },
    ],

    // Polygon
    137: [
        { address: "0x0000000000000000000000000000000000001010", name: "POL" },
        { address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", name: "USDT" },
    ],

    // BSC
    56: [
        { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", name: "BNB" },
        { address: "0x55d398326f99059fF775485246999027B3197955", name: "USDT" },
    ],

    // Abitrum
    42161: [
        { address: "0x912CE59144191C1204E64559FE8253a0e49E6548", name: "ETH" },
        { address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", name: "USDT" },
    ],
};