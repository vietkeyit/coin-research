import { useAccount, usePublicClient } from "wagmi";
import { encodeFunctionData, erc20Abi, isAddress, parseUnits } from "viem";
import { formatWalletAddress } from "../utils/utils";
import { useEffect, useState } from "react";

interface EstimateTokenGasProps {
    readonly tokenAddress: string;
    readonly to: string;
    readonly amount: number;
    readonly formatted: string | number | undefined;
    readonly isNativeToken: boolean;
}
export const useEstimateTokenGas = ({ tokenAddress, to, amount, formatted, isNativeToken }: EstimateTokenGasProps) => {
    const { address } = useAccount(); // Lấy địa chỉ ví người gửi
    const publicClient = usePublicClient();
    const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);

    const fetchEstimateGas = async () => {
        setGasEstimate(null);
        if (!tokenAddress || !to || !publicClient 
            || isNativeToken || !isAddress(to) || !amount || amount == 0 
            || !formatted || (formatted && amount > +formatted)) return null;

        try {

            const decimals = 6;   // USDT có 6 chữ số thập phân

            // Chuyển amount sang BigInt
            const amountInWei = parseUnits(amount.toString(), decimals);

            // Mã hóa function call để tạo `data`
            const data = encodeFunctionData({
                abi: erc20Abi,
                functionName: "transfer",
                args: [formatWalletAddress(to), amountInWei], // địa chỉ nhận và số lượng token
            });

            const gas = await publicClient.estimateGas({
                account: address, // Địa chỉ gửi
                to: formatWalletAddress(tokenAddress), // Địa chỉ contract token
                data, // Truyền `data` đã encode thay vì truyền trực tiếp abi
            });

            setGasEstimate(prevGas => (prevGas !== gas ? gas : prevGas));
        } catch (err) {
            console.error("Lỗi khi ước tính gas:", err);
        }
    };

    useEffect(() => {
        fetchEstimateGas();
    }, [tokenAddress, to, amount, isNativeToken, formatted]);

    return gasEstimate;
};
