const exec = require('child_process').exec
const Web3 = require("web3")
const web3 = new Web3()
const fs = require("fs")
const config = require('./config')
const util = require('./util.js')
const blockchainProxy1 = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress1})
const tokenProxy1 = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress1})
const blockchainProxy2 = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress2})
const tokenProxy2 = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress2})
const Clique = require("./build/contracts/Clique.json")
const clique = new web3.eth.Contract(Clique.abi)

let submittingSkippedBlocks = false
let processingSkippedMintEvents = false
const mintEventList = []
const newBlockList = []

function setLastSubmittedBlock(blockNumber) {
  const obj = {
    blockNumber
  }
  fs.writeFileSync(config.lastBlockStoreFile, JSON.stringify(obj))
}

function getLastSubmittedBlock() {
  const data = JSON.parse(fs.readFileSync(config.lastBlockStoreFile))
  return data
}

async function getSignedBlockHeader(blockNumber) {
  return new Promise(function(resolve, reject) {
    const rpcAddress = config.blockchainNodeRpcAddress
    const pathToIonBinary = config.absolutePathToIonCli
    const cmd = `${pathToIonBinary}/ion-cli ${rpcAddress} getBlockByNumber_Clique ${blockNumber} signed`
    exec(cmd, async function(err, stdout, stderr) {
      if(!!err) {
        console.log('Error while trying to exec ion-cli:', err)
      } else {
        const signedHeader = stdout
        resolve(signedHeader)
      }
    })
  })
}

async function getUnsignedBlockHeader(blockNumber) {
  return new Promise(function(resolve, reject) {
    const rpcAddress = config.blockchainNodeRpcAddress
    const pathToIonBinary = config.absolutePathToIonCli
    const cmd = `${pathToIonBinary}/ion-cli ${rpcAddress} getBlockByNumber_Clique ${blockNumber} unsigned`
    exec(cmd, async function(err, stdout, stderr) {
      if(!!err) {
        console.log('Error while trying to exec ion-cli:', err)
      } else {
        const unsignedHeader = stdout
        resolve(unsignedHeader)
      }
    })
  })
}

async function getProofData(txHash){
  const rpcAddress = config.blockchainNodeRpcAddress
  const pathToIonBinary = config.absolutePathToIonCli
  const cmd = `${pathToIonBinary}/ion-cli ${rpcAddress} getProof ${txHash}`
  await exec(cmd, async function(err, stdout, stderr) {
    if(!!err) {
      console.log('Error while trying to exec ion-cli:', err)
    } else {
      const proof = stdout.substring(stdout.indexOf('0x'))
      console.log(proof)
    }
  })
}

async function submitSkippedBlocks(blockNumberStart, blockNumberEnd) {
  const accounts = (await blockchainProxy2.accounts()).accounts
  submittingSkippedBlocks = true
  for (let i = blockNumberStart; i < blockNumberEnd; i++) {
    const signedHeader = await getSignedBlockHeader(i)
    const unsignedHeader = await getUnsignedBlockHeader(i)
    const submitBlockTxData = clique.methods.SubmitBlock(config.chainId, unsignedHeader, signedHeader, config.blockStoreAddress).encodeABI()
    const submitBlockTx = {
      from: accounts[0],
      to: config.validatorAddress,
      value: '0x0',
      gas: '0x'+Number(800000).toString(16),
      gasPrice: '0x0',
      data: submitBlockTxData
    }
    const submitBlockTxHash = await blockchainProxy2.sendTransaction(submitBlockTx)
    console.log({submitBlockTxHash})
    setLastSubmittedBlock(i)
    const lastBlock = getLastSubmittedBlock()
    console.log({lastBlock})
  }
  submittingSkippedBlocks = false
}

async function processNewBlocks(){
  const newBlockEvent = newBlockList.shift()
  if(!!newBlockEvent){
    const blockNumber = JSON.parse(newBlockEvent.data).blockNumber
    const prevBlockNumber = getLastSubmittedBlock().blockNumber
    if (blockNumber > prevBlockNumber + 1) {
      const blockNumberStart = prevBlockNumber + 1
      const blockNumberEnd = blockNumber
      submitSkippedBlocks(blockNumberStart, blockNumberEnd)
    } else {
      console.log(newBlockEvent)
      console.log(await getSignedBlockHeader(blockNumber))
      console.log(await getUnsignedBlockHeader(blockNumber))
    }
  }
}

async function processSkippedMintEvents() {
  processingSkippedMintEvents = true
  while (mintEventList.length > 0) {
    const mintEvent = mintEventList.shift()
    if(!!mintEvent){
      const mintEventData = JSON.parse(mintEvent.data)
      const txHash = mintEventData.contractEvent.transactionHash
      // submit verifyAndTransfer tx here
      await getProofData(txHash)
    }
  }
  processingSkippedMintEvents = false
}

async function processMintEvents(){
  if (mintEventList.length > 1) {
    processSkippedMintEvents()
  } else {
    const mintEvent = mintEventList.shift()
    if(!!mintEvent){
      const mintEventData = JSON.parse(mintEvent.data)
      const txHash = mintEventData.contractEvent.transactionHash
      // submit verifyAndTransfer tx here
      await getProofData(txHash)
    }
  }
}

async function processMintAndNewBlockEventsPeriodically() {
  if (!submittingSkippedBlocks && !processingSkippedMintEvents) {
    await processNewBlocks()
    await processMintEvents()
  }
  setTimeout(processMintAndNewBlockEventsPeriodically, 500)
}

async function run(){
  try{
    //clique = await Clique.new(config.validatorAddress);
    const blockNumber = (await blockchainProxy1.getBlockNumber()).blockNumber
    const tokenContractAddress = (await tokenProxy1.contractAddress()).contractAddress
    const tokenContractABI = (await tokenProxy1.getTokenContractABI()).abi
    const mintEventPrototype = (await tokenProxy1.getMintEventPrototype()).prototype
    const filterOptions = JSON.stringify({
      filter: {},
      fromBlock: blockNumber,
      topics: [mintEventPrototype]
    })

    blockchainProxy1.subscribeToContractEventsPubSub(tokenContractAddress
      , tokenContractABI, filterOptions, function(event){
      //wait for block to be added first
      setTimeout(function() {
        mintEventList.push(event)
      }, 7000)
    })

    blockchainProxy1.subscribeToBlockNumbersPubSub(function(event) {
      //wait for infura to make the new block available
      setTimeout(function() {
        newBlockList.push(event)
      }, 5000)
    })

    processMintAndNewBlockEventsPeriodically()
  } catch (err){
    console.log('ERROR in index.js->run():', err)
    process.exit(1)
  }
}

run()
