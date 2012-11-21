/*
*/
var wH=window.screen.availHeight;
var wW=window.screen.availWidth;
var imgReader=new FileReader();
imgReader.onload = function imgPreview(e) {
	//
	if ($('#stretch img').data('imgAreaSelect')) {
		$('#stretch img').data('imgAreaSelect').cancelSelection();
	}
	var imgSrc=e.target.result;
	$(".editBox h2").text("请剪裁");
	$(".editBox h3").text("");
	$(".editBox p").text("猛击右侧图片并撕一块，左侧会出现预览图，满意后保存。").removeClass("warning");
	$('#save').removeClass("hidden");
	//img for preview
	$('#preview img').css({opacity:0,margin:0})
	.attr('src',imgSrc)
	.css({opacity:1});
	//big img similar to origin
	$("#stretch img").css({opacity:0})
	.removeClass('hidden')
	.attr('src',imgSrc)
	.css({opacity:1})
	.imgAreaSelect({ aspectRatio: '1:1', onSelectChange: preview });
};


function readImg(e) {
	var imgFile=e.target.files[0];
	var type=imgFile.type.split('/')[0];
	if (type!='image') {
		$(".editBox h2").text("不行啊!");
		$(".editBox h3").text("你选的不是图片文件吧!");
		$(".editBox p").text("请重现选择.").addClass("warning");
		$(e.target).closest('.avEdit').find('img').attr('src','').css({opacity:0});
		$('#save').addClass("hidden");
		modalOffset();
	}
	else if (imgFile.size>1048576) {
		$(".editBox h2").text("不行啊!");
		$(".editBox h3").text("你选的文件太大!");
		$(".editBox p").text("请选一张小于1M的.").addClass("warning");
		$(e.target).closest('.avEdit').find('img').attr('src','').css({opacity:0});
		$('#save').addClass("hidden");
		modalOffset();
	}
	else {
		imgReader.readAsDataURL(imgFile);
	}
}
function modalOffset() {
	mW=$('#modal').width();
	mH=$('#modal').height();
	newTop=(wH-mH)/3;
	newLeft=(wW-mW)/2;
	$('#modal').css({
			top:newTop,
			left:newLeft
		});
}
function preview(img, selection) { 
	imgW=$(img).width();
	imgH=$(img).height;
	ratio=$(img).getOriginWH()[0]/imgW;
	scale=90/selection.width;
	$('#preview img').css({ 
		width: Math.round(scale*imgW) + 'px', 
		height: Math.round(scale*imgH) + 'px', 
		marginLeft: '-' + Math.round(scale*selection.x1) + 'px', 
		marginTop: '-' + Math.round(scale*selection.y1) + 'px' 
	}); 
	$('input[name=x1]').val(Math.round(ratio*selection.x1)); 
	$('input[name=y1]').val(Math.round(ratio*selection.y1)); 
	$('input[name=x2]').val(Math.round(ratio*selection.x2)); 
	$('input[name=y2]').val(Math.round(ratio*selection.y2));
	$('input[name=w]').val(Math.round(ratio*selection.width));
	$('input[name=h]').val(Math.round(ratio*selection.height));
} 

$.fn.getOriginWH = function() {
	tmp=new Image();
	tmp.src=$(this).attr("src");
	return [tmp.width,tmp.height];
};

function sendData() {
	var data=new FormData(document.getElementById('fileInfo'));
	var $this=$(this);
	//The better is making a validation of the form before ajax.
	$('body').ajaxVisualEffect('stretch',200);
	$this.ajaxStart(function () {
		$('#stretch img').addClass('hidden');
		$('#save').addClass("hidden");
		$(".editBox h2").text("正在保存...");
		$(".editBox h3").text("");
		$(".editBOx p").text("稍等~");
		if ($('#stretch img').data('imgAreaSelect')) {
			$('#stretch img').data('imgAreaSelect').cancelSelection();
		}
		modalOffset();
	}).ajaxStop(function () {
		//modalOffset();?why no modalOffset can offset the modal囧？
		$this.unbind('ajaxStart ajaxStop');
	});
	$.ajax({
			url:'/avatar/update/',
			type:'post',
			dataType:'json',
			data:data,
			success:function(result){
				if (result.url) {
					$('#userAvatar img').fadeOut('slow');
					$(".editBox h2").text(result.msg);
					$(".editBox h3").text("o(≧v≦)o~~");
					$(".editBox p").text("现在你可以关闭该窗口~");
					$('#userAvatar img').attr('src',result.url).fadeIn('slow');
				}
				else {
					$(".editBox h2").text("Oops~");
					$(".editBox h3").text("(+﹏+)~");
					$(".editBox p").text("毁了!");
					$('#save').removeClass("hidden");
				}
			},
			processData:false,
			contentType: false
	});
}