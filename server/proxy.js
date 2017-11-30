import URL from 'url'
import PATH from 'path'
import fs from 'fs'
// import mongoose from 'mongoose'
import bodyParse from 'co-body'
import httpProxy from 'http-proxy'
import password from './password.js'
import config from './config/index.js'
import InvitationCode from './models/invitation_code'
import { createHash, isValidKey, formatLog } from './util.js'

// mongoose.Promise = global.Promise
// mongoose.connect(config.database)

const passwordList = password()

let isVerify = 1 // 1 -> 审核中   2 -> 审核结束
const specialCode = 'ASDF'

const API_ID = config.api_id
const API_SECRET = config.api_secret
const allowPostPath = config.allowPostPath
const UNEXPECT = config.error

const proxy = httpProxy.createProxyServer({})

const mimeTypes = {
  "html": "text/html",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "js": "text/javascript",
  "css": "text/css"};

const auth = async function(key) {
  const keyInfo = await InvitationCode.findOneByCode(key)
  return keyInfo && keyInfo._id ? keyInfo._id : null
}

const setHttpHead = function(res) {
  return function(status, type = 'application/json; charset=utf-8') {
    return res.writeHead(status, { 'Content-Type': type })
  }
}

proxy.on('proxyReq', function(proxyReq, req, res) {
  if (proxyReq.path === '/favicon.ico') return
  console.log(formatLog(proxyReq))
  const uri = URL.parse(proxyReq.path)
  // const path = `${uri.pathname}?api_id=${API_ID}&api_secret=${API_SECRET}`
  const path = uri.pathname

  if (proxyReq.method === 'GET' || (proxyReq.method === 'POST' && allowPostPath.indexOf(uri.pathname) !== -1)) {
    proxyReq.path = path
  }

  const refer = proxyReq.getHeader('Referer');
  if (refer && refer.indexOf('servicewechat') !== -1) {
    proxyReq.setHeader('Referer', '');
  }
})

proxy.on('proxyRes', function(proxyRes, req, res) {
  const refer = req.headers['referer'];
  if (refer && refer.indexOf('servicewechat') !== -1) {
    if (proxyRes.statusCode !== 200) {
      proxyRes.statusCode = 200;
    }
  }
})

proxy.on('error', function (err, req, res) {
  console.log(err);
  const setHead = setHttpHead(res)
  setHead(500)
  return res.end(JSON.stringify(UNEXPECT.PROXY_INTERNAL_ERROR))
})

module.exports = function(REMOTE_SERVER, AllowedOrigins) {
  return async (req, res) => {
    const url = URL.parse(req.url, true)
    const setHead = setHttpHead(res)
     
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
    res.setHeader('Access-Control-Allow-Headers', '*')
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      return res.end()
    }

    // if (url.pathname === '/reset_verify' && req.method === 'GET') {
    //   // 重置审核状态
    //   const body = URL.parse(url.path, true).query
    //   let lastVerify = isVerify
    //   isVerify = body && body.verify ? parseInt(body.verify, 10) : 1
    //   setHead(200)
    //   return res.end(JSON.stringify({ lastVerify, isVerify  }))
    // }
    
    // if (url.pathname === '/invitation_code_auth' && req.method === 'POST') {
    //   let result
    //   // platform_type 1 -> web  2 -> app
    //   const body = await bodyParse.form(req)
    //   const { invitation_code, platform_type, token: invitation_token } = body
    //   const token = createHash()

    //   if (!(typeof invitation_code === 'string' && typeof platform_type === 'string')) {
    //     setHead(403)
    //     result = Object.assign(UNEXPECT.PROXY_ARGUMENTS_ERROR, { invitation_code })
    //     return res.end(JSON.stringify(result))
    //   }

    //   const validInfo = isValidKey(invitation_code)

    //   if (validInfo && validInfo.status === 'PROXY_ARGUMENTS_ERROR') {
    //     setHead(400)
    //     return res.end(JSON.stringify(validInfo))
    //   }
      
    //   // 审核逻辑
    //   if (invitation_code === specialCode && isVerify === 1) {
    //     // 审核中
    //     setHead(200)
    //     result = { status: 'OK', invitation_code, token }
    //     return res.end(JSON.stringify(result))
    //   }
    //   if (invitation_code === specialCode && isVerify === 2) {
    //     // 审核完毕
    //     setHead(200)
    //     return res.end(JSON.stringify(UNEXPECT.PROXY_VERIFIED))
    //   }

    //   const isHaveCode = await auth(invitation_code)

    //   if (!isHaveCode) {
    //     setHead(403)
    //     result = Object.assign(UNEXPECT.PROXY_UNAUTHORIZED, { invitation_code })
    //     return res.end(JSON.stringify(result))
    //   }

    //   const invitationInfo = await InvitationCode.findOneByCode(invitation_code)
      
    //   // token过期
    //   if (invitationInfo && invitationInfo.expires < new Date().getTime()) {
    //     setHead(401)
    //     const resInfo = Object.assign(UNEXPECT.PROXY_KEY_EXPIRED, { token })
    //     return res.end(JSON.stringify(resInfo))
    //   }

    //   if (parseInt(platform_type, 10) === 2) {
    //     if (invitation_token) {
    //       const isValidPostToken = await InvitationCode.findDevice(invitation_token)
    //       if (!isValidPostToken) {
    //         if (invitationInfo && invitationInfo.count <= 0) {
    //           setHead(403)
    //           const resInfo = Object.assign(UNEXPECT.PROXY_COUNT_LIMIT_EXCEEDED, { token })
    //           return res.end(JSON.stringify(resInfo))
    //         }
    //         InvitationCode.addDevice(invitation_code, token)
    //       }
    //     } else {
    //       if (invitationInfo && invitationInfo.count <= 0) {
    //         setHead(403)
    //         const resInfo = Object.assign(UNEXPECT.PROXY_COUNT_LIMIT_EXCEEDED, { token })
    //         return res.end(JSON.stringify(resInfo))
    //       }
    //       InvitationCode.addDevice(invitation_code, token)
    //       InvitationCode.updateCodeCount(token)
    //     }
    //     setHead(200)
    //     result = { status: 'OK', invitation_code, token }
    //   } else if (parseInt(platform_type, 10) === 1) {
    //     if (invitationInfo && invitationInfo.count <= 0) {
    //       setHead(403)
    //       const resInfo = Object.assign(UNEXPECT.PROXY_COUNT_LIMIT_EXCEEDED, { token })
    //       return res.end(JSON.stringify(resInfo))
    //     }
    //     setHead(200)
    //     InvitationCode.addDevice(invitation_code, token)
    //     InvitationCode.updateCodeCount(token)
    //     result = { status: 'OK', invitation_code, token }
    //   } else {
    //     setHead(403)
    //     result = Object.assign(UNEXPECT.PROXY_UNAUTHORIZED, { invitation_code })
    //   }
    //   return res.end(JSON.stringify(result))
    // }

    const uri = URL.parse(url.path)
    const pathname = url.pathname === '/' ? '/index.html' : uri.pathname
    const filename = PATH.join(__dirname, '../public', pathname);

    if (fs.existsSync(filename)) {
      const mimeType = mimeTypes[PATH.extname(filename).split(".")[1]];
      res.writeHead(200, mimeType);
      const fileStream = fs.createReadStream(filename);
      fileStream.on('data', function (data) {
        res.write(data);
      });
      fileStream.on('end', function() {
        res.end();
      });
    } else if (req.method === 'POST' && allowPostPath.indexOf(uri.pathname) === -1) {
      setHead(404)
      return res.end(JSON.stringify(UNEXPECT.NOT_FOUND))
    } else {
      proxy.web(req, res, { target: REMOTE_SERVER })
    }

    // proxy.web(req, res, { target: REMOTE_SERVER })
  }
} 

console.log(password())

// let p = password()
// p.forEach(function(element) {
//   InvitationCode.createCode({
//     code: element,
//     count: 100,
//     type: 1
//   })
// }, this);
