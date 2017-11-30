import $ from 'jquery';
import EXIF from 'exif-js';
import Platform from './platform';

const IMAGE_UPLOAD_AVAILABLE = {
  NORMAL: 0,
  NOT_TRIGGER_CHANGE_EVENT: 1,
  FILE_SIZE_ZERO: 2,
  NOT_SHOW_DIALOG: 3,
  FILEREADER_ONLOAD_ERROR: 4
};

const ua = navigator.userAgent;

var dataURLToBlob = function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

var getBase64 = function(file, cb) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     cb && cb(reader.result);
   };
}

export default {
  showPage: function(page) {
    $('.page').hide();
    $(`#${page}`).show();
  },

  placeImage: function(el, file) {
    getBase64(file, function(dataUrl) {
      el.attr('src', dataUrl);
    })
  },

  resizeImage: function(el, source, file, maxSize, payload) {
    if (file.type.match(/image.*/) || /(png|jpg|jpeg|gif|bmp)$/.test(file.name)) {
      if (Platform.Android() && Platform.webkit() && +Platform.webkitVersion() < 537.36) { 
        //所有Android webkit内核在537.36一下的不支持图片压缩
        getBase64(file, function(dataUrl) {
          $.event.trigger({
            type: "imageResized",
            file,
            url: dataUrl,
            el,
            source,
            payload,
          });
        })
      } else {
        const reader = new FileReader();
        reader.onload = function (readerEvent) {
          const image = new Image();
          image.onload = function (imageEvent) {
            // Resize the image
            const max_size = maxSize;
            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }
            canvas.width = max_size;
            canvas.height = max_size;
            const ctx = canvas.getContext('2d');
            EXIF.getData(image, function() {
              ctx.drawImage(image, (max_size-width)/2, (max_size-height)/2, width, height);
              ctx.clearRect(0, 0, max_size, max_size);
              //move to center
              ctx.translate(max_size/2, max_size/2);
              let rotatedWidth = width;
              let rotatedHeight = height;
              const orientation = EXIF.getTag(this, 'Orientation');
              switch(orientation) {
                case 6: 
                  ctx.rotate(90 * Math.PI / 180);
                  rotatedWidth = height;
                  rotatedHeight = width;
                  break;
                case 3: 
                  ctx.rotate(180 * Math.PI / 180); 
                  break;
                case 8: 
                  ctx.rotate(-90 * Math.PI / 180); 
                  rotatedWidth = height;
                  rotatedHeight = width;
                  break;
                default:;
              }
              ctx.drawImage(image, -width/2, -height/2, width, height);
              ctx.restore();
              const canvas2 = document.createElement('canvas');
              canvas2.width = rotatedWidth;
              canvas2.height = rotatedHeight;
              const ctx2 = canvas2.getContext('2d');
              ctx2.drawImage(ctx.canvas, (max_size-rotatedWidth)/2, (max_size-rotatedHeight)/2, rotatedWidth, rotatedHeight, 
                            0, 0, rotatedWidth, rotatedHeight);
              const dataUrl = canvas2.toDataURL('image/jpeg');
              const resizedImage = dataURLToBlob(dataUrl);
              resizedImage.name = file.name;
              resizedImage.lastModifiedDate = new Date();
              $.event.trigger({
                type: "imageResized",
                file: resizedImage,
                url: dataUrl,
                el,
                source,
                payload,
              });
            });
          }
          image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
      }
    } else {
      throw new Error('上传文件格式不正确');
    }
  },

  objectToQueryString: function (a) {
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
  },

  supportUploadImage: function() {
    if (/vivo Y67A|SM\-A8000|H60\-L01|VIE\-AL10|OPPO R9s/.test(ua) && Platform.uaContains('OPR')) {
      return IMAGE_UPLOAD_AVAILABLE.NOT_TRIGGER_CHANGE_EVENT;
    }

    if (Platform.uaContains('MI 5s') && /Maxthon|MxBrowser/.test(ua)) {
      return IMAGE_UPLOAD_AVAILABLE.FILE_SIZE_ZERO;
    }

    if (Platform.uaContains('H60-L01') && Platform.uaContains('DolphinBrowser')) {
      return IMAGE_UPLOAD_AVAILABLE.FILEREADER_ONLOAD_ERROR;
    }

    if (Platform.uaContains('HM2013023') && Platform.uaContains('Maxthon')) {
      return IMAGE_UPLOAD_AVAILABLE.NOT_TRIGGER_CHANGE_EVENT;
    }

    return IMAGE_UPLOAD_AVAILABLE.NORMAL;
  }
}