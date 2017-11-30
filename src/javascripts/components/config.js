import domains from '../domains';

const selfieHackApi = '/hackness/selfie_hack_detect';
const livenessShot = '/liveness/liveness_image';
const IdentitySelfieVsWaterMark = '/identity/historical_selfie_verification';
const IdentitySelfieVsIdNumber = '/identity/selfie_idnumber_verification';
const OCRIdcardApi = '/ocr/idcard';
// 在web端这两个接口不能用，这两个接口针对的是移动端
// const IdentityLivenessVsWaterMark = '/identity/liveness_watermark_verification';
// const IdentityLivenessVsIdNumber = '/identity/liveness_idnumber_verification';

export default class Config {
  
  constructor(options) {
    options = options || {};
    if (options.host) {
      this.host = options.host;
    } else {
      const isProd = window.location.host.indexOf(domains.prod.domain) !== -1;
      this.host = isProd ? domains.prod.proxy : domains.stg.proxy;
    }
  }

  selfieHackApi() {
    return `${this.host}${selfieHackApi}`;
  }

  selfieShot(imageId) {
    return `${this.host}${livenessShot}/${imageId}`; 
  }

  compareApi(isImage) {
    return `${this.host}${isImage ? IdentitySelfieVsWaterMark : IdentitySelfieVsIdNumber}`;
  }

  OCRIdcardApi() {
    return `${this.host}${OCRIdcardApi}`;
  }

  compareData(isImage, isLiveness, card, protrait) {
    let result;
    if (isImage) {
      result = new FormData();
      result.append('selfie_file', card);
      result.append('selfie_auto_rotate', true);
      result.append('historical_selfie_auto_rotate', true);
      if (isLiveness) {
        result.append('historical_selfie_image_id', protrait.feature_image_id);
      } else {
        result.append('historical_selfie_image_id', protrait.image_id);
      }
    } else {
      result = { 'id_number': card.id, 'name': card.name };
      if (isLiveness) {
        result['selfie_image_id'] = protrait.feature_image_id;
      } else {
        result['selfie_image_id'] = protrait.image_id;
      }
    }
    return result;
  }

  authApi() {
    return `${this.host}/invitation_code_auth`;
  }
};