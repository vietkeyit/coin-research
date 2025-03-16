import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { getBalance } from "wagmi/actions";
import { displayWalletAddress, formatWalletAddress } from "../utils/utils";
import { ArrowLeftRight, PlugZap, Settings, Unplug } from "lucide-react";
import ActionWallet from "./ActionWallet";
import AddUSDTContract from "./USDTToken/AddContract";
import Spinner from "../share/spinner";
import toast from "react-hot-toast";
import { formatUnits } from "viem";

export default function ConnectWailletButton() {
  const { open, close } = useAppKit();
  const { disconnect } = useDisconnect();
  const { isConnected, status, address } = useAppKitAccount();
  const { chain } = useAccount();
  const [isChangeNetwork, setIsChangeNetwork] = useState(false);
  const [isShowAction, setIsShowAction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSwitchNetwork = () => {
    open({
      view: "Networks",
      namespace: "eip155", // connect to Ethereum
    });
    setIsChangeNetwork(true);
  };

  const handleLoading = (isLoading: boolean) => {
    setIsLoading(isLoading);
  };

  const getBalanceData = async (address: string) => {
    try {
      const balance = await getBalance(config, {
        address: formatWalletAddress(address),
        chainId: chain?.id,
      });
      setBalance({
        formatted: formatUnits(balance.value, balance.decimals),
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
              <button onClick={() => setIsShowAction(true)}>
                <ArrowLeftRight />
                Transaction
              </button>
              <AddUSDTContract setAddLoading={handleLoading} />
            </div>
            <section style={{ textAlign: "left" }}>
              <p>
                <b>Địa chỉ:</b> {displayWalletAddress(address)}
              </p>
              <p>
                <b>Số dư:</b> {balance?.formatted} {balance?.symbol}
              </p>
              <p
                style={{
                  display: "flex",
                  justifyItems: "center",
                  alignItems: "center",
                }}
              >
                <b>Mạng hiện tại:&nbsp;</b> {chain?.name}
              </p>
            </section>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSwitchNetwork}>
              <Settings />
              Switch Network
            </button>
            <button onClick={handleCloseConnect}>
              <Unplug />
              Disconnect Wallet
            </button>
          </div>
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

    return (
      <ActionWallet
        setOpen={handleVisibleAction}
        setLoadingTransition={handleLoading}
      />
    );
  };

  useEffect(() => {
    if (address && status === "connected") {
      toast.success("Kết nối ví thành công", { icon: "🚀" });
      getBalanceData(address);
    }
  }, [address]);

  useEffect(() => {
    if (chain && address) {
      close();
      if (isChangeNetwork) {
        getBalanceData(address);
        toast.success(`Mạng đang active: ${chain.name}`, { icon: "🚀" });
        setIsChangeNetwork(false);
      }
    }
  }, [chain, address]);

  return (
    <div>
      {isConnected ? (
        <>
          {isShowAction ? renderActionWallet() : renderAccountInfo()}
          {isLoading && <Spinner />}
        </>
      ) : (
        <button onClick={handleConnect}>
          <PlugZap />
          Connect Wallet
        </button>
      )}
    </div>
  );
}
