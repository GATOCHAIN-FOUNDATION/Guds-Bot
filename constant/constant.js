const Abi = require("./Abi.json");
const GudsAbi = require("./GudsAbi.json");
const UsdtAbi = require("./UsdtAbi.json");
const ContractAddress = "0x11a7084b398D4fC941827E3e71a1169608A4F8a5";
const GudsContractAddress = "0xe8deca18c1f09274b6adb2510ae238bbca9408ab";
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
