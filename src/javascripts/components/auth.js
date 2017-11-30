import $ from 'jquery';

import utils from './utils';
import Config from './config';
import MessageBox from './messagebox';

const config = new Config();
const AuthErrorMap = {
  'PROXY_INVALID_ARGUMENT':	'请求参数错误',
  'PROXY_KEY_EXPIRED':	'验证码过期',
  'PROXY_UNAUTHORIZED':	'邀请码验证失败',
  'PROXY_COUNT_LIMIT_EXCEEDED':	'免费调用次数已用完',
  'PROXY_INTERNAL_ERROR':	'服务器内部错误'
};


export default class AuthPage {
  constructor(options) {
    options = options || {};
    this.$el = $('#invitation');
    this.$input = this.$el.find('input[type=text]');
    this.authenticated = options.authenticated;
    this.bindEvent();
  }

  show() {
    utils.showPage('invitation');
  }

  authenticate(val) {
    $.ajax({
      url: config.authApi(),
      method: 'POST',
      data: {
        'invitation_code': val,
        'platform_type': 1
      },
      dataType: 'json',
      success: response => {
        if (response.status === 'OK') {
          this.$input.val('');
          this.authenticated && this.authenticated();
        }
      },
      error: err => {
        try {
          err = JSON.parse(err.responseText);
          if (err && err.status && AuthErrorMap[err.status]) {
            MessageBox.error(AuthErrorMap[err.status]);
          } else {
            MessageBox.error('请求服务器错误');
          }
        } catch(e) {
          MessageBox.error('请求服务器错误');
        }
      },
    });
  }

  bindEvent() {
    var that = this;
    this.$input.on('input', function() {
      const ipt = $(this);
      if (ipt.val().length === 4) {
        that.authenticate(ipt.val());
      }
    });
  }
};
