const ua = navigator.userAgent;

function contains(str, substr) {
  return str.indexOf(substr) != -1;
}

export default {
  contains,

  uaContains(str) {
    return contains(ua, str);
  },

  iOS() {
    return contains(ua, 'iPhone') || contains(ua, 'iPad') || contains(ua, 'iPod');
  },

  Android() {
    return contains(ua, 'Android');
  },

  WeChat() {
    return contains(ua, 'MicroMessenger');
  },

  QQ() {
    return contains(ua, 'MQQBrowser') && !contains(ua, 'MicroMessenger');
  },

  webkit() {
    return contains(ua, 'AppleWebKit');
  },

  webkitVersion() {
    return ua.match(/AppleWebKit\/([0-9]+\.[0-9]+)/)[1];
  }
}