function rating_save() {
	var $this=$(this);
	var url=$this.attr("href");
	$.getJSON(url,function (result) {
			if (!result.flag) {
				$('#prompt .msg').html('<h1>f**k,保存失败</h1>');
				timer=setTimeout("$('#prompt .msg').html('')",2000);
			}
			else {
				if (!$('#ron').text()){$('#ron').text('我的评分::');}
				$(".rating_tool a").removeClass("mouse_on");
				$this.addClass("fix").parent().prevAll().children("a").addClass("fix");
				$this.parent().nextAll().children("a").removeClass("fix");
			}
		}
	);
	return false;
}
function vwords() {
	var $this=$(this);
	var words=$this.val();
	if (strlen(words)>400) {
		$('#fcmodal .texterror').text('评论不能超过400个字符');
	}
	else {$('#fcmodal .texterror').text('')}
	return false;
}
function add_favor() {
	var $this=$(this);
	var href=$this.attr('href');
	$('#fcmodal').find('#url').val(href).end()
	.find('#cmttype').val('f').end()
	.find("label[for='cmt_in']").text('顺便说说收藏的理由吧：').end()
	.find('#submit').val('收藏').end();
	mask.show({closeOnClick:false});
	$('#fcmodal').fadeIn();
	return false;
}
function add_comment() {
	var $this=$(this);
	var href=$this.attr('href');
	$('#fcmodal').find('#url').val(href).end()
	.find('#cmttype').val('c').end()
	.find("label[for='cmt_in']").text('添加评论：').end()
	.find('#submit').val('保存').end();
	mask.show({closeOnclick:false});
	$('#fcmodal').fadeIn();
	return false;
}
function post_favor_comment()  {
	var $this=$(this);
	if ($this.find('#cmttype').val()=='c' && $this.find('textarea').val()=='') {
		$this.find("label[for='cmt_in']").text('评论不能为空！');
		return false;
	}
	var href=$this.find('#url').val();
	var data=null;
	if ($this.find('textarea').val()!='') {
		data={words:$this.find('textarea').val()};
	}
	if (!$('#fcmodal .texterror').text()) {
	$.post(
		href,
		data,
		function (result) {
			if (result!='ok') {
				$('#entry_comments ul').prepend($('li',result).get(0));
				if ($('#nocmt').length) {
					$('#nocmt').remove();
				}
			}
			if ($this.find('input:hidden').val()=='f') {
				$('#add_favor a').before('<a class="favor" href="#">already favored</a>')
				.remove();
			}
			$('#fcmodal #cancel').click();
		}
	);}
	return false;
}
function rater_init(src,score) {
	var $rater=$(src);
	$('a',$rater).hover(
		function () { $(this).addClass("mouse_on").parent().prevAll().children("a").addClass("mouse_on");},
		function () { $('a',$rater).removeClass("mouse_on");}
	)
	.click(rating_save);
	if (score) {
		$('a',$rater).slice(0,score).addClass('fix');
	}
}
$(function () {
	if ($('#fcmodal').length) {
		//if fcmodal found, it can be implied that user has logged in.
		//then do initialization.
		var mtop=(wH-200)/3;
		var mleft=(wW-500)/2;
		$('#fcmodal').css({top:mtop,left:mleft})
		.submit(post_favor_comment)
		.find('#cancel').click(function () {
			$('#fcmodal').hide(function () {
				$('#fcmodal').find('textarea').val('').end()
				.attr('href','#');
			});
			if (mask.layer){mask.close();}
		}).end()
		.find('#cmt_in').blur(vwords)
		.focus(function() {$('#fcmodal .texterror').text('')});
		$('#entry_apex .not_favor').click(add_favor);
		$('#add_comment').click(add_comment);
		//initializing rater
		rater_init($('.rating_tool'),ron);
	}
	else {
		$('#entry_apex .not_favor,#add_comment,#rater a').click(gologin);
	}
});