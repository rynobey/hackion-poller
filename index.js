const config = require('./config')
const util = require('./util.js')
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress})
const tokenProxy = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress})


async function run(){
  try{
    const tokenContractAddress = (await tokenProxy.contractAddress()).contractAddress
    console.log({tokenContractAddress})
    
  } catch (err){
    console.log('ERROR in index.js->run():', err)
    process.exit(1)
  }
}

run()
