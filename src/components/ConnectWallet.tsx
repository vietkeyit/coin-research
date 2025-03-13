import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useConfig } from "wagmi";
import { getBalance } from "wagmi/actions";
import { displayWalletAddress, formatWalletAddress } from "../utils/utils";
import ActionWallet from "./ActionWallet";

export default function ConnectWailletButton() {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { isConnected, status, address } = useAppKitAccount();
  const [isShowAction, setIsShowAction] = useState(false);
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
        address: formatWalletAddress(address),
      });
      setBalance({
        formatted: balance.formatted,
        symbol: balance.symbol,
      });
    } catch (error) {
      console.error("Lỗi khi lấy số dư:", error);
      toast.error("Không thể lấy số dư ví");
    }
  };

  const renderAccountInfo = () => {
    return (
      <section
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          display: "flex",
          flexDirection: isShowAction ? "row" : "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div>
            <button
              style={{ border: "1px solid #ddd" }}
              onClick={() => setIsShowAction(true)}
            >
              Action Wallet (Send)
            </button>
            <section>
              <p>Địa chỉ: {displayWalletAddress(address)}</p>
              <p>
                Số dư MATIC: {balance?.formatted} {balance?.symbol}
              </p>
            </section>
          </div>
          <button
            style={{ border: "1px solid #ddd" }}
            onClick={handleCloseConnect}
          >
            Disconnect Wallet
          </button>
        </div>
      </section>
    );
  };

  const renderActionWallet = () => {
    const handleVisibleAction = () => {
      if (address) {
        setIsShowAction(false);
        getBalanceData(address);
      }
    };
    return <ActionWallet setOpen={handleVisibleAction} />;
  };

  useEffect(() => {
    if (address && status === "connected") {
      toast.success("Kết nối ví thành công", { icon: "🚀" });
      getBalanceData(address);
    }
  }, [address]);

  return (
    <div>
      {isConnected ? (
        <>{isShowAction ? renderActionWallet() : renderAccountInfo()}</>
      ) : (
        <button style={{ border: "1px solid #ddd" }} onClick={handleConnect}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
