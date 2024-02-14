// app.js
const express = require("express");
const ethers = require("ethers");
const app = express();

const provider = new ethers.providers.JsonRpcProvider(
  "https://data-seed-prebsc-1-s1.binance.org:8545"
);

const SwapContractAddress = require("./constant/constant").ContractAddress;
const SwapContractAbi = require("./constant/constant").ContractABI;

// console.log(SwapContractAbi, SwapContractAddress);

// Connect to the contract
const contract = new ethers.Contract(
  SwapContractAddress,
  SwapContractAbi,
  provider
);

// Wallet private key
const privateKey =
  "8205f757a2abc40c66888b9f293f0020fb9388919427bb201f6746e0fbf054ac";
const wallet = new ethers.Wallet(privateKey, provider);

// Connect the wallet to the
const connectedContract = contract.connect(wallet);

// Function to check reserves and perform swap if necessary
async function checkReservesAndSwap() {
  const [reserveA, reserveB] = await connectedContract.getReserves();

  console.log("Reserve of Token A:", reserveA.toString());
  console.log("Reserve of Token B:", reserveB.toString());

  // Check if a swap is necessary
  if (reserveA < reserveB) {
    console.log(
      "Reserve of Token A is less than Reserve of Token B. Swapping Token B to Token A..."
    );
    const amountIn = reserveB - reserveA; // Amount to swap from Token B to Token A
    const tx = await connectedContract.swapTokenBToA(amountIn);
    await tx.wait();
    console.log("Swap successful!");
  } else if (reserveB < reserveA) {
    console.log(
      "Reserve of Token B is less than Reserve of Token A. Swapping Token A to Token B..."
    );
    const amountIn = reserveA - reserveB; // Amount to swap from Token A to Token B
    const tx = await connectedContract.swapTokenAToB(amountIn);
    await tx.wait();
    console.log("Swap successful!");
  } else {
    console.log("Reserves are balanced. No action needed.");
  }
}

// checkReservesAndSwap();

// Route to trigger reserve check
app.get("/", async (req, res) => {
  res.send("Reserve check initiated.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
