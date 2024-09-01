const { ethers } = require("hardhat");

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Fetch the current nonce from the provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
  const currentNonce = await provider.getTransactionCount(deployer.address, "latest");
  console.log("Current nonce:", currentNonce);

  // Get the contract factory
  const Voting = await ethers.getContractFactory("Voting");
  console.log("Contract factory for 'Voting' obtained.");

  // Deploy the contract with a unique nonce
  console.log("Starting contract deployment...");
  const Voting_ = await Voting.deploy(["Mark", "Mike", "Henry", "Rock"], 90, {
    nonce: currentNonce, // Explicitly set the nonce
    gasLimit: ethers.utils.hexlify(3000000), // Ensure you set an adequate gas limit
  });

  console.log("Waiting for contract to be deployed...");
  await Voting_.deployed(); // Wait for deployment to be mined
  console.log("Contract deployed successfully at address:", Voting_.address);

  // Log deployment details
  console.log("Deployment details:");
  console.log("Contract Address:", Voting_.address);
  console.log("Transaction Hash:", Voting_.deployTransaction.hash);
  console.log("Block Number:", await provider.getBlockNumber());
  console.log("Deployer Account Balance After Deployment:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Fetch the balance of the deployed contract
  try {
    const balance = await provider.getBalance(Voting_.address);
    console.log("Contract balance:", ethers.utils.formatEther(balance), "ETH");
  } catch (error) {
    console.error("Error fetching balance:", error.message);
  }

  // Check voting status
  try {
    const status = await Voting_.getVotingStatus();
    console.log("Current voting status (true if ongoing):", status);
  } catch (error) {
    console.error("Error checking voting status sol:", error.message);
  }

  // Check remaining time
  try {
    const remainingTime = await Voting_.getRemainingTime();
    console.log("Remaining time (in seconds):", remainingTime.toString());
  } catch (error) {
    console.error("Error fetching remaining time:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error.message);
    process.exit(1);
  });
