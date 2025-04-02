import "./App.css";
import Nav from "./Nav/Nav";
import TokenPart from "./Token/Token";
import SenderTable from "./Table";
import Transfer from "./Transfer/Transfer";
import ConnectWallet from "./ConnectWallet";
import Fee from "./Fee";
import Airdrop from "./Airdrop";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("0xdAC17F958D2ee523a2206206994597C13D831ec7"); // USDT contract address
  const [wallets, setWallets] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (tokenAddress && isConnected && signer) {
      getTokenBalance();
    }
  }, [tokenAddress, isConnected, signer]);

  const getTokenBalance = async () => {
    try {
      if (!tokenAddress || !signer) return;

      const erc20ABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
      
      // Check if contract exists
      const code = await signer.provider.getCode(tokenAddress);
      if (code === "0x") {
        toast.error("Invalid token contract address");
        return;
      }

      // Get decimals with fallback
      let decimals;
      try {
        decimals = await tokenContract.decimals();
      } catch (error) {
        console.log("Using default decimals (18)");
        decimals = 18; // Most ERC20 tokens use 18 decimals
      }

      const balance = await tokenContract.balanceOf(walletAddress);
      setBalanceAmount(Number(ethers.formatUnits(balance, decimals)));
    } catch (error) {
      console.error("Error fetching token balance:", error);
      if (error.code === "BAD_DATA") {
        toast.error("Invalid token contract or network issue");
      } else {
        toast.error("Failed to fetch token balance. Please check the token address and try again.");
      }
    }
  };

  const handleConnect = async (address) => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to use this application!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setProvider(provider);
      setSigner(signer);
      setWalletAddress(address);
      setIsConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const handleAirdrop = async () => {
    if (!tokenAddress || wallets.length === 0 || quantity <= 0) {
      toast.error("Please fill in all parameters correctly!");
      return;
    }

    if (wallets.length * quantity > balanceAmount) {
      toast.error("Insufficient token balance for airdrop!");
      return;
    }

    setLoading(true);
    try {
      const erc20ABI = [
        "function transfer(address to, uint256 value) public returns (bool)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(quantity.toString(), decimals);

      for (let i = 0; i < wallets.length; i++) {
        const recipient = wallets[i];
        toast.info(`Transferring ${quantity} tokens to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
        
        const tx = await tokenContract.transfer(recipient, amount);
        await tx.wait();
        
        toast.success(`Successfully sent to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
      }
      
      toast.success("Airdrop completed successfully!");
      await getTokenBalance(); // Refresh balance after airdrop
    } catch (error) {
      console.error("Airdrop failed:", error);
      toast.error(error.message || "Airdrop failed! Check the console for more details.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <Nav />
      <div style={{ opacity: loading ? 0.5 : 1 }}>
        {loading && (
          <div className="d-flex justify-content-center align-items-center custom-loading">
            <Spinner animation="border" variant="primary" role="status" />
          </div>
        )}
        <div className="connectWallet">
          <ConnectWallet
            handleConnect={handleConnect}
            isConnected={isConnected}
            walletAddress={walletAddress}
          />
        </div>
        <div className="event">
          <SenderTable 
            wallets={wallets} 
            setWallets={setWallets} 
            isConnected={isConnected}
          />
        </div>
        <div className="main">
          <TokenPart
            tokenaddress={tokenAddress}
            setTokenAddress={setTokenAddress}
            balanceAmount={balanceAmount}
          />
          <Transfer
            quantity={quantity}
            setQuantity={setQuantity}
            totalQuantity={wallets?.length ? wallets.length * quantity : 0}
            balanceAmount={balanceAmount}
          />
          <Fee
            fee={0}
            setFee={() => {}}
            totalFee={0}
          />
        </div>
        <div className="airdrop">
          <Airdrop
            isConnected={isConnected && wallets?.length > 0}
            handleAirdrop={handleAirdrop}
          />
        </div>
      </div>
    </div>
  );
}

export default App;