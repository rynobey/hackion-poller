const exec = require('child_process').exec
const fs = require("fs")
const config = require('./config')
const util = require('./util.js')
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress})
const tokenProxy = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress})

let clique
const mintEventList = []
const newBlockList = []

function setLastSubmittedBlock(block) {
  console.log({block})
  const obj = {
    blockNumber: 0
  }
  fs.writeFileSync(config.lastBlockStoreFile, JSON.stringify(obj))
}

function getLastSubmittedBlock() {
  const data = JSON.parse(fs.readFileSync(config.lastBlockStoreFile))
  console.log(data)
  return data
}

async function getProofData(txHash){
  const rpcAddress = config.blockchainNodeRpcAddress
  const pathToIonBinary = config.absolutePathToIonCli
  const cmd = `${pathToIonBinary}/ion-cli ${rpcAddress} ${txHash}`
  await exec(cmd, async function(err, stdout, stderr) {
    if(!!err) {
      console.log('Error while trying to exec ion-cli:', err)
    } else {
      const proof = stdout.substring(stdout.indexOf('0x'))
      console.log(proof)
    }
  })
}

async function processNewBlocks(){
  const newBlockEvent = newBlockList.shift()
  if(!!newBlockEvent){
    console.log(newBlockEvent)
  }
}

async function processMintEvents(){
  const mintEvent = mintEventList.shift()
  if(!!mintEvent){
    const mintEventData = JSON.parse(mintEvent.data)
    const txHash = mintEventData.contractEvent.transactionHash
    await getProofData(txHash)
  }
}

async function processMintAndNewBlockEventsPeriodically() {
  await processNewBlocks()
  await processMintEvents()
  setTimeout(processMintAndNewBlockEventsPeriodically, 100)
}

async function run(){
  try{
    //clique = await Clique.new(config.validatorAddress);
    const blockNumber = (await blockchainProxy.getBlockNumber()).blockNumber
    const tokenContractAddress = (await tokenProxy.contractAddress()).contractAddress
    const tokenContractABI = (await tokenProxy.getTokenContractABI()).abi
    const mintEventPrototype = (await tokenProxy.getMintEventPrototype()).prototype
    const filterOptions = JSON.stringify({
      filter: {},
      fromBlock: blockNumber,
      topics: [mintEventPrototype]
    })

    blockchainProxy.subscribeToContractEventsPubSub(tokenContractAddress
      , tokenContractABI, filterOptions, function(event){
      mintEventList.push(event)
    })

    blockchainProxy.subscribeToBlockNumbersPubSub(function(event) {
      newBlockList.push(event)
    })

    processMintAndNewBlockEventsPeriodically()

    setLastSubmittedBlock({})
    getLastSubmittedBlock()
    
  } catch (err){
    console.log('ERROR in index.js->run():', err)
    process.exit(1)
  }
}

run()
