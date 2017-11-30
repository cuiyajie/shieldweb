import $ from 'jquery';

import utils from './utils';
import Tab from './tab';
import cResult from './compareResult';
import Liveness from './liveness/liveness';
import MessageBox from './messagebox';
import { livenessEnum, HACK_SCORE_MAX, hackErrorMap, idNumberErrorMap, identityErrorMap, SUPPORT_ANDROID_LIST } from './constants';
import Config from './config';
import domains from '../domains';
import Platform from './platform';


// const isProd = window.location.host.indexOf(domains.prod.domain) !== -1;
const isProd = true
const host = isProd ? domains.prod.proxy : domains.stg.proxy;
const livenessConfig = { debug: !isProd, host };
const config = new Config(); 
const IdCardMaxSize = 480;
const SelfieMaxSize = 1280;

const resetFileInput = function(fileInput) {
  fileInput.wrap('<form>').closest('form').get(0).reset();
  fileInput.unwrap();
};

//compare page event handlers
const events = {
  uploadIdCard: function(source) {
    const fileInput = source.closest('.tabbed-section').find('[data-action=idCardUploaded]');
    if (fileInput) {
      fileInput.click();
    }
  },
  
  idCardUploaded: function(source, files) {
    if (files && files.length > 0) {
      const file = files[0];
      this.loading();
      try {
        utils.resizeImage(source, 'idcard_check', file, SelfieMaxSize);
      } catch(e) { 
        MessageBox.error(e.message); 
        this.unloading();
      }
    }
  },
  
  avatarUploaded: function(source, files) {
    if (files && files.length > 0) {
      const file = files[0];
      this.loading();
      try {
        utils.resizeImage(source, 'selfie', file, SelfieMaxSize);
      } catch(e) { 
        MessageBox.error(e.message); 
        this.unloading();
      }
    }
  },

  uploadAvatar: function(source) {
    var that = this;
    const messageBoxList = [
      // {
      //   html: '<div class="icon-li"><i class="icon-camera"></i><span>上传照片</span></div>',
      //   action: function() {
      //     source.closest('.tabbed-section').find('[data-action=avatarUploaded]').click();
      //   }
      // },
      {
        html: '<div class="icon-li"><i class="icon-video"></i><span>活体采集</span></div>',
        action: function() {
          MessageBox.list([
            {
              html: '<div>眨眼动作检测</div>',
              action: that.createLiveness.bind(that, { action: livenessEnum.BLINK }, source)
            },
            {
              html: '<div>张嘴动作检测</div>',
              action: that.createLiveness.bind(that, { action: livenessEnum.MOUTH }, source)
            },
            {
              html: '<div>摇头动作检测</div>',
              action: that.createLiveness.bind(that, { action: livenessEnum.YAW }, source)
            }
          ])
        }
      },
      // {
      //   html: '<div class="icon-li"><i class="icon-silent"></i><span>静默活体</span></div>',
      //   action: function() {
      //     that.createLiveness.call(that, { silent: true }, source)
      //   }
      // }
    ];
    MessageBox.list(messageBoxList);
  },

  compareImage: function(source) {
    if (this.IdCardImage && this.ImageCompareData) {
      this.ajaxCompare(true, this.IdCardImage, this.ImageCompareData);
    }
  },

  compareIdInfo: function(source) {
    if (this.checkInfo() && this.InfoCompareData) {
      this.ajaxCompare(false, { 
        'id': this.idInput.val(), 
        'name': this.nameInput.val() 
      }, this.InfoCompareData);
    }
  }
};

export default class ComparePage {
  constructor(options) {
    this.options = options || {};
    this.$el = $('#comparision');
    this.bindEvent();
  }

  ajaxCompare(isImage, card, portrait) {
    const isLiveness = !!portrait.feature_image_id;
    if (this.options.startCompare) {
      this.options.startCompare();
    }
    const errorHandler = this.options.compareFail || function() {};
    const successHandler = this.options.compareSuccess || function() {};
    $.ajax({
      url: config.compareApi(isImage),
      method: 'POST',
      data: config.compareData(isImage, isLiveness, card, portrait),
      contentType: isImage ? false : 'application/x-www-form-urlencoded',
      processData: !isImage,
      success: function(data) {
        if (data.status === 'OK') {
          if (isImage) {
            successHandler(data);
          } else if (data.identity) {
            if (data.identity.validity) {
              successHandler(data);
            } else {
              errorHandler(idNumberErrorMap[data.identity.reason]);
            }
          }
        }
      },
      error: function(err) {
        try {
          err = JSON.parse(err.responseText);
          if (err.status) {
            errorHandler(identityErrorMap[err.status]);
          } else {
            errorHandler('请求比对失败，请重试！');
          }
        } catch(e) {
          errorHandler('请求比对失败，请重试！');
        }
      }
    })
  }

  doms() {
    this.nameInput = this.$el.find('#name');
    this.idInput = this.$el.find('#idcard');
    this.cImgBtn = this.$el.find('[data-action=compareImage]');
    this.cInfoBtn = this.$el.find('[data-action=compareIdInfo]');
  }

  show() {
    Tab.init('idcard');
    this.doms();
    this.notifyIdInfoButton();
    this.notifyImageButton();
    utils.showPage('comparision');
  }

  reset() {
    this.$el.find('input').each((i, input) => {
      input = $(input);
      if (input.attr('type') === 'file') {
        resetFileInput(input);
      } else {
        input.val('');
      }
    });

    this.$el.find('.compare-block[data-action=uploadIdCard]').show();
    this.$el.find('.compare-block').each((i, block) => {
      block = $(block);
      const action = block.attr('data-action');
      if (block.hasClass('result') || block.hasClass('image')) {
        block.hide();
      }
      if (block.hasClass('bordered')) {
        block.show();
      }
    });
    Tab.init('idcard');
    this.resetPostData();
  }

  resetPostData() {
    this.IdCardImage = null;
    this.ImageCompareData = null;
    this.InfoCompareData = null;
    this.notifyIdInfoButton();
    this.notifyImageButton();
  }
  
  bindEvent() {
    var that = this;
    $(document.body).on('click', '[data-action]', function(e) {
      const el = $(this);
      const action = el.attr('data-action');
      if (action && events[action]) {
        events[action].call(that, el);
      }
    });

    this.$el.find('input[type=file]').on('change', function(e) {
      const el = $(this);
      const action = el.attr('data-action');
      if (action && events[action]) {
        events[action].call(that, el, e.target.files);
      }
    });

    $(document).bind('imageResized', e => {
      if (e.source === 'idcard_check') {
        this.handleResizedIdCard(e);
      } else if (e.source === 'selfie') {
        this.handleResizedSelfie(e);
      } else if (e.source === 'idcard') {
        const container = e.el.closest('.tabbed-section').find('.compare-block.image');
        container.html('');
        const image = $('<img />').appendTo(container);
        resetFileInput(e.el);

        image.attr('src', e.url || config.selfieShot(e.payload.image_id));
        if (e.payload && e.payload.rotate) {
          image.addClass(e.payload.rotate);
        }
        image.on('click', () => { });
        this.IdCardImage = e.file;
        this.notifyImageButton();
        this.$el.find('[data-action=uploadIdCard]').hide();
        container.show();
      }
    });

    this.$el.find('.compare-block.result').on('click', () => { });
  }

  handleResizedIdCard(e) {
    const formData = new FormData();
    formData.append('file', e.file);
    formData.append('side', 'front');
    formData.append('auto_rotate', true);
    this.loading();

    $.ajax({
      url: config.OCRIdcardApi(),
      method: 'POST',
      contentType: false,
      data: formData,
      processData: false,
      success: (data) => {
        if (data.status === 'OK') {
          if (data.validity && data.validity.name &&
              data.validity.sex && data.validity.birthday && 
              data.validity.address && data.validity.number) {
              utils.resizeImage(e.el, 'idcard', e.file, IdCardMaxSize, data);
          } else {
            MessageBox.error('上传的图片未检测身份证正面');
          }
          this.unloading();
        }
      },
      error: (err) => {
        try {
          err = JSON.parse(err.responseText);
          if (err.status && hackErrorMap[err.status]) {
            MessageBox.error(hackErrorMap[err.status]);
          } else {
            MessageBox.error('上传失败，请重试！');
          }
        } catch(e) {
          MessageBox.error('上传失败，请重试！');
        } finally {
          this.unloading();
        }
      }
    })
  }

  handleResizedSelfie(e) {
    const formData = new FormData();
    formData.append('file', e.file);
    this.loading();

    $.ajax({
      url: config.selfieHackApi(),
      method: 'POST',
      contentType: false,
      data: formData,
      processData: false,
      success: (data) => {
        if (data.status === 'OK') {
          this.showImageResult(e.el, data);
          this.setCompareData(e.el, data);
        }
        this.unloading();
      },
      error: (err) => {
        try {
          err = JSON.parse(err.responseText);
          if (err.status && hackErrorMap[err.status]) {
            MessageBox.error(hackErrorMap[err.status]);
          } else {
            MessageBox.error('上传失败，请重试！');
          }
        } catch(e) {
          MessageBox.error('上传失败，请重试！');
        } finally {
          this.unloading();
        }
      }
    });
  }

  createLiveness(config, sourceElement) {
    var that = this;
    config = config || {};
    const liveness = new Liveness($.extend({}, livenessConfig, config, {
      onChecked: (data) => {
        this.showLivenessResult(sourceElement, data);
        this.setCompareData(sourceElement, data);
      },
      onError: (err) => {
        MessageBox.error(err);
      }
    }));
    liveness.show();
    return liveness;
  }

  showLivenessResult(sourceElement, data) {
    const resultBlock = sourceElement.closest('.tabbed-section').find('.compare-block.result');
    resultBlock.find('.result-image img').attr('src', data.feature_image_url);
    resultBlock.find('.result-text').hide();
    const resultContainer = resultBlock.find('.result-text.double');
    const resultIcons = resultContainer.find('.icon i');
    const resultTexts = resultContainer.find('.text');
    resultIcons.eq(0).attr('class', data.passed ? 'icon-success' : 'icon-fail');
    resultTexts.eq(0).html(`前端活体检测${data.passed ? '' : '未'}通过`);
    resultIcons.eq(1).attr('class', data.hackPassed ? 'icon-success' : 'icon-fail');
    resultTexts.eq(1).html(`后端防hack${data.hackPassed ? '' : '未'}通过`);
    sourceElement.hide();
    resultContainer.show();
    resultBlock.show();
    cResult(resultBlock);
  }
  
  showImageResult(sourceElement, data) {
    const tabContainer = sourceElement.closest('.tabbed-section');
    const resultBlock = tabContainer.find('.compare-block.result');
    const actionBlock = tabContainer.find('.compare-block[data-action=uploadAvatar]');
    resultBlock.find('.result-image img').attr('src', config.selfieShot(data.image_id));
    resultBlock.find('.result-text').hide();
    const resultContainer = resultBlock.find('.result-text.single');
    const resultIcon = resultContainer.find('.icon i');
    const resultText = resultContainer.find('.text');
    const passed = (data.score <= HACK_SCORE_MAX);
    resultIcon.attr('class', passed ? 'icon-success' : 'icon-fail');
    resultText.html(`后端防hack${passed ? '' : '未'}通过`);
    actionBlock.hide();
    resultContainer.show();
    resultBlock.show();
    cResult(resultBlock);
  }

  setCompareData(el, data) {
    const tab = el.closest('.tabbed-section');
    if (tab.attr('id') === 'comparedToIdCard') {
      this.ImageCompareData = data;
      this.notifyImageButton();
    } else {
      this.InfoCompareData = data;
      this.notifyIdInfoButton();
    }
  }

  getMask() {
   if (!this.mask) {
     let mask = $('.liveness-modal-mask');
     if (mask.length === 0) {
       mask = $('<div class="liveness-modal-mask" />');
       mask.appendTo(document.body);
     }
     this.mask = mask;
   }
   return this.mask;
  }

  getLoader() {
    if (!this.loadModal) {
      const mask = this.getMask();
      mask.html('');
      const loadModal = $(`<div class="modal loading-modal">
                             <div class="modal-body">
                               <div class="gif-container"><img src="../../images/cloud.gif" alt="Loading"></div>
                               <p>上传中...</p>
                             </div>
                           </div>`);
      mask.append(loadModal);
      this.loadModal = loadModal;
    }
    return this.loadModal;
  }

  loading() {
    const loader = this.getLoader();
    if (this.mask.is(':hidden')) {
      this.mask.show();
      loader.show();
    }
  }

  unloading() {
    const loader = this.getLoader();
    this.mask.hide();
    loader.hide();
  }

  checkInfo() {
    const idRegex = /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/;
    if (this.nameInput.val() === '') {
      MessageBox.error('姓名不能为空');
      return false;
    } else if (!idRegex.test(this.idInput.val())) {
      MessageBox.error('身份证号码不合法');
      return false;
    }
    return true;
  }

  notifyImageButton() {
    if (this.IdCardImage && this.ImageCompareData) {
      this.cImgBtn.attr('class', 'linkface');
    } else {
      this.cImgBtn.attr('class', 'primary');
    }
  }

  notifyIdInfoButton() {
    if (this.InfoCompareData) {
      this.cInfoBtn.attr('class', 'linkface');
    } else {
      this.cInfoBtn.attr('class', 'primary');
    }
  }
};