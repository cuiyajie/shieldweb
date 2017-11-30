require('babel-core/register')()
require('babel-polyfill')

var http = require('http')
var https = require('https')
var fs = require('fs')
var path = require('path')

var domains = require('./domains.js')
var listener = require('./proxy.js')

// var REMOTE_SERVER = process.env.NODE_ENV === 'prod' ? domains.prod.cloud : domains.stg.cloud; 

var REMOTE_SERVER = domains.prod.cloud 
var LOCAL_PORT = 8081
// var HTTPS_LOCAL_PORT = 8443
var index = 1;

process.argv.forEach((argv, i) => {
  if (argv.indexOf('server') !== -1) {
    index = i;
  }
});

var proxyHost = process.argv[index + 1] || '0.0.0.0';
var AllowedOrigins = process.argv.slice(index + 2);

console.log('Proxy server start on:' + proxyHost + ':' + LOCAL_PORT + ' ..... ');
http.createServer(listener(REMOTE_SERVER, AllowedOrigins)).listen(LOCAL_PORT, proxyHost);

// console.log('Https Proxy server start on:' + proxyHost + ':' + HTTPS_LOCAL_PORT + ' ..... ');
// https.createServer({
//   key: fs.readFileSync(path.resolve(__dirname, 'cert/linkface.cn.key')),
//   cert: fs.readFileSync(path.resolve(__dirname, 'cert/linkface.cn.crt')),
// }, listener(REMOTE_SERVER, AllowedOrigins)).listen(HTTPS_LOCAL_PORT, proxyHost);

console.log('Remote server:' + REMOTE_SERVER);
