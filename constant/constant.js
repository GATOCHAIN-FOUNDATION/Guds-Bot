const Abi = require("./Abi.json");
const GudsAbi = require("./GudsAbi.json");
const UsdtAbi = require("./UsdtAbi.json");
const ContractAddress = "0x0fDAa769e298a9f981FdACB15EF10F67De09bc22";
const GudsContractAddress = "0xF6BE664a186D645A1F799B1EfB6448A119d4EB4d";
const UsdtContractAddress = "0x55d398326f99059fF775485246999027B3197955";
const ContractABI = Abi.abi;
const GudsContractAbi = GudsAbi.abi;
const UsdtContractAbi = UsdtAbi.abi;
module.exports = {
  ContractAddress,
  ContractABI,
  UsdtContractAddress,
  GudsContractAddress,
  UsdtContractAbi,
  GudsContractAbi,
};
