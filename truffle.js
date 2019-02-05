const KeystoreProvider = require("keystore-provider")
const URL = require('url').URL
const config = require("./config")
const blockchainNodeRpcAddress = new URL(config.blockchainNodeRpcAddress)
const keystoreProvider = new KeystoreProvider(
  config.keystoreAddress,
  config.blockchainNodeRpcAddress
)

module.exports = {
  networks: {
    from_env: {
      host: blockchainNodeRpcAddress.host,
      port: blockchainNodeRpcAddress.port,
      network_id: config.blockchainNodeNetId,
      gasPrice: config.blockchainNodeGasPrice
    },
    keystore_provider: {
      provider: keystoreProvider,
      network_id: config.blockchainNodeNetId,
      gasPrice: config.blockchainNodeGasPrice
    }
  },
  solc: {
    optimizer: {
      enabled: true,
        runs: 200
    }
  }
}
