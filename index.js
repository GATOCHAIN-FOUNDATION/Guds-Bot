// app.js
const express = require("express");
const ethers = require("ethers");
const app = express();
require("dotenv").config();
const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
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
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// Connect the wallet to the
const connectedContract = contract.connect(wallet);

// Function to check reserves and perform swap if necessary
async function checkReservesAndSwap() {
  const currentDateTime = new Date().toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`Reserve check initiated at ${currentDateTime}`);
  const [reserveToken1, reserveToken2] = await connectedContract.getReserves();

  const bigNumber1 = ethers.BigNumber.from(reserveToken1);
  const bigNumber2 = ethers.BigNumber.from(reserveToken2);

  // // Convert BigNumber to number
  const regularNumber1 = bigNumber1.toString();
  const regularNumber2 = bigNumber2.toString();
  const etherValue1 = ethers.utils.formatUnits(regularNumber1, 18);
  const etherValue2 = ethers.utils.formatUnits(regularNumber2, 18);
  console.log("Token A :", etherValue1, "Token B :", etherValue2);
  const gasPrice = await provider.getGasPrice();
  const gasPriceWithBuffer = gasPrice.mul(2);
  const PriceofUSDT = etherValue1 / etherValue2;
  const PriceofGUDS = etherValue2 / etherValue1;
  console.log("Price of USDT : ", PriceofUSDT, "Price of GUDS : ", PriceofGUDS);

  // Check if a swap is necessary

  if (privateKey) {
    if (Number(etherValue1).toFixed(14) == Number(etherValue2).toFixed(14)) {
      console.log("Price is maintain good job");
    } else if (etherValue1 < etherValue2) {
      console.log("swap eth2 to maintain the peg");

      const diff_In_Wei = ethers.BigNumber.from(regularNumber2).sub(
        ethers.BigNumber.from(regularNumber1)
      );

      // Perform division by 2
      const div_diff_In_Wei = diff_In_Wei.div(2);

      console.log(
        "Swap that amount eth2 to maintain the pegg ",
        div_diff_In_Wei,
        "Div In Wei",
        div_diff_In_Wei
      );

      const tx = await connectedContract.swapTokenAToB(div_diff_In_Wei, {
        gasPrice: gasPriceWithBuffer,
      });
      await tx.wait();
      console.log("Swap successful!");
    } else if (etherValue2 < etherValue1) {
      console.log("swap eth1 to maintain the peg");

      const diff_In_Wei = ethers.BigNumber.from(regularNumber1).sub(
        ethers.BigNumber.from(regularNumber2)
      );

      // Perform division by 2
      const div_diff_In_Wei = diff_In_Wei.div(2);
      console.log(
        "Swap that amount eth1 to maintain the pegg ",
        "Diff In Wei",
        div_diff_In_Wei,
        "Div In Wei",
        div_diff_In_Wei
      );

      const tx = await connectedContract.swapTokenBToA(div_diff_In_Wei, {
        gasPrice: gasPriceWithBuffer,
      });
      await tx.wait();
      console.log("Swap successful!");
    } else {
      console.log("Reserves are balanced. No action needed.");
    }
  } else {
    console.log(
      "Private key not provided. Please set the PRIVATE_KEY environment variable."
    );
  }
}

setInterval(checkReservesAndSwap, 10000);

// Route to trigger reserve check
app.get("/", async (req, res) => {
  res.send("Reserve check initiated.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});
