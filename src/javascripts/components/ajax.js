import $ from 'jquery';
import MessageBox from './messagebox';
import Config from './config';

const isAuth = (opts = {}) => {
  return !(opts.method.toUpperCase() === 'POST' && opts.url.indexOf('/invitation_code_auth') !== -1);
};

const appendQueryString = (url, key, val) => {
  let newUrl = url;
  if (url.indexOf('?') === -1) {
    newUrl = `${newUrl}?`;
  }
  newUrl = `${newUrl}&${key}=${val}`.replace('?&', '?');
  return newUrl;
};

const ProxyErrorMap = {
  'PROXY_INVALID_ARGUMENT':	'请求参数错误',
  'PROXY_KEY_EXPIRED':	'验证码过期',
  'PROXY_UNAUTHORIZED':	'邀请码验证失败',
  'PROXY_COUNT_LIMIT_EXCEEDED':	'免费调用次数已用完',
  'PROXY_INTERNAL_ERROR':	'服务器内部错误'
};


export default {
  watch: () => {
    $(document).ajaxSend((event, xhr, ajaxOptions) => {
      if (isAuth(ajaxOptions) && Config.hasToken()) {
        // ajaxOptions.url = appendQueryString(ajaxOptions.url, 'token', Config.getToken());
      }
    });

    $(document).ajaxError((event, xhr, ajaxOptions, err) => {
      if (isAuth(ajaxOptions)) {
        
      }
    });
  }
}

export { appendQueryString, ProxyErrorMap };