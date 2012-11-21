var overlay=function(opts) {
	var DEFAULT={
		color: '#000',
		opacity: 0.5,
		width:window.screen.availWidth,
		height:window.screen.availHeight,
		closeOnClick:true
	};
	var iTop = 0;
	if($.browser.mozilla) { 
		iTop = $('html').scrollTop();
	} else {
		iTop = $('body').scrollTop();
	}
	function create(opts) {
		//this function will create a overlay layer, a jQuery object, and return it.
		var layer = $('<div></div>')
		.attr('id','overlay')
		.css({
			background: opts.color,
			opacity: opts.opacity,
			top: iTop,
			left: 0,
			width: opts.width,
			height:opts.height,
			position: 'fixed',
			zIndex: 1000,
			display: 'none',
			overflow: 'hidden',
			MozBoxAlign:'center'
		});

		return layer;
	}
	function show(src,opts) {
		if(!$('body').hasClass('overlayed')) {
			//prevents adding multiple overlays, by using body's class as flag.
			opts=$.extend({}, DEFAULT, opts);
			src.layer=create(opts);
			if (opts.closeOnClick){
				$(src.layer).click(function() {
					close(src);
				});
			}
			$('body').append(src.layer);//addd the overlay to document
			src.layer.fadeIn('fast',function() {
				$('body').addClass('overlayed')
				.css('overflow','hidden');
				});
		}
	}
	function close(src) {
		src.layer.fadeOut('fast',function() {
			if (src.layer.get(0).onClose) {
				src.layer.trigger('onClose');//trigger the onClose event, if a handler exists.
			}
			src.layer.remove();//remove the overlay DOM from document
			delete src.layer;//fully delete the layer attribute
			$('body').removeClass('overlayed')
			.css('overflow', 'auto');
		});

		
	}
	return {
		show:function (opts) {show(this,opts);},
		close:function () {close(this);}
	};
}