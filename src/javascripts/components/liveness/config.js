import domains from '../../domains';

const livenessApi = '/liveness/check_liveness';
const silentLivenessApi = '/liveness/check_silent_liveness';
const livenessShot = '/liveness/liveness_image';
const livenessHackApi = '/hackness/selfie_hack_detect';

function getPublicCloud(debug) {
  return debug ? domains.stg.cloud : domains.prod.cloud;
}

export default class Config {
  
  constructor(options) {
    if (options.host != null) {
      this.host = options.host;
      this.auth = '';
    } else if (options.apiId && options.apiSecret) {
      this.host = getPublicCloud(options.debug);
      this.auth = `?api_id=${options.apiId}&api_secret=${options.apiSecret}`;
    } else {
      throw new Error('Please provide api server or api authenciation');
    }
  }

  livenessApi() {
    return `${this.host}${livenessApi}${this.auth}`;
  }

  silentLivenessApi() {
    return `${this.host}${silentLivenessApi}${this.auth}`;
  }

  livenessShot(uuid) {
    return `${this.host}${livenessShot}/${uuid}${this.auth}`; 
  }

  livenessHackApi() {
    return `${this.host}${livenessHackApi}${this.auth}`;
  }
};