import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVotee, setCanVote] = useState(true);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      handleProvide(provider)
      getCandidates();
      getRemainingTime();
      getCurrentStatus();
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [provider]);

  const handleProvide = () => {
    setProvider(provider);

  }

  async function vote() {
    try {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const tx = await contractInstance.vote(number);
      await tx.wait();
      canVote();
    } catch (error) {
      console.error('Error during voting:', error.message);
    }
  }

  async function canVote() {
    try {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const voteStatus = await contractInstance.voters(await signer.getAddress());
      setCanVote(voteStatus);
    } catch (error) {
      console.error('Error checking if user can vote:', error.message);
    }
  }

  async function getCandidates() {
    try {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      const candidatesList = await contractInstance.getAllVotesOfCandidates();
      const formattedCandidates = candidatesList.map((candidate, index) => ({
        index,
        name: candidate.name,
        voteCount: candidate.voteCount.toNumber()
      }));
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error.message);
    }
  }
  async function getCurrentStatus() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const status = await contractInstance.getVotingStatus();
        // Ensure the status is a boolean
        setVotingStatus(status);
    } catch (error) {
        console.error('Error checking voting status:', error.message);
    }
}


  async function getRemainingTime() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const timeBigNumber = await contractInstance.getRemainingTime();
        // Convert BigNumber to regular number or string
        const timeInSeconds = ethers.utils.formatUnits(timeBigNumber, 0);
        setRemainingTime(timeInSeconds);
    } catch (error) {
        console.error('Error fetching remaining time:', error.message);
    }
}

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setIsConnected(true);
        canVote();
      } catch (err) {
        console.error('Error connecting to Metamask:', err.message);
      }
    } else {
      console.error("Metamask is not detected in the browser");
    }
  }

  function handleNumberChange(e) {
    setNumber(e.target.value);
  }

  return (
    <div className="App">
      { votingStatus ? (
        isConnected ? (
          <Connected 
            account={account}
            candidates={candidates}
            remainingTime={remainingTime}
            number={number}
            handleNumberChange={handleNumberChange}
            voteFunction={vote}
            showButton={canVotee}
          />
        ) : (
          <Login connectWallet={connectToMetamask} />
        )
      ) : (
        <Finished />
      )}
    </div>
  );
}

export default App;
