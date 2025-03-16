import { useAccount, usePublicClient } from "wagmi";
import { formatWalletAddress } from "../utils/utils";
import { useEffect, useState } from "react";
import { isAddress, parseEther } from "viem";

interface EstimateNativeGasProps {
    readonly to: string;
    readonly amount: number;
    readonly formatted: string;
    readonly isNativeToken: boolean;
}

export const useEstimateNativeGas = ({ to, amount, formatted, isNativeToken }: EstimateNativeGasProps) => {
    const { address } = useAccount(); // Lấy địa chỉ ví người gửi
    const publicClient = usePublicClient(); // Client để gọi RPC
    const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);

    const estimateGas = async () => {
        setGasEstimate(null);
        if (!to || !publicClient || !isNativeToken 
            || !isAddress(to) || !amount || amount == 0 
            || !formatted || (formatted && amount > +formatted)) return null;

        try {
            const gas = await publicClient.estimateGas({
                account: address,
                to: formatWalletAddress(to), // Địa chỉ nhận

                // parseEther chỉ dùng cho native token, không dùng cho token khác
                value: parseEther(amount.toString()), // Số lượng native token gửi đi
            });

            setGasEstimate(prevGas => (prevGas !== gas ? gas : prevGas));
        } catch (err) {
            console.error("Lỗi khi ước tính gas:", err);
        }
    };

    useEffect(() => {
        estimateGas();
    }, [to, amount, isNativeToken, formatted]);

    return gasEstimate;
};
