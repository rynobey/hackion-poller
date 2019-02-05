const exec = require('child_process').exec
const config = require('./config')
const util = require('./util.js')
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress})
const tokenProxy = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress})

const mintEventList = []

async function getProofData(txHash){
  const rpcAddress = config.blockchainNodeRpcAddress
  const pathToIonBinary = config.absolutePathToIonCli
  const cmd = `${pathToIonBinary}/ion-cli ${rpcAddress} ${txHash}`
  await exec(cmd, async function(err, stdout, stderr) {
    if(!!err) {
      console.log(`Error while trying to get git log of ${name}: ${err}`)
    } else {
      const proof = stdout.substring(stdout.indexOf('0x'))
      console.log(proof)
    }
  })
}

async function processMintEvents(){
  const mintEvent = mintEventList.shift()
  if(!!mintEvent){
    const mintEventData = JSON.parse(mintEvent.data)
    const txHash = mintEventData.contractEvent.transactionHash
    getProofData(txHash)
  }
}

async function run(){
  try{
    const tokenContractAddress = (await tokenProxy.contractAddress()).contractAddress
    const tokenContractABI = (await tokenProxy.getTokenContractABI()).abi
    const mintEventPrototype = (await tokenProxy.getMintEventPrototype()).prototype
    const filterOptions = JSON.stringify({
      filter: {},
      fromBlock: 0,
      topics: [mintEventPrototype]
    })

    blockchainProxy.subscribeToContractEventsPubSub(tokenContractAddress
      , tokenContractABI, filterOptions, function(event){
      mintEventList.push(event)
    })

    while(true){
      await processMintEvents()
      await util.delay(100)
    }
    
  } catch (err){
    console.log('ERROR in index.js->run():', err)
    process.exit(1)
  }
}

run()
