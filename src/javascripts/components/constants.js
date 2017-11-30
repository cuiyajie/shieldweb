export const livenessEnum = {
  BLINK: 0,
  MOUTH: 1,
  YAW: 2
  // NOD: 3
};

export const HACK_SCORE_MAX = 0.99;

export const livenessAssets = {
  [livenessEnum.BLINK]: {
    key: 'BLINK',
    gif: '../../images/liveness/blink.gif',
    description: '眨眨眼睛'
  },
  [livenessEnum.MOUTH]: {
    key: 'MOUTH',
    gif: '../../images/liveness/mouth.gif',
    description: '张一张嘴'
  },
  [livenessEnum.YAW]: {
    key: 'YAW',
    gif: '../../images/liveness/yaw.gif',
    description: '摇一摇头'
  }
  // [livenessEnum.NOD]: {
  //   key: 'NOD',
  //   gif: '../../images/liveness/nod.gif',
  //   description: '点一点头'
  // }
};

export const silentLivenessAsset = {
  key: 'SILENT',
  gif: '../../images/liveness/silent.png',
  description: '保持不动'
}

export const livenessLimit = {
  duration: 5,
  size: 15 * 1024 * 1024,
  sizeText: '15M'
};

export const livenessErrorMap = {
  'DOWNLOAD_TIMEOUT': '网络地址视频获取超时',
  'DOWNLOAD_ERROR': '网络地址视频获取失败',
  'INVALID_ARGUMENT': '请求参数错误，具体原因见 reason 字段内容',
  'WRONG_LIVENESS_DATA': 'liveness_data 出错',
  'UNAUTHORIZED': '账号或密钥错误',
  'KEY_EXPIRED': '账号过期，具体情况见 reason 字段内容',
  'RATE_LIMIT_EXCEEDED': '调用频率超出限额',
  'NO_PERMISSION': '无调用权限',
  'NOT_FOUND': '请求路径错误',
  'INTERNAL_ERROR': '服务器内部错误'
}

export const hackErrorMap = {
  'ENCODING_ERROR': '参数非UTF-8编码',
  'DOWNLOAD_TIMEOUT': '网络地址图片获取超时',
  'DOWNLOAD_ERROR': '网络地址图片获取失败',
  'IMAGE_ID_NOT_EXIST': '图片不存在',
  'IMAGE_FILE_SIZE_TOO_BIG': '图片体积过大',
  'CORRUPT_IMAGE': '文件不是图片文件或已经损坏',
  'INVALID_IMAGE_FORMAT_OR_SIZE': '图片大小或格式不符合要求',
  'INVALID_ARGUMENT': '请求参数错误',
  'NO_FACE_DETECTED': '上传的图片未检测出人脸',
  'UNAUTHORIZED': '账号或密钥错误',
  'KEY_EXPIRED': '账号过期',
  'RATE_LIMIT_EXCEEDED': '调用频率超出限额',
  'NO_PERMISSION': '无调用权限',
  'NOT_FOUND': '请求路径错误',
  'INTERNAL_ERROR': '服务器内部错误'
};

export const idNumberErrorMap = {
  'Gongan status OK': '拿到公安后台预留照片',
  'Gongan photo doesn’t exist': '姓名和身份证号匹配，公安照片不存在',
  'Name and idcard number doesn’t match': '姓名与身份证号不匹配',
  'Invalid idcard number': '非法身份证号码',
  'Gongan service timeout': '公安接口获取超时',
  'Gongan service is unavailable temporarily': '公安服务不可用',
  'Network error': '网络错误',
  'Unknown error': '未知错误'
};

export const identityErrorMap = {
  'ENCODING_ERROR':	'参数非UTF-8编码',
  'DOWNLOAD_TIMEOUT':	'网络地址图片获取超时',
  'DOWNLOAD_ERROR':	'网络地址图片获取失败',
  'IMAGE_ID_NOT_EXIST':	'图片不存在',
  'IMAGE_FILE_SIZE_TOO_BIG':	'图片体积过大',
  'NO_FACE_DETECTED':	'上传的图片未检测出人脸',
  'CORRUPT_IMAGE':	'文件不是图片文件或已经损坏',
  'INVALID_IMAGE_FORMAT_OR_SIZE':	'图片大小或格式不符合要求',
  'INVALID_ARGUMENT':	'请求参数错误',
  'UNAUTHORIZED':	'账号或密钥错误',
  'KEY_EXPIRED':	'账号过期',
  'RATE_LIMIT_EXCEEDED':	'调用频率超出限额',
  'NO_PERMISSION':	'无调用权限',
  'NOT_FOUND':	'请求路径错误',
  'INTERNAL_ERROR':	'服务器内部错误'
};

export const IDENTITY_BOUND = 0.7;