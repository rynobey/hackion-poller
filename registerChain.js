const config = require("./config")
const encoder = require('./helpers/encoder.js')
const Web3 = require("web3")
const web3 = new Web3()
const rinkeby = new Web3();
rinkeby.setProvider(new web3.providers.HttpProvider(config.blockchainNodeRpcAddress));
const Clique = require("./build/contracts/Clique.json")
const clique = new web3.eth.Contract(Clique.abi)
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress})

let VALIDATORS
let GENESIS_HASH

function getSetupBlockData() {
  const currentBlockNumber = rinkeby.eth.blockNumber()
  const genesisBlock = await rinkeby.eth.getBlock(currentBlockNumber);
  VALIDATORS = encoder.extractValidators(genesisBlock.extraData);
  GENESIS_HASH = genesisBlock.hash;
  console.log(VALIDATORS)
  console.log(GENESIS_HASH)
}

function run() {
  getSetupBlockData()
  //const registerTxData = clique.methods.register().encodeABI()
  //const registerTx = {
  //  to: config.validatorAddress,
  //  value: '0x0',
  //  gas: '0x'+Number(100000).toString(16),
  //  gasPrice: '0x0',
  //  data: registerTxData
  //}
  //await blockchainProxyClient.sendTransaction(registerTx)
  //const registerTxData = clique.methods.registerChain(config.chainId, ).encodeABI()
  //const registerTx = {
  //  to: config.validatorAddress,
  //  value: '0x0',
  //  gas: '0x'+Number(100000).toString(16),
  //  gasPrice: '0x0',
  //  data: registerTxData
  //}
  //await blockchainProxyClient.sendTransaction(registerTx)
  //await clique.RegisterChain(TESTCHAINID, VALIDATORS_B2657422, TRIG_GENESIS_HASH, storage.address);

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
