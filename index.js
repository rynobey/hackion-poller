const config = require('./config')
const util = require('./util.js')
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress})
const tokenProxy = require('token-proxy-client')({apiServerAddress: config.tokenProxyAddress})

const mintEventList = []

async function processMintEvents(){
  const mintEvent = mintEventList.shift()
  if(!!mintEvent){
    console.log({mintEvent})
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
