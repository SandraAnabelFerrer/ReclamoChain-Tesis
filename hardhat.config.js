require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config({ path: ".env.local" })

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Red local de desarrollo
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    // Testnet Sepolia
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
      gas: 6000000,
    },

    // Testnet Goerli (deprecado pero incluido por compatibilidad)
    goerli: {
      url: process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000,
      gas: 6000000,
    },
  },

  // Configuración de Etherscan para verificación de contratos
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
    },
  },

  // Configuración de paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // Configuración del compilador
  mocha: {
    timeout: 40000,
  },
}
