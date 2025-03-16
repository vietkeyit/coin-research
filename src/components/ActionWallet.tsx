import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useGasPrice,
  useEstimateGas,
  useReadContract,
} from "wagmi";
import {
  encodeFunctionData,
  erc20Abi,
  isAddress,
  parseEther,
  parseUnits,
} from "viem";
import { displayWalletAddress, formatWalletAddress } from "../utils/utils";
import { useAppKitNetwork } from "@reown/appkit/react";
import arrowLeft from "../assets/arrow-left.svg";
import { TOKENBYCHAIN, USDT_CONTRACTS } from "../utils/constants";
import { BadgeInfo } from "lucide-react";
import { Tooltip } from "react-tooltip";
import toast from "react-hot-toast";

interface ActionWalletProps {
  readonly setOpen: (open: boolean) => void;
  readonly setLoadingTransition: (loading: boolean) => void;
}

export default function ActionWallet({
  setOpen,
  setLoadingTransition,
}: ActionWalletProps) {
  const { address } = useAccount(); // Lấy địa chỉ ví
  const data = useAppKitNetwork();

  const { chainId } = useAppKitNetwork();
  // Lấy số dư MATIC
  const { data: balanceMaticData, refetch } = useBalance({
    address,
    chainId: typeof data?.chainId === "number" ? data.chainId : undefined,
  });

  // Lấy số dư contract USDT
  const { data: balancaContractData, refetch: refetchContract } =
    useReadContract({
      abi: erc20Abi,
      address: formatWalletAddress(
        USDT_CONTRACTS[data.chainId as keyof typeof USDT_CONTRACTS]
      ),
      functionName: "balanceOf",
      args: [formatWalletAddress(address)], // Lấy số dư của user
      chainId: typeof data?.chainId === "number" ? data.chainId : undefined,
    });

  const {
    data: txData,
    sendTransaction,
    status: sendTransactionStatus,
  } = useSendTransaction();
  const { data: gasPrice } = useGasPrice();

  // balaceData common
  const [balanceData, setBalanceData] = useState<
    | {
        decimals: number;
        formatted: string;
        symbol: string;
        value: bigint;
      }
    | undefined
  >();
  const [isShowTokenBalances, setIsShowTokenBalances] = useState(false);
  const [toAddress, setToAddress] = useState(""); // Địa chỉ nhận
  const [amount, setAmount] = useState(0); // Số lượng MATIC
  const [error, setError] = useState(""); // Lỗi
  const [isNativeToken, setIsNativeToken] = useState(true); // Token mặc định là MATIC
  const [tokenSelected, setTokenSelected] = useState<string>();

  const isReady =
    toAddress &&
    amount &&
    address &&
    USDT_CONTRACTS[data.chainId as keyof typeof USDT_CONTRACTS];

  // Nếu chưa đủ điều kiện, không truyền `data`
  const getDataERC20EstimateGas = () => {
    return isReady
      ? encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [
            formatWalletAddress(toAddress),
            parseUnits(amount.toString(), 6),
          ],
        })
      : undefined;
  };

  const { data: gasEstimate } = useEstimateGas({
    account: address,
    to: isNativeToken
      ? formatWalletAddress(toAddress)
      : formatWalletAddress(
          USDT_CONTRACTS[data.chainId as keyof typeof USDT_CONTRACTS]
        ),
    value: isNativeToken ? parseEther(Number(amount).toFixed(18)) : undefined,
    data: isNativeToken ? undefined : getDataERC20EstimateGas(),
  });

  // Theo dõi giao dịch sau khi gửi
  const { isSuccess, isError, isLoading } = useWaitForTransactionReceipt({
    hash: txData,
  });

  /**
   * kiểm tra số dư có đủ không
   * @param value
   */
  const checkBalanceEnough = (value: string) => {
    // số dư không đủ
    if (balanceData && parseFloat(balanceData?.formatted) < parseFloat(value)) {
      return false;
    } else {
      return true;
    }
  };

  /**
   * Thay đổi số lượng token gửi
   * @param e
   */
  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isEnough = checkBalanceEnough(value);
    if (isEnough) {
      setError("");
    } else {
      setError("Số dư không đủ");
    }

    setAmount(+value);
  };

  const handleSend = () => {
    if (error) {
      return;
    }

    // Gửi giao dịch cho token native hoặc token khác
    if (isNativeToken) {
      sendTransaction({
        to: formatWalletAddress(toAddress),
        value: parseEther(amount.toString()), // Chuyển đổi số MATIC sang wei
      });
    } else {
      const encodeData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [
          formatWalletAddress(toAddress),
          parseUnits(amount.toString(), 6),
        ], // USDT có 6 decimal, POL có 18 decimal
      });

      sendTransaction({
        to: formatWalletAddress(
          USDT_CONTRACTS[data.chainId as keyof typeof USDT_CONTRACTS]
        ), // Gửi đến contract của token
        data: encodeData, // Chứa calldata để gọi hàm transfer
      });
    }
  };

  const renderBalanceStatus = () => {
    if (!balanceData || !isShowTokenBalances) {
      return "Đang tải...";
    }

    return balanceData.formatted + " " + balanceData.symbol;
  };

  const getFormatContractBalance = (balance: bigint | undefined) => {
    return {
      decimals: 6,

      // deprecated but need to refactor
      formatted: (Number(balance) / 10 ** 6).toString(),
      symbol: "USDT",
      value: balance ? BigInt(balance) : BigInt(0),
    };
  };

  const handleChangeToken = (_tokenSelected: string) => {
    setIsShowTokenBalances(false);
    setTokenSelected(_tokenSelected);
    if (_tokenSelected === "USDT") {
      const _balanceContratData = getFormatContractBalance(balancaContractData);
      setBalanceData(_balanceContratData);
      setIsShowTokenBalances(true);
      setIsNativeToken(false);
    } else {
      setBalanceData(balanceMaticData);
      setIsShowTokenBalances(true);
      setIsNativeToken(true);
    }
  };

  const refetchBalance = () => {
    if (isNativeToken) {
      refetch(); // Cập nhật số dư sau giao dịch
    } else {
      refetchContract(); // Cập nhật số dư USDT sau giao dịch
    }
  };

  /**
   * lấy thông tin token theo mạng
   */
  const getTokenListByChain = () => {
    if (chainId) {
      const _chainId: number = +chainId;
      return TOKENBYCHAIN[_chainId as keyof typeof TOKENBYCHAIN];
    }
    return [];
  };

  useEffect(() => {
    if (address) {
      const balances = getTokenListByChain();
      if (balances.length > 0) {
        handleChangeToken(balances[0].name);
      }
    }
  }, [address]);

  useEffect(() => {
    const isEnough = checkBalanceEnough(amount.toString());
    if (!isEnough) {
      setError("Số dư không đủ");
      return;
    }

    if (balanceData && gasEstimate && gasPrice && balanceMaticData) {
      const estimatedGasFee = gasEstimate * gasPrice; // Tính phí gas

      // Xác định tổng chi phí cần thanh toán
      const totalCost = isNativeToken
        ? parseEther(amount.toString()) + estimatedGasFee
        : estimatedGasFee;

      // Kiểm tra xem số dư native token có đủ không(cần so sánh với số dư MATIC)
      const isInvalidGasFee = balanceMaticData.value < totalCost;
      setError(isInvalidGasFee ? "Không đủ tiền thanh toán phí gas" : "");
    }
  }, [balanceData, gasEstimate, gasPrice, balanceMaticData]);

  // Theo dõi khi giao dịch thành công
  useEffect(() => {
    if (isSuccess) {
      toast.success(`Giao dịch thành công!`);
      refetchBalance();
      setToAddress("");
      setAmount(0);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error(`Giao dịch thất bại!`);
      refetchBalance();
    }
  }, [isError]);

  useEffect(() => {
    if (sendTransactionStatus === "pending") {
      setLoadingTransition(true);
    } else {
      setLoadingTransition(false);
    }
  }, [sendTransactionStatus]);

  useEffect(() => {
    if (balanceMaticData && isNativeToken) {
      setBalanceData(balanceMaticData);
    }
  }, [balanceMaticData, isNativeToken]);

  useEffect(() => {
    if (balancaContractData && !isNativeToken) {
      const _balanceContratData = getFormatContractBalance(balancaContractData);
      setBalanceData(_balanceContratData);
    }
  }, [balancaContractData, isNativeToken]);

  // khi thay đổi địa chỉ thì cập nhật số dư MATIC và load nó lên
  useEffect(() => {
    if (address) {
      setBalanceData(balanceMaticData);
    }
  }, [address]);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        minWidth: "300px",
        margin: "auto",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            marginTop: 0,
          }}
        >
          <img src={arrowLeft} alt="back_button" width={24} height={24} />
        </button>
        <div
          style={{ marginTop: 0, marginBottom: 5, fontSize: 20, width: "100%" }}
        >
          <strong style={{ marginRight: 25 }}>Giao dịch</strong>
        </div>
      </div>
      <div
        style={{
          padding: "0 20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p style={{ display: "flex", justifyContent: "center", gap: 5 }}>
          <b>Thông tin gửi</b>
          <BadgeInfo
            data-tooltip-id="transaction-tooltip"
            data-tooltip-content="Có thể giao dịch với USDT"
          />
        </p>
        <p style={{ textAlign: "left", marginTop: 0, marginBottom: 5 }}>
          <strong>Nguồn: </strong>
          {address ? displayWalletAddress(address) : "Chưa kết nối"}
          <br />
          <strong>Token: </strong>
          <select
            value={tokenSelected}
            onChange={(e) => handleChangeToken(e.target.value)}
            disabled={isLoading}
          >
            {getTokenListByChain().map((balance, index) => (
              <option key={`${index}-${balance.name}`} value={balance.name}>
                {balance.name}
              </option>
            ))}
          </select>
        </p>
        <span style={{ textAlign: "left" }}>
          <b>Số dư: </b>
          {renderBalanceStatus()}
        </span>
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>
      <div
        style={{
          padding: "0 20px",
          marginTop: "10px",
          marginBottom: "10px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p>
          <b>Thông tin nhận</b>
        </p>
        <input
          type="text"
          placeholder="Nhập địa chỉ nhận"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          style={{ padding: "8px" }}
          disabled={isLoading}
        />
        {toAddress && !isAddress(toAddress) && (
          <span style={{ color: "red", marginTop: "2px", fontSize: 12 }}>
            Địa chỉ không hợp lệ
          </span>
        )}
        <input
          type="number"
          value={amount}
          min={0}
          disabled={isLoading}
          onChange={handleChangeAmount}
          style={{ margin: "10px 0", padding: "8px" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <button
          onClick={handleSend}
          disabled={isLoading || !!error}
          style={{
            width: "100%",
            padding: "10px",
            background: "blue",
            color: "white",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Đang gửi..." : "Gửi"}
        </button>
        <button
          style={{
            width: "100%",
            padding: "10px",
            background: "gray",
            color: "white",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
          onClick={() => setOpen(false)}
        >
          Hủy
        </button>
      </div>
      <Tooltip id="transaction-tooltip" />
    </div>
  );
}
