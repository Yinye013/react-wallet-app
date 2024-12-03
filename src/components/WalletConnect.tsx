import React, { useState } from "react";
import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const connectWallet = async (): Promise<void> => {
    try {
      console.log("| Connect Wallet Button Clicked");

      // metamask check
      if (!window.ethereum) {
        alert(
          "MetaMask is required to connect a wallet! Please install MetaMask."
        );
        console.error("MetaMask is not installed or not detected.");
        return;
      }
      console.log("MetaMask detected:", window.ethereum);

      // start web3 instance
      const web3 = new Web3(window.ethereum);
      console.log("Web3 initialized:", web3);

      //connect account wallet
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Accounts retrieved:", accounts);

      if (accounts.length === 0) {
        console.warn("No accounts found.");
        return;
      }

      const account = accounts[0];
      console.log("Connected account:", account);
      setWalletAddress(account);

      //fetch balance
      const balanceInWei = await web3.eth.getBalance(account);
      console.log("Balance in Wei:", balanceInWei);

      const balanceInEther = web3.utils.fromWei(balanceInWei, "ether");
      console.log("Balance in Ether:", balanceInEther);
      setBalance(balanceInEther);

      // add event listener for account change
      window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
        console.log("Accounts changed:", newAccounts);

        if (newAccounts.length === 0) {
          alert("Please connect a wallet.");
          setWalletAddress(null);
          setBalance(null);
        } else {
          const newAccount = newAccounts[0];
          console.log("New connected account:", newAccount);
          setWalletAddress(newAccount);

          web3.eth.getBalance(newAccount).then((newBalanceInWei) => {
            console.log("New balance in Wei:", newBalanceInWei);

            const newBalanceInEther = web3.utils.fromWei(
              newBalanceInWei,
              "ether"
            );
            console.log("New balance in Ether:", newBalanceInEther);
            setBalance(newBalanceInEther);
          });
        }
      });
    } catch (error: any) {
      if (error.code === 4001) {
        console.error("User denied wallet connection.");
      } else {
        console.error("Error connecting wallet:", error);
      }
    }
  };

  // application UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="px-6 py-3 text-2xl uppercase bg-[#F5841F] text-white rounded-md transition-all duration-300 hover:bg-[#DD771C]"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="bg-white shadow-lg text-2xl py-4 px-8 w-[30%] h-[50%] rounded-[9px]">
          <p className="text-2xl font-semibold">Wallet Address:</p>
          <p className="text-gray-700 break-all text-xl">{walletAddress}</p>
          <p className="mt-4 text-xl font-semibold">ETH Balance:</p>
          <p className="text-gray-700">{balance} ETH</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
