# Introduction

Ethereum transactions need to be sent along with some gas to pay for the resources it uses on the network. Gas can only be sent along with a transaction if the ethereum account signing the transaction has some ether (wei). If the QNM manages all etherum accounts, this is not a problem, however storing keys on the blockchain node is not good practice and therefore a keystore was developed. The eth-funder can fulfil this role.

The eth-funder looks at all the accounts it manages and funds accounts with insufficient balances from accounts it can unlock (with the default password) that have higher balances.

# Getting started
## Prerequisites
1. NodeJS: `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && sudo apt-get install -y nodejs`
2. keystore: https://github.com/AdharaProjects/keystore
3. blockchain-proxy: https://github.com/AdharaProjects/blockchain-proxy
4. pm2: `npm i -g pm2`
4. One etherum account in the keystore that has some ether.

## Installing
1. `git clone git@github.com:AdharaProjects/eth-funder.git && cd eth-funder`
2. `npm install`

## Running
1. `pm2 start index.js --name eth-funder`

# Configuration

All configuration can be found in the `config/` folder.
