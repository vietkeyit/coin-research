import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { getProvider } from "../../utils/utils";
import { Contract, formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { ERC20_ABI, TOKENBYCHAIN } from "../../utils/constants";

interface TokenBalance {
  readonly tokenSymbolSelected: string | undefined;
  readonly setTokenSelected: (token: string) => void;
}

const TokenBalances = ({
  tokenSymbolSelected,
  setTokenSelected,
}: TokenBalance) => {
  const { chainId } = useAppKitNetwork();
  const { address, isConnected } = useAppKitAccount();
  const [balances, setBalances] = useState<
    { symbol: string; balance: number }[]
  >([]);
  const provider = getProvider();

  /**
   * lấy thông tin token theo mạng
   */
  const getTokenListByChain = () => {
    if (chainId) {
      const _chainId: number = +chainId;
      return TOKENBYCHAIN[_chainId as keyof typeof TOKENBYCHAIN];
    }
    return null;
  };

  const getTokenBalances = async () => {
    if (chainId === undefined || !provider) return;
    const tokenListByChain = getTokenListByChain();
    if (!tokenListByChain) return;
    for (const token of tokenListByChain) {
      const contract = new Contract(token.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(address);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      setBalances((prev) => [
        ...prev,
        {
          symbol,
          balance: +formatUnits(balance, decimals),
        },
      ]);
    }

    return balances;
  };

  const handleChangeToken = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTokenSelected(e.target.value);
  };

  useEffect(() => {
    if (isConnected && address && provider) {
      setBalances([]);
      getTokenBalances();
    }
  }, []);

  useEffect(() => {
    if (balances.length > 0) {
      setTokenSelected(balances[0].symbol);
    }
  }, [balances, address]);

  return (
    <select onChange={handleChangeToken} value={tokenSymbolSelected}>
      {balances.length === 0 ? (
        <option>Đang tải...</option>
      ) : (
        balances.map((balance, index) => (
          <option key={`${index}-${balance.symbol}`} value={balance.symbol}>
            {balance.symbol}
          </option>
        ))
      )}
    </select>
  );
};

export default TokenBalances;
