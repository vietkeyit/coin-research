import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useEstimateGas,
  useGasPrice,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { isAddress, parseEther } from "viem";
import { displayWalletAddress, formatWalletAddress } from "../utils/utils";
import Spinner from "../share/spinner";

interface ActionWalletProps {
  readonly setOpen: (open: boolean) => void;
}

export default function ActionWallet({ setOpen }: ActionWalletProps) {
  const { address } = useAccount(); // Lấy địa chỉ ví
  const { data: balanceData, refetch } = useBalance({ address }); // Lấy số dư MATIC

  const [toAddress, setToAddress] = useState(""); // Địa chỉ nhận
  const [amount, setAmount] = useState(0); // Số lượng MATIC
  const [statusMessage, setStatusMessage] = useState(""); // Thông báo trạng thái
  const [error, setError] = useState(""); // Lỗi
  const {
    data: txData,
    sendTransaction,
    status: sendTransactionStatus,
  } = useSendTransaction();
  const { data: gasPrice } = useGasPrice();

  // Ước tính phí gas
  const { data: gasEstimate } = useEstimateGas(
    toAddress && isAddress(toAddress)
      ? {
          to: formatWalletAddress(toAddress),
          value: amount ? parseEther(amount.toString()) : BigInt(0),
        }
      : undefined
  );

  // Theo dõi giao dịch sau khi gửi
  const { isSuccess, isError, isLoading } = useWaitForTransactionReceipt({
    hash: txData,
  });

  const isLoadingSendTransaction = sendTransactionStatus === "pending";
  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // số dư không đủ
    if (balanceData && parseFloat(balanceData?.formatted) < parseFloat(value)) {
      setError("Số dư không đủ");
    } else {
      setError("");
    }

    setAmount(+value);
  };

  const handleSend = () => {
    if (error) {
      return;
    }

    // Gửi giao dịch
    sendTransaction({
      to: formatWalletAddress(toAddress),
      value: parseEther(amount.toString()), // Chuyển đổi số MATIC sang wei
    });
  };

  useEffect(() => {
    if (balanceData && gasEstimate && gasPrice) {
      const estimatedGasFee = gasEstimate * gasPrice; // Tính phí gas

      // Kiểm tra xem số dư có đủ không (tổng chi phí = số tiền gửi + phí gas)
      const totalCost = parseEther(amount.toString()) + estimatedGasFee;
      const isInvalidGasFee = balanceData.value < totalCost;
      setError(isInvalidGasFee ? "Không đủ tiền thanh toán phí gas" : "");
    }
  }, [balanceData, gasEstimate, gasPrice]);

  // Theo dõi khi giao dịch thành công
  useEffect(() => {
    if (isSuccess) {
      setStatusMessage(`✅ Giao dịch thành công!`);
      refetch(); // Cập nhật số dư sau giao dịch
      setToAddress("");
      setAmount(0);
    }
  }, [isSuccess, txData]);

  useEffect(() => {
    if (isError) {
      setStatusMessage(`❌ Giao dịch thất bại!`);
      refetch(); // Cập nhật số dư sau giao dịch
    }
  }, [isError]);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
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
          <img
            src="../src/assets/arrow-left.svg"
            alt="back_button"
            width={24}
            height={24}
          />
        </button>
        <div
          style={{ marginTop: 0, marginBottom: 5, fontSize: 20, width: "100%" }}
        >
          <strong style={{ marginRight: 25 }}>Gửi MATIC</strong>
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
        <p>
          <b>Thông tin gửi</b>
        </p>
        <p style={{ textAlign: "left", marginTop: 0 }}>
          <strong>Nguồn:</strong>{" "}
          {address ? displayWalletAddress(address) : "Chưa kết nối"}
          <br />
          <strong>Số dư:</strong> {balanceData?.formatted} {balanceData?.symbol}
        </p>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
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
      {isSuccess && (
        <p style={{ color: "green", marginTop: "10px" }}>{statusMessage}</p>
      )}
      {isError && (
        <p style={{ color: "red", marginTop: "10px" }}>{statusMessage}</p>
      )}
      {isLoadingSendTransaction && <Spinner />}
    </div>
  );
}
