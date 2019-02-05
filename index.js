const config = require('./config')
const util = require('./util.js')
const blockchainProxy = require('blockchain-proxy-client')({apiServerAddress: config.blockchainProxyAddress})
const keystore = require('keystore-client')({apiServerAddress: config.keystoreAddress})

async function getAccountsAndBalances(){
  const allAccounts = (await keystore.accounts()).accounts
  const accountsAndBalances = {}
  for(let account of allAccounts){
    const balance = (await blockchainProxy.etherBalance(account)).result
    accountsAndBalances[account] = Number(balance)
  }
  return accountsAndBalances
}

function getAccountsBelowMinimum(accountsAndBalances){
  let accountsBelowMinimum = {}
  for(let account in accountsAndBalances){
    if(accountsAndBalances[account] < Number(config.minimumWei)){
      accountsBelowMinimum[account] = accountsAndBalances[account]
    }
  }
  return accountsBelowMinimum
}

async function getUnlockableAccountsAboveRecommended(accountsAndBalances){
  let accountsAboveRecommended = {}
  for(let account in accountsAndBalances){
    if(accountsAndBalances[account] > Number(config.recommendedWei)){
      let unlocked = false
      try{
        unlocked = (await keystore.unlockAccount(account, config.defaultPassword))
      } catch(e){ }
      if(!!unlocked){
        accountsAboveRecommended[account] = accountsAndBalances[account]
      } else {
        console.log('Unable to unlock account:', account)
      }
    }
  }
  return accountsAboveRecommended
}

async function fundAccounts(accountsAboveRecommended, accountsBelowMinimum){
  for(let toAccount in accountsBelowMinimum){
    const toBalance = accountsBelowMinimum[toAccount]
    const transferAmount = config.recommendedWei - toBalance
    for(let fromAccount in accountsAboveRecommended){
      const fromBalance = accountsAboveRecommended[fromAccount]
      if(fromBalance > config.recommendedWei + config.minimumWei){
        await blockchainProxy.sendEther(fromAccount, toAccount, config.recommendedWei)
        accountsAboveRecommended[fromAccount] -= config.recommendedWei
        break
      }
    }
  }
}

async function run(){
  try{
    while(true){
      const accountsAndBalances = await getAccountsAndBalances()
      const accountsAboveRecommended = await getUnlockableAccountsAboveRecommended(accountsAndBalances)
      const accountsBelowMinimum = getAccountsBelowMinimum(accountsAndBalances)
      await fundAccounts(accountsAboveRecommended, accountsBelowMinimum)
      await util.delay(config.intervalDelay)
    }
  } catch (err){
    console.log('ERROR in index.js->run():', err)
    process.exit(1)
  }
}

run()
