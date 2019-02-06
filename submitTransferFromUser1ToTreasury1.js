const config = require('./config')
const util = require('./util.js')
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress1})
const tokenProxy = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress1})

async function run(){
  try{
    const user1 = '0x50ac843626cbe037dcf8d25b76e9db3bc7769526'
    const treasury1 = '0x9c55edd97c7f566c2b73c7b1684ecddbfd1d61a5'
    const fromAddress = user1
    const toAddress = treasury1
    const amount = 100
    const transferTx = (await tokenProxy.generateTransferTx(toAddress, amount)).rawTx
    transferTx.from = fromAddress
    const txHash = await blockchainProxy.sendTransaction(transferTx)
    console.log({txHash})
  } catch (err){
    console.log('ERROR in submitTransferFromUser1ToTreasury1.js->run():', err)
    process.exit(1)
  }
}

run()

