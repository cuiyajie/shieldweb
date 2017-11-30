import $ from 'jquery';

class MessageBox {
  constructor(options) {
    this.options = options || 0;
    this.events = {
      close: function() {},
    };
  }

  close() {
    const mask = this.getMask();
    if (mask) {
      mask.html('');
      mask.hide();
      $('#app').removeClass('blur');
      this.options.cb && this.options.cb();
    }
  }

  show() {
    const mask = this.getMask();
    mask.html('');
    this.getModal().show();
    $('#app').addClass('blur');
  }

  getMask() {
   if (!this.mask) {
    //  let mask = $('.message-modal-mask');
    //  if (mask.length === 0) {
    const mask = $('<div class="message-modal-mask" />');
    mask.on('click', e => {
      e.stopPropagation();
      if (e.target === mask[0]) {
        this.close();
      }
    });
    mask.appendTo(document.body);
    //  }
     this.mask = mask;
   } 
   this.mask.show();
   return this.mask;
  }

  getModal() {
    if (!this.modal) {
      this.modal = $('<div class="message-modal-body" />');
      this.modal.addClass(this.options.type);
      this.modal.html(this.getTemplate());
      this.bindEvents();
      this.mask.append(this.modal);

      this.modal.css('left', (window.innerWidth - this.modal.width()) / 2 + 'px');
    }
    return this.modal;
  }

  getTemplate() {
    let template = '';
    if (this.options.type === 'list') {
      if (this.options.customOptions instanceof Array) {
        template += '<ul>';
        const that = this;
        $.each(this.options.customOptions, function(i, co) {
          const handlerName = `list${i}Handler`;
          template += `<li data-action="${handlerName}">${co.html}</li>`;
          that.events[handlerName] = co.action;
        });
        template += '</ul>';
      }
    } else if (this.options.type === 'error') {
      if (typeof this.options.message === 'string') {
        template += '<ul>';
        template += `<li><div class="icon"><i class="icon-fail"></i></div><div class="text">${this.options.message}</div></li>`;
        template += '<li class="confirm"><a href="javascript:void(0)" data-action="close">确定</a></li>';
        template += '</ul>';
      }
    }
    return template;
  }

  bindEvents() {
    var that = this;
    this.modal.on('click', '[data-action]', function(e) {
      const target = $(this);
      const action = target.attr('data-action');
      if (action && that.events[action]) {
        that.events[action](target, that);
        that.close();
      }
    });
  }
}

export default {
  list: options => {
    new MessageBox({
      type: 'list',
      customOptions: options,
    }).show();
  },

  error: (message, cb) => {
    new MessageBox({
      type: 'error',
      message,
      cb
    }).show();
  }
}