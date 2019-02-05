const config = require('./config')

async function delay(ms) {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, ms)
  })
}

module.exports = {
  delay
}

