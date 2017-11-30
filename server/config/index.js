module.exports = {
  database: 'mongodb://192.168.2.151:27017/invitation_code',
  api_id: '49d5b0bb808f4bbb8188c9c8e5b5b397',
  api_secret: '8f8b4491287f417284e89bf5860ec1a1',
  allowPostPath: [
    '/liveness/check_liveness',
    '/liveness/check_silent_liveness',
    '/hackness/selfie_hack_detect',
    '/identity/historical_selfie_verification',
    '/identity/selfie_idnumber_verification',
    '/ocr/idcard'
  ],
  error: {
    PROXY_ARGUMENTS_ERROR: {
      status: 'PROXY_ARGUMENTS_ERROR',
      message: 'Arguments error',
      text: '请求的参数字段错误，您可拨打010-52725617与我们联系'
    },
    PROXY_UNAUTHORIZED: {
      status: 'PROXY_UNAUTHORIZED',
      message: 'Token unauthorized',
      text: '邀请码验证失败，您可拨打010-52725617与我们联系'
    },
    PROXY_KEY_EXPIRED: {
      status: 'PROXY_KEY_EXPIRED',
      message: 'Token expired',
      text: '邀请码已到期，请联系010-52725617申请新邀请码'
    },
    PROXY_COUNT_LIMIT_EXCEEDED: {
      status: 'PROXY_COUNT_LIMIT_EXCEEDED',
      message: 'Free counts have used up',
      text: '邀请码试用次数已用完，请联系010-52725617申请新邀请码'
    },
    PROXY_INTERNAL_ERROR: {
      status: 'PROXY_INTERNAL_ERROR',
      message: 'Proxy server error',
      text: '服务器内部错误，请稍后再试'
    },
    PROXY_VERIFIED: {
      status: 'PROXY_VERIFIED_ERROR',
      message: 'Proxy verified error'
    },
    NOT_FOUND: {
      status: 'NOT_FOUND',
      message: 'Path error',
      text: '请求路径错误'
    }
  }
}