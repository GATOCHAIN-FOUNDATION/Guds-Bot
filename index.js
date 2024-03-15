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

const GudsContractAddress = require("./constant/constant").GudsContractAddress;
const GudsContractAbi = require("./constant/constant").GudsContractAbi;

const UsdtContractAddress = require("./constant/constant").UsdtContractAddress;
const UsdtContractAbi = require("./constant/constant").UsdtContractAbi;

// console.log(SwapContractAbi, SwapContractAddress);

// Redirect console output to a variable
let consoleOutput = "";

// Override default console.log function to capture logs
const originalLog = console.log;
console.log = function (...args) {
  // Convert arguments to string and append to consoleOutput
  consoleOutput += args.map((arg) => arg.toString()).join(" ") + "\n\n";
  // Call original log function
  consoleOutput = consoleOutput.split("\n").slice(-60).join("\n");
  originalLog.apply(console, args);
};

// Connect to the contract
const contract = new ethers.Contract(
  SwapContractAddress,
  SwapContractAbi,
  provider
);

const usdtcontract = new ethers.Contract(
  UsdtContractAddress,
  UsdtContractAbi,
  provider
);
const gudscontract = new ethers.Contract(
  GudsContractAddress,
  GudsContractAbi,
  provider
);

// Wallet private key
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// Connect the wallet to the
const connectedContract = contract.connect(wallet);
const connectedUsdtContract = usdtcontract.connect(wallet);
const connectedGudsContract = gudscontract.connect(wallet);

async function ApproveToken1() {
  const gasPrice = await provider.getGasPrice();
  const gasPriceWithBuffer = gasPrice.mul(2);
  const approveTx1 = await connectedUsdtContract.approve(
    SwapContractAddress,
    ethers.constants.MaxUint256,
    {
      gasPrice: gasPriceWithBuffer,
    }
  );
  await approveTx1.wait();
  console.log("USDT Token Approved Sucessfully");
}
async function ApproveToken2() {
  const gasPrice = await provider.getGasPrice();
  const gasPriceWithBuffer = gasPrice.mul(2);
  const approveTx2 = await connectedGudsContract.approve(
    SwapContractAddress,
    ethers.constants.MaxUint256,
    {
      gasPrice: gasPriceWithBuffer,
    }
  );
  await approveTx2.wait();
  console.log("GUDS Token Approved Sucessfully");
}
async function ApproveTokens() {
  ApproveToken1()
    .then(() => {
      console.log("Token1 approved successfully.");

      // Then approve Token2
      ApproveToken2();
    })
    .then(() => {
      console.log("Token2 approved successfully.");
    });
}
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
  console.log(`----------------------------------------------`);
  console.log(`Reserve check initiated at ${currentDateTime}`);

  const [reserveToken1, reserveToken2] = await connectedContract.getReserves();

  const bigNumber1 = ethers.BigNumber.from(reserveToken1);
  const bigNumber2 = ethers.BigNumber.from(reserveToken2);

  // // Convert BigNumber to number
  const regularNumber1 = bigNumber1.toString();
  const regularNumber2 = bigNumber2.toString();
  const etherValue1 = ethers.utils.formatUnits(regularNumber1, 18);
  const etherValue2 = ethers.utils.formatUnits(regularNumber2, 18);
  console.log("USDT :", etherValue1, "GUDS :", etherValue2);
  const PriceofUSDT = etherValue1 / etherValue2;
  const PriceofGUDS = etherValue2 / etherValue1;

  console.log("Price of USDT : ", PriceofUSDT, "Price of GUDS : ", PriceofGUDS);

  // Check if a swap is necessary

  if (privateKey) {
    if (Number(etherValue1).toFixed(2) == Number(etherValue2).toFixed(2)) {
      console.log("Price is maintain good job");
    } else if (etherValue1 < etherValue2) {
      // console.log("swap eth2 to maintain the peg");

      const gasPrice = await provider.getGasPrice();
      const gasPriceWithBuffer = gasPrice.mul(2);

      const diff_In_Wei = ethers.BigNumber.from(regularNumber2).sub(
        ethers.BigNumber.from(regularNumber1)
      );

      // Perform division by 2
      const div_diff_In_Wei = diff_In_Wei.div(2);
      try {
        console.log("Swap amount GUDS maintain the pegg ");

        const tx = await connectedContract.swapTokenAToB(div_diff_In_Wei, {
          gasPrice: gasPriceWithBuffer,
        });
        await tx.wait();
      } catch (err) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
          console.log("BNB is required for Gas Fee ");
        } else if (err.code === "INSUFFICIENT_ALLOWANCE") {
          console.log(
            "You need to approve the token contract to spend tokens on your behalf."
          );
        } else {
          console.log("An unexpected error occurred.");
        }
      }
      console.log("Swap successful!");
    } else if (etherValue2 < etherValue1) {
      const gasPrice = await provider.getGasPrice();
      const gasPriceWithBuffer = gasPrice.mul(2);

      const diff_In_Wei = ethers.BigNumber.from(regularNumber1).sub(
        ethers.BigNumber.from(regularNumber2)
      );
      try {
        // Perform division by 2
        const div_diff_In_Wei = diff_In_Wei.div(2);
        console.log("Swap amount GUDS to maintain the peg ");

        const tx = await connectedContract.swapTokenBToA(div_diff_In_Wei, {
          gasPrice: gasPriceWithBuffer,
        });
        await tx.wait();

        console.log("Swap successful!");
      } catch (err) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
          console.log("BNB is required for Gas Fee ");
        } else if (err.code === "INSUFFICIENT_ALLOWANCE") {
          console.log(
            "You need to approve the token contract to spend tokens on your behalf."
          );
        } else {
          console.log("An unexpected error occurred.");
        }
      }
    } else {
      console.log("Reserves are balanced. No action needed.");
    }
  } else {
    console.log(
      "Private key not provided. Please set the PRIVATE_KEY environment variable."
    );
  }
}

// setInterval(checkReservesAndSwap, 100000);

// Route to trigger reserve check
app.get("/", async (req, res) => {
  const htmlResponse = `
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: black;
        display:flex;
        align-items:center;
        justify-content:center;
        flex-direction:column;
        color:#fff;
        height:100%;
        width:100%;
        overflow: hidden;
      }
      pre {
      
        padding: 10px;
        border-radius: 5px;
        overflow: auto;
        border: 1px solid rgba(255, 255, 255, 1);
        height:500px;
        width:500px;
        background-color: rgba(255, 255, 255, 0.1);
        color:#fff;
      }
      h1{

      }
    </style>

   
    <pre>${consoleOutput}</pre>
  `;
  res.send(htmlResponse);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});
