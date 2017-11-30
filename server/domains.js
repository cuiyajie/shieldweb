var devDomain = '192.168.2.153:10006';
// var prodDomain = 'cloudapi.linkface.cn';

var prodDomain = '0.0.0.0:8080';
module.exports = {
  stg: {
    cloud: `http://${devDomain}`
  },

  prod: {
    cloud: `http://${prodDomain}`
  }
}