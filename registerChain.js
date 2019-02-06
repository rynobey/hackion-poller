const config = require("./config")
const encoder = require('./helpers/encoder.js')
const Web3 = require("web3")
const web3 = new Web3()
const rinkeby = new Web3();
rinkeby.setProvider(new web3.providers.HttpProvider(config.blockchainNodeRpcAddress));
const Clique = require("./build/contracts/Clique.json")
const clique = new web3.eth.Contract(Clique.abi)
const blockchainProxy2 = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress2})

let VALIDATORS
let GENESIS_HASH

const VALIDATORS_B2657422 = [
    "0x42eb768f2244c8811c63729a21a3569731535f06",
    "0x6635f83421bf059cd8111f180f0727128685bae4",
    "0x7ffc57839b00206d1ad20c69a1981b489f772031",
    "0xb279182d99e65703f0076e4812653aab85fca0f0",
    "0xd6ae8250b8348c94847280928c79fb3b63ca453e",
    "0xda35dee8eddeaa556e4c26268463e26fb91ff74f",
    "0xfc18cbc391de84dbd87db83b20935d3e89f5dd91"]

async function getSetupBlockData() {
  const currentBlockNumber = 2657422
  //const currentBlockNumber = await rinkeby.eth.getBlockNumber()
  const genesisBlock = await rinkeby.eth.getBlock(currentBlockNumber);
  //VALIDATORS = await encoder.extractValidators(genesisBlock.extraData);
  GENESIS_HASH = genesisBlock.hash;
  console.log({VALIDATORS_B2657422})
  console.log(GENESIS_HASH)
}

async function run() {
  const accounts = (await blockchainProxy2.accounts()).accounts
  await getSetupBlockData()
  //const registerTxData = clique.methods.register().encodeABI()
  //const registerTx = {
  //  from: accounts[0],
  //  to: config.validatorAddress,
  //  value: '0x0',
  //  gas: '0x'+Number(100000).toString(16),
  //  gasPrice: '0x0',
  //  data: registerTxData
  //}
  //const registerTxHash = await blockchainProxy.sendTransaction(registerTx)
  //console.log({registerTxHash})
  const registerChainTxData = clique.methods.RegisterChain(config.chainId, VALIDATORS_B2657422, GENESIS_HASH, config.blockStoreAddress).encodeABI()
  const registerChainTx = {
    from: accounts[0],
    to: config.validatorAddress,
    value: '0x0',
    gas: '0x'+Number(800000).toString(16),
    gasPrice: '0x0',
    data: registerChainTxData
  }
  const registerChainTxHash = await blockchainProxy2.sendTransaction(registerChainTx)
  console.log({registerChainTxHash})

  //// Fetch block 2657422 from rinkeby
  //const block = await rinkeby.eth.getBlock(TESTBLOCK.number);

  //const rlpHeaders = encoder.encodeBlockHeader(block);
  //const signedHeaderHash = Web3Utils.sha3(rlpHeaders.signed);
  //assert.equal(block.hash, signedHeaderHash);

  //let tx = await clique.SubmitBlock(TESTCHAINID, rlpHeaders.unsigned, rlpHeaders.signed, storage.address);
  //let event = tx.receipt.logs.some(l => { return l.topics[0] == '0x' + sha3("BlockAdded(bytes32,bytes32)") });
  //assert.ok(event, "BlockAdded event not emitted");

  //let submittedEvent = tx.logs.find(l => { return l.event == 'BlockSubmitted' });
  //let blockHash = submittedEvent.args.blockHash;
}

run()
