const config = require('./config')
const util = require('./util.js')
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress})
const tokenProxy = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress})

async function run(){
  try{
    const fromAddress = '0x58612ff5016b53c85de29b9bdcfd0f84c9822751'
    const toAddress = '0x58612ff5016b53c85de29b9bdcfd0f84c9822751'
    const amount = 1
    const cbsTxId = new Date().getTime()
    const mintTransaction = (await tokenProxy.generateMintTx(toAddress, cbsTxId, amount)).rawTx
    mintTransaction.from = fromAddress
    const txHash = await blockchainProxy.sendTransaction(mintTransaction)
    return txHash
  } catch (err){
    console.log('ERROR in submitNewMintTransaction.js->run():', err)
    process.exit(1)
  }
}

module.exports = run
