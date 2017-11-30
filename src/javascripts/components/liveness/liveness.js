import Config from './config';
import { livenessEnum, livenessAssets, silentLivenessAsset, livenessLimit, hackErrorMap, livenessErrorMap, HACK_SCORE_MAX } from '../constants';
import { createObjectURL, revokeObjectURL } from '../compatible';
import { isSupported } from '../support';
import  '../polyfill';

const alert = window.alert;

function buildParams(prefix, obj, add) {
  var name, i, l, rbracket;
  rbracket = /\[\]$/;
  if (obj instanceof Array) {
      for (i = 0, l = obj.length; i < l; i++) {
          if (rbracket.test(prefix)) {
              add(prefix, obj[i]);
          } else {
              buildParams(prefix + "[" + ( typeof obj[i] === "object" ? i : "" ) + "]", obj[i], add);
          }
      }
  } else if (typeof obj == "object") {
      for (name in obj) { // Serialize object item.
          buildParams(prefix + "[" + name + "]", obj[ name ], add);
      }
  } else {
      add(prefix, obj); // Serialize scalar item.
  }
}

const objectToQueryString = function (a) {
    var prefix, s, add, name, r20, output;
    s = [];
    r20 = /%20/g;
    add = function (key, value) {
        value = ( typeof value == 'function' ) ? value() : ( value == null ? "" : value );
        s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    };
    if (a instanceof Array) {
        for (name in a) {
            add(name, a[name]);
        }
    } else {
        for (prefix in a) {
            buildParams(prefix, a[ prefix ], add);
        }
    }
    output = s.join("&").replace(r20, "+");
    return output;
};

function omit(obj, keys) {
  if (typeof obj === 'undefined' || obj === null
   || !(typeof obj === 'object' || typeof obj === 'function')) {
     return result;
  }

  keys = [].concat.apply([], [].slice.call(arguments, 1));
  var last = keys[keys.length - 1];
  var res = {}, fn;

  if (typeof last === 'function') {
    fn = keys.pop();
  }

  var isFunction = typeof fn === 'function';
  if (!keys.length && !isFunction) {
    return obj;
  }

  var hasOwn = Object.prototype.hasOwnProperty;
  for (var key in obj) {
    if (hasOwn.call(obj, key) && keys.indexOf(key) === -1) {
      if (!isFunction) {
        res[key] = obj[key];
      } else if (fn(obj[key], key, obj)) {
        res[key] = obj[key];
      }
    }
  }
  return res;
}

const ajax = function(options = {}) {
  if (!options.url) 
    return;

  const xhr = new XMLHttpRequest();
  xhr.open('POST', options.url, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        options.success && options.success(JSON.parse(xhr.responseText));
      } else {
        var error;
        try {
          error = JSON.parse(xhr.responseText);
        } catch (e) { 
          error = null;
        } finally {
          options.error && options.error(error);
        }
      }
    }
  };
  xhr.onerror = (err) => {
    options.error && options.error(err);
  };

  if (typeof options.data === 'object' && options.data.constructor === Object) {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(objectToQueryString(options.data));
  } else {
    xhr.send(options.data);
  }
  return xhr;
};

const check = function(file) {
  const promise = new Promise((resolve, reject) => {
    if (file.size > livenessLimit.size) {
      reject({ errorCode: 2 });
      return;
    }

    const video = document.createElement('video');
    let metadataloaded = false;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      metadataloaded = true;
      revokeObjectURL(video.src);
      if (video.duration > livenessLimit.duration) {
        reject({ errorCode: 1 });
      } else {
        resolve({ file });
      }
    };
    video.src = createObjectURL(file);
    setTimeout(() => {
      if (!metadataloaded) {
        resolve({ file });
      }
    }, 2000);
  });
  return promise;
};

export default class LivenessSDK {

  constructor(options) {
    this.options = options || {};
    if (!this.options.onChecked) {
      throw new Error('Please provide callback for check');
    }

    if (!this.options.silent && !livenessAssets[this.options.action]) {
      throw new Error('Please configure silent liveness or  provide specific liveness action among nod, open mouth and yaw');
    }
  
    this.config = new Config(options);
  }

  static isAvailable = isSupported()

  getAction() {
    if (this.options.silent) {
      this.action = silentLivenessAsset;
    } else {
      this.action = livenessAssets[this.options.action];
    }
  }

  getModal() {
    const mask = this.getMask();
    if (!this.modal) {
      this.modal = document.createElement('div');
      this.modal.className = 'modal liveness-modal';
      this.modal.innerHTML = `<div class="modal-body">
                                <div class="sample">
                                  <div class="sample-inner">
                                    <div class="gif-container"><img src="${this.action.gif}"></div>
                                  </div>
                                </div>
                                <p>
                                  录制不超过<em> ${livenessLimit.duration}s </em>的视频<br>
                                  ${this.options.silent ? `<span class="justify">请保持<em>脸在屏幕内</em><span>` : `拍摄视频时请<em>${this.action.description}</em>`}
                                </p>
                              </div>`;
      mask.appendChild(this.modal);
      
      const haveViewed = !!localStorage.getItem('viewed');
      let countdown = 3;
      //button
      const button = document.createElement('button');
      button.id = 'confirm';
      if (haveViewed) {
        button.textContent = '开始录制';
        button.classList.add('enabled');
      } else {
        button.textContent = `开始录制 (${countdown})`;
        const interval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            button.textContent = `开始录制 (${countdown})`;
          } else {
            button.textContent = '开始录制';
            button.classList.add('enabled');
            if (!localStorage.getItem('viewed')) {
              localStorage.setItem('viewed', true);
            }
            clearInterval(interval);
          }
        }, 1000);
      }
      button.addEventListener('click', () => {
        if (countdown === 0 || haveViewed) {
          this.uploadInput.click();
        }
      });

      const body = this.modal.querySelector('.modal-body')
      body.appendChild(button);
    }

    //upload input
    this.clearUploadInput();

    return this.modal;
  }

  clearUploadInput() {
    if (!this.modal) {
      return;
    }

    const body = this.modal.querySelector('.modal-body')
    if (this.uploadInput) {
      body.removeChild(this.uploadInput);
      this.uploadInput = null;
    }

    this.uploadInput = document.createElement('input');
    this.uploadInput.className = 'upload-input';
    this.uploadInput.setAttribute('type', 'file');
    this.uploadInput.setAttribute('accept', 'video/*');
    this.uploadInput.setAttribute('capture', true);
    this.uploadInput.addEventListener('change', this.handleUpload.bind(this));
    body.appendChild(this.uploadInput);
  }

  getMask() {
    if (!this.mask) {
      this.mask = document.createElement('div');
      this.mask.className = 'liveness-modal-mask';
      this.mask.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target === this.mask) {
          if (this.xhr) {
            this.xhr.abort();
          }
          if (this.hackXhr) {
            this.hackXhr.abort();
          }
          this.mask.classList.remove('opened');
        }
      });
      document.body.appendChild(this.mask);
    }
    return this.mask;
  }

  handleUpload(event) {
    const file = event.target.files[0];
    const beforeCheck = this.options.beforeCheck || function() {};
    beforeCheck.call(this, { video_file: file });
    if (file) {
      this.loading();
      check(file).then(() => {
        const formData = new FormData();
        let requestApi;
        if (this.options.silent) {
          formData.append('video_file', file);
          formData.append('return_image', !!this.options.silentBase64);
          requestApi = this.config.silentLivenessApi();
        } else {
          formData.append('motions', [this.action.key].join(' '));
          formData.append('liveness_data_file', file);
          requestApi = this.config.livenessApi();
        }
        this.xhr = ajax({
          url: requestApi,
          data: formData,
          success: (data) => {
            this.handleResult(data, { video_file: file });
          },
          error: (err) => {
            this.handleResult(err);
          }
        });
      }, (err) => {
        this.handleResult(err);
      });
    }
  }

  handleResult(data, payload = {}) {
    const onError = this.options.onError || alert;

    //pre check
    if (data && data.errorCode) {
      if (data.errorCode === 1) {
        onError(`视频时长不能超过${livenessLimit.duration}s`);
      } else if (data.errorCode === 2) {
        onError(`视频大小不能超过${livenessLimit.sizeText}`);
      }
      this.unloading();
      return;
    }

    //request check
    if (!data) {
      onError('请求服务器出错，请重试！');
    } else if (data.status === 'RPC_TIMEOUT') {
      onError('请求超时，稍后请重试！');
    } else if (data.status === 'OK') {
      let livenessData;
      if (this.options.silent) {
        livenessData = omit(data, 'status', 'request_id');
      } else {
        livenessData = Object.assign({}, data.result, payload);
      }
      if (livenessData.feature_image_id) {
        livenessData.feature_image_url = this.config.livenessShot(livenessData.feature_image_id);
        this.handleHack(livenessData);
        return;
      } else {
        onError('上传的视频未检测出人脸');
      }
    } else if (livenessErrorMap[data.status]) {
      onError(livenessErrorMap[data.status]);
    }
    this.unloading();
  }

  handleHack(livenessData) {
    const onChecked = this.options.onChecked;
    const onError = this.options.onError || alert;
    const responseData = Object.assign({}, livenessData);
    //hack check
    this.hackXhr = ajax({
      url: this.config.livenessHackApi(),
      data: {
        image_id: livenessData.feature_image_id
      },
      success: (hackData) => {
        if (hackData.status === 'OK') {
          responseData.hackPassed = (hackData.score <= HACK_SCORE_MAX);
          responseData.hackScore = hackData.score;
          onChecked(responseData);
          this.hide();
        }
        this.unloading();
      },
      error: (err) => {
        if (hackErrorMap[err.status]) {
          onError(hackErrorMap[err.status]);
        } else {
          onError('请求服务器出错，请重试！');
        }
        this.unloading();
      }
    }, (err) => {
        onError('请求服务器出错，请重试！');
        this.unloading();
    })
  }

  getLoader() {
    if (!this.loadModal) {
      const mask = this.getMask();
      const loadModal = document.createElement('div');
      loadModal.className = 'modal loading-modal';
      loadModal.innerHTML = `<div class="modal-body">
                               <div class="gif-container"><img src="../../images/liveness/cloud.gif" alt="Loading"></div>
                               <p>上传中...</p>
                             </div>`;
      mask.appendChild(loadModal);
      this.loadModal = loadModal;
    }
    return this.loadModal;
  }

  loading() {
    const loadModal = this.getLoader();
    //show loading
    if (this.modal) {
      this.modal.classList.add('hide');
    }
    loadModal.classList.remove('hide');
  }

  unloading(closeMask) {
    const modal = this.getModal();
    const loadModal = this.getLoader();

    loadModal.classList.add('hide');
    this.clearUploadInput();
    modal.classList.remove('hide');
    if (closeMask) {
      this.hide();
    }
  }

  show() {
    this.getAction();
    this.getModal();

    const mask = this.getMask();
    mask.classList.add('opened');
    return mask;
  }

  hide() {
    if (this.mask) {
      this.mask.classList.remove('opened');
    }
  }
}