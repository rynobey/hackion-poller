const fs = require('fs')
const path = require('path')
const configPath = process.env.CONFIG_PATH || './config/config.json'
const configFile = fs.readFileSync(path.resolve(configPath), 'utf8')
const config = JSON.parse(configFile)

function isTextBoolean(value){
  return (value === 'false' || value === 'true')
}

function conditionalTextBooleanToBoolean(value){
  if(isTextBoolean(value)){
    return (value === 'true')
  }
  return value
}

function setOverridableDefault(overrider, defaultValue){
  if(!!overrider){
    return conditionalTextBooleanToBoolean(overrider)
  }
  return conditionalTextBooleanToBoolean(defaultValue)
}

module.exports = {
  blockchainProxyAddress: setOverridableDefault(process.env.BLOCKCHAIN_PROXY_ADDRESS, config.blockchainProxyAddress),
  tokenProxyAddress: setOverridableDefault(process.env.TOKEN_PROXY_ADDRESS, config.tokenProxyAddress),
  intervalDelay: setOverridableDefault(process.env.INTERVAL_DELAY, config.intervalDelay),
  blockchainNodeRpcAddress: setOverridableDefault(process.env.BLOCKCHAIN_NODE_RPC_ADDRESS, config.blockchainNodeRpcAddress),
  absolutePathToIonCli: setOverridableDefault(process.env.ABSOLUTE_PATH_TO_ION_CLI, config.absolutePathToIonCli),
  validatorAddress: setOverridableDefault(process.env.VALIDATOR_ADDRESS, config.validatorAddress),
  blockStoreAddress: setOverridableDefault(process.env.BLOCK_STORE_ADDRESS, config.blockStoreAddress),
  chainId: setOverridableDefault(process.env.CHAIN_ID, config.chainId),
  lastBlockStoreFile: setOverridableDefault(process.env.LAST_BLOCK_STORE_FILE, config.lastBlockStoreFile)
}

Object.defineProperty(module.exports, 'defaults', { value: config, enumerable: false })

let configToLog = Object.assign({}, module.exports)
console.log("\nDEFAULTS LOADED:", path.resolve(configPath))
console.log()
console.log("RUNNING WITH CONFIGURATION:\n")
console.log(configToLog)
console.log()

