const localDomain = 'localhost';
const devDomain = '192.168.2.153';
const devCloud = '192.168.2.153:10006';
const prodDomain = 'shieldweb.linkface.cn';
const prodCloud = 'cloudapi.linkface.cn';

export default {
  stg: {
    domain: devDomain,
    proxy: `http://${devDomain}:8090`,
    cloud: `http://${devCloud}`
  },

  prod: {
    domain: prodDomain,
    proxy: `http://${prodDomain}:8090`,
    cloud: `http://${prodCloud}`
  }
}