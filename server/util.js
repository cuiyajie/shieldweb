import hash from 'hash.js'
import config from './config/index.js'

const UNEXPECT = config.error

module.exports = {
  createHash (secret = new Date().getTime().toString()) {
    return hash.sha256().update(secret).digest('hex')
  },
  isValidKey (key) {
    if (key.toString().length !== 4) {
      return UNEXPECT.PROXY_ARGUMENTS_ERROR
    }
  },
  formatLog (proxyReq) {
    let time = new Date()
    return  `Time: ${time} Remote Path: ${proxyReq.path} Remote Method: ${proxyReq.method}`
  }
}