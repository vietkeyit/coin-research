import toast from "react-hot-toast";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, formatUnits, Contract } from "ethers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { UserRejectedRequestError } from "viem";
import { BadgePlus } from "lucide-react";
import { getProvider } from "../../utils/utils";
import { ERC20_ABI, USDT_CONTRACTS } from "../../utils/constants";
import { Tooltip } from "react-tooltip";

// USDT ERC20 token option
const tokenOption = {
  address: null,
  symbol: null,
  decimals: null,
  image: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=024",
};

interface AddContractProps {
  readonly setAddLoading: (open: boolean) => void;
}

/**
 * Add USDT contract to network
 * @returns
 */
const AddUSDTContract = ({ setAddLoading }: AddContractProps) => {
  const { address } = useAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();

  /**
   * kiểm tra xem mạng hiện tại có hỗ trợ USDT không
   */
  const getUSDTAddress = () => {
    if (chainId) {
      const _chainId: number = +chainId;
      return USDT_CONTRACTS[_chainId as keyof typeof USDT_CONTRACTS];
    }
    return null;
  };

  /**
   * Get USDT contract
   * @param usdtAddress
   * @param provider
   * @returns
   */
  const getTokenContract = (usdtAddress: string, provider: BrowserProvider) => {
    return new Contract(usdtAddress, ERC20_ABI, provider);
  };

  /**
   * get balance of USDT
   * @param tokenContract
   * @param address
   * @returns
   */
  const getBalance = async (tokenContract: Contract, address: string) => {
    const [symbol, decimals, balance] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.balanceOf(address),
    ]);

    return { symbol, decimals, balance };
  };

  const getRequestOptions = (
    usdtAddress: string,
    symbol: string,
    decimals: number
  ) => {
    return {
      ...tokenOption,
      address: usdtAddress,
      symbol,
      decimals,
    };
  };
  const addTokenToMetaMask = async () => {
    const provider = getProvider();

    if (!address || !walletClient || !provider) {
      console.error("Ví chưa kêt nối!");
      return;
    }

    const usdtAddress = getUSDTAddress();

    if (!usdtAddress) {
      toast.error("Mạng hiện tại không hỗ trợ USDT!");
    } else {
      try {
        setAddLoading(true);
        const tokenContract = getTokenContract(usdtAddress, provider);
        const { symbol, decimals, balance } = await getBalance(
          tokenContract,
          address
        );
        const formattedBalance = parseFloat(formatUnits(balance, decimals));
        if (formattedBalance > 0) {
          toast.error("USDT (ERC-20) đã có trong mạng!");
          return;
        }

        // Thêm token vào mạng
        // ✅ có thể dùng "type": "ERC20" ngay cả khi token đó là BEP-20 trên BSC.
        // ✅ Quan trọng nhất là địa chỉ contract trong options.address phải đúng với chain đang kết nối
        const options = getRequestOptions(
          usdtAddress,
          symbol,
          Number(decimals)
        );
        const addTokenRequested = await walletClient?.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: options,
          },
        });

        if (addTokenRequested) {
          toast.success("USDT (ERC-20) đã được thêm vào mạng thành công!");
        } else {
          toast.error("Xử lý thêm token bị hủy!");
        }
      } catch (error) {
        setAddLoading(false);
        if (error instanceof UserRejectedRequestError) {
          toast.error("Xử lý thêm token bị hủy!");
        } else {
          console.error("Đã có lỗi xảy ra khi thêm token:", error);
        }
      } finally {
        setAddLoading(false);
      }
    }
  };

  return (
    <>
      <button onClick={addTokenToMetaMask} 
        data-tooltip-id="add-contract-tooltip" data-tooltip-content="Hiện tại chỉ hỗ trợ thêm USDT">
        <BadgePlus />
        Add Token
      </button>
      <Tooltip id="add-contract-tooltip" />
    </>
  );
};

export default AddUSDTContract;
