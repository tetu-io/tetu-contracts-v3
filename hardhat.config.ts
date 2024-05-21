import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [vars.get("PRIVATE_KEY"),],
    },
  },
  etherscan: {
    apiKey: vars.get("ETHERSCAN_API_KEY"),
  },
};

export default config;
