import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useConfig, /*useSwitchChain*/ } from "wagmi";
import { getBalance } from "wagmi/actions";

export default function ConnectWailletButton() {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { isConnected, status, address } = useAppKitAccount();
  const { caipNetwork, caipNetworkId, chainId } = useAppKitNetwork()
  // const { switchChain } = useSwitchChain();

  const [balance, setBalance] = useState<{
    formatted: string;
    symbol: string;
  } | null>(null);
  const config = useConfig();

  const handleConnect = () => {
    open({
      view: "Connect",
      namespace: "eip155", // connect to Ethereum
    });
  };

  const handleCloseConnect = async () => {
    await disconnect();
    toast.error("Đã ngắt kết nối ví", { icon: "🔥" });
  };

  const getBalanceData = async (address: string) => {
    try {
      const balance = await getBalance(config, {
        address: `0x${address.toString().replace(/^0x/, "")}`,
      });
      console.log(balance.formatted, balance.symbol);
      setBalance({
        formatted: balance.formatted,
        symbol: balance.symbol,
      });
    } catch (error) {
      console.error("Lỗi khi lấy số dư:", error);
      toast.error("Không thể lấy số dư ví");
    }
  };

  useEffect(() => {
    if (address && status === "connected") {
      toast.success("Kết nối ví thành công", { icon: "🚀" });
      getBalanceData(address);
    }
  }, [address]);

  useEffect(() => {
    if (chainId) {
      console.log("Switching chain to", caipNetwork, caipNetworkId, chainId);
    }
  }, [chainId]);

  return (
    <div>
      {isConnected ? (
        <>
          <div>
            <span>Địa chỉ: {address}</span>
            <div>Thông tin số dư:</div>
            <p>
              Số dư MATIC: {balance?.formatted} {balance?.symbol}
            </p>
          </div>
          <button onClick={handleCloseConnect}>Disconnect Wallet</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
