import $ from 'jquery';

function calcFontSize(base, mutation, fontSizeContext) {
	fontSizeContext = fontSizeContext || 16;
	return (mutation > base ? 1 : (mutation / base)) * fontSizeContext + 'px';
}

export default function(el) {  
  el.find('[font-zoom]').each(function(el) {
    var $el = $(this);
    var base = +$el.attr('font-zoom');
    $el.css('fontSize', calcFontSize(375, window.innerWidth, 12));
  });

  var rImg = el.find('.result-image');

  //set image container size
  var rParent = rImg.parent();
  var h = rParent.height();
  rImg.css('width', h + 'px');
  rParent.find('.result-text').css('marginLeft', h + 'px');

  //set image overflow direction
  function handleImage(img) {
    if (img.width >= img.height) {
      rImg.addClass('center').removeClass('middle');
    } else {
      rImg.addClass('middle').removeClass('center');
    }
  }
  rImg.find('img').each(function() {
    if (this.complete || $(this).height() > 0) {
      handleImage(this);
    } else {
      $(this).on('load', function() {
        handleImage(this);
      });
    }
  });
}