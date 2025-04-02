import Button from "react-bootstrap/Button";
import { useState } from "react";
import { ethers } from "ethers";

const ConnectWallet = (props) => {
  const { handleConnect, isConnected, walletAddress } = props;
  const [isLoading, setIsLoading] = useState(false);

  const connectMetaMask = async () => {
    try {
      setIsLoading(true);
      if (!window.ethereum) {
        alert("Please install MetaMask to use this application!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      handleConnect(address);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect to MetaMask. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="connect-wallet-container">
      <Button
        className={isConnected ? "btn btn-success" : "btn btn-danger"}
        onClick={connectMetaMask}
        disabled={isLoading}
      >
        <h3>
          {isLoading ? "Connecting..." : isConnected ? "Connected" : "Connect Wallet"}
        </h3>
      </Button>
      {isConnected && walletAddress && (
        <div className="wallet-address">
          <p>Connected Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;



