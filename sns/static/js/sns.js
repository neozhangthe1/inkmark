function relation(event) {
	var $this=$(event.target);
	var href=$this.attr('href');
	$.ajax({
		url:href,
		type:'post',
		data:null,
		dataType:'json',
		success:function (result) {
			if (result.flag!='failure') {
				$this.toggleClass('unfollow').toggleClass('follow');
				refresh(result.flag);
			}}
		});
	event.preventDefault();
	event.stopPropagation();
}

function refresh(flag) {
	if (flag==0 | flag==2) {
		$('#rManager a').attr('href','\/follow\/'+username+'\/').text('follow this guy');
	}
	else {
		$('#rManager a').attr('href','\/unfollow\/'+username+'\/').text('unfollow');
	}
	$('.fstate img:eq(1)').attr('src','/static/pic/r'+flag+'.png');
}
function get_sns() {
	var $this=$(this);
	var href=$this.attr('href');
	$.get(href,null,function (result) {
		if ($('.data ul',result).length){
			$('.container').html($('.data ul',result).get(0));}
		else {$('.container').html(result);}
		$this.addClass('fixkey').siblings().removeClass('fixkey')
	});
	return false;
}
$(function () {
	$('.key').click(get_sns);
	
	$('#usr_pageh .fstate').hover(function () {
		$('#fstip').animate({width:'110px',height:'30px'},400);
	},
	function () {
		$('#fstip').animate({width:'0',height:'0'},400);
	});
});