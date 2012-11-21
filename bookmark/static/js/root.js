var wH=window.screen.availHeight;
var wW=window.screen.availWidth;
var mask=new overlay();
var timer=null;
$("html").ajaxSend(function (event,xhr,settings) {
	function getCookie(name) {
		var cookieValue=null;
		if (document.cookie && document.cookie!='') {
			var cookies=document.cookie.split(";");
			for (var i=0; i<cookies.length; i++) {
				var cookie=jQuery.trim(cookies[i]);
				//Does this cookie string begin with the name needed?
				if (cookie.substring(0,name.length + 1) == (name + '=')) {
					cookieValue=decodeURIComponent(cookie.substring(name.length+1));
					break;
				}
			}
		}
		return cookieValue;
	}
	if (!(/^http:.*/.test(settings.url)|| /^https:.*/.test(settings.url))) {
		xhr.setRequestHeader("X-CSRFToken",getCookie('csrftoken'));
	}
});
function strlen(str){
	//helper function to return the length of a string, differing alnum and chinese char.
	var len = 0;  
	for (var i=0; i<str.length; i++) {   
		var c = str.charCodeAt(i);      
		if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {len++;}   
		else {len+=2;}
	}   
	return len;  
} 
function gologin() {
	$('#prompt .msg').html('<h2>登录后才能操作。没有账号？<a href="/register/">点此注册</a></h2>');
	window.scrollTo(0,0);
	return false;
}
function login() {
	var $this=$(this);
	if ($this.find('#login_username').val()==''||$this.find('#login_pwd').val()=='')
	{$('#prompt .msg').html('<h2>用户名或密码不能为空！！！</h2>');
	return false;}
	else {$this.find('#login_next').val(document.URL).end().submit();}
}
function avatarEdit() {
	mask.show({'closeOnClick':false});
	$('body').ajaxVisualEffect('overlay',300);
	$.ajax({
		url:'/avatar/editor/',
		type:'get',
		dataType:'html',
		success:function(result) {
			$('body').append($(result));
			$('#modal-close').click(function() {
				mask.close();
				$("#modal").fadeOut().remove();
			});
		}
	});
}

function enter(event) {
	if (event.keyCode == 13) { 
		event.returnValue = false;
		event.cancel = true;
		$(this).closest('form').submit();
	}
}
function lenthen() {
	$(this).toggleClass("long_input");
}
function shorten() {
	$(this).toggleClass("long_input");
}
function clear() {
	if ($(this).val()=='内容不能为空！') {
		$(this).val('').css({color:'#000'});
	}
}
function edit_nick() {
	$('#usr_nick').hide();
	var nick_input=$('<div><label for="nick_input">编辑昵称：</label>\
	<input type="text" id="nick_input"/>\
	<div><span class="button ns_save">保&nbsp;&nbsp;存</span>\
	<span class="button cancel">取&nbsp;&nbsp;消</span></div></div>');
	$('input',nick_input).val($('#usr_nick').text().trim());
	$('.ns_save',nick_input).click(function () {
		var value=$('input',nick_input).val();
		$('span',nick_input).hide();
		$('div',nick_input).append('<span id="nslc"></span>');
		$(this).ajaxVisualEffect('nslc',30);
		$.ajax({
			url:'/nickorsign/',
			type:'post',
			data:{nick:value},
			dataType:'json',
			success:function (result) {
				if (result.changed) {
					nick_input.remove();
					$('#usr_nick').text(result.changed).fadeIn();
				}
			}
		});
	});
	$('.cancel',nick_input).click(function () {
		nick_input.fadeOut('fast').remove();
		$('#usr_nick').fadeIn();
	});
	$('#usr_nick').before(nick_input);
}
function edit_sign() {
	$('#usr_sign').hide();
	var sign_input=$('<div><label for="sign_input">编辑签名：</label>\
	<textarea rows="1" id="sign_input"></textarea>\
	<div><span class="button ns_save">保&nbsp;&nbsp;存</span>\
	<span class="button cancel">取&nbsp;&nbsp;消</span></div></div>');
	$('.ns_save',sign_input).click(function () {
		var value=$('textarea',sign_input).val();
		value=value==''?' ' :value;
		$('span,textarea',sign_input).hide();
		$('div',sign_input).append('<span id="nslc"></span>');
		$(this).ajaxVisualEffect('nslc',15);
		$.ajax({
			url:'/nickorsign/',
			type:'post',
			data:{sign:value},
			dataType:'json',
			success:function (result) {
				if (result.changed) {
					sign_input.remove();
					$('#sign_text').text(result.changed);
				}
				$('#usr_sign').fadeIn();
			}
		});
	});
	$('.cancel',sign_input).click(function () {
		sign_input.fadeOut('fast').remove();
		$('#usr_sign').fadeIn();
	});
	$('#usr_sign').before(sign_input);
}

function walkietalkie(event) {
	var $thisform=$(event.target);
	var href=$thisform.attr('action');
	var data=$thisform.find('textarea').val().trim();
	if (strlen(data)>300) {
		$('#twerror').text('不能超过150字或300字符');
	}
	else if (data==''||data=='说点什么？') {
		$('#twerror').text('内容不能为空！');
	}
	else {
	$thisform.find('.talkiesub').prepend('<span id="twcl"></span>');
	$thisform.ajaxVisualEffect('twcl',24);
	$.post(
		href,
		{words:data},
		function (result) {
			if (result!='noneHtml'&& $('#blog_list').length) {
				$('#blog_list').prepend($('li',result));
			}
			$thisform.find('textarea').val('');
			$('#twcl').remove();
		}
	);
	}
	event.preventDefault();
	event.stopPropagation();
}

function countw() {
	var overflow=strlen($(this).val())-300;
	if (overflow>0) {
		$('#twerror').text('-'+overflow);
	}
	else {$('#twerror').text('');}
}
function post_bm() {
	var $this_bm=$(this).parent();
	var data={
		url:$this_bm.find("#id_url").val(),
		title:$this_bm.find("#id_title").val(),
		tags:$this_bm.find("#id_tags").val(),
		info:$this_bm.find("#id_info").val()
	};
	$.post(
		"/bookmark/save/",
		data,
		function (result) {
			if (result!='failure') {
				$this_bm.before($("table.basic",result).get(0));
				$this_bm.remove();
			}
			else {
				alert("Something is wrong!");
			}
		}
	);
	return false;
}
function get_bm(event) {
	var $this=$(event.target)
	var $editArea=$('<div></div>').prependTo($this.closest('div'));
	var href=$this.attr("href");
	$editArea.load(href, null, function (result) {
		$("#bm_edit").submit(post_bm);
		$this.closest('table').prev().remove();
	});
	event.preventDefault();
	event.stopPropagation();
}

function show_response(event) {
	var $this=$(event.target);
	$this.before('<span id="rsplc"></span>');
	$('body').ajaxVisualEffect('rsplc',20);
	var href=$this.attr('href');
	var $parent=$this.parent();
	$.get(
		href,
		null,
		function (result) {
			var $result=$(result);
			$parent.find('#rsplc').remove();
			$this.hide().before('<span class="label pull-right">Hide</span>');
			$parent.after($result);
			$('span.label',$parent).click(function () {
				$result.remove();
				$(this).remove();
				$this.show();
			});
			$('#response-submit',$result).click(function (event) {
				add_response(event,href);
			});
			$('.response-input',$result).focus(clear);
		}
	);
	event.preventDefault();
	event.stopPropagation();
}
function add_response(event,href) {
	var $this=$(event.target);
	var value=$this.parent().find('input').val();
	var $appendto=$this.closest('.add_response').prev();
	var $responses=$this.parent().prev();
	if (value.trim()!='') {
	$responses.append('<div id="rsplc"></div>');
	$('body').ajaxVisualEffect('rsplc',22);
	$.post(
		href,
		{words:value},
		function (result) {
			$responses.find('#rsplc').remove();
			if (result!='login_required') {
				var $me=$('<a></a>')
					.attr('href',$('.avatar',result).attr('href'))
					.text('Me ')
					.wrap('<p></p>')
					.appendTo($appendto)
					.after(': &quot;'+$('p.cmtwds',result).text()+'&quot;');
			}
			else {gologin();}
		}
	);}
	else {$this.prev().val('Content can not be empty！').css({color:'#FF0000'});}
}
$(function () {
	loader=new CanvasLoader();
	
	$.fn.ajaxVisualEffect = function (id,d) {
		$(this).ajaxStart(function() {
			loader.show(id,{
				diameter:d,
				top:($('#'+id).height()-d)/2,
				left:($('#'+id).width()-d)/2
			});
		}).ajaxStop(function() {
			loader.remove();
			$(this).unbind('ajaxStart ajaxStop');
		});
	};
	if ($('#register_any').length){
	var regImgTop=$('#register_any').offset().top-8;
	var regImgLeft=$('#register_any').offset().left;
	var regCssTop=$('#register_any').css('top');
	var regCssLeft=$('#register_any').css('left');
	$(window).scroll(function () {
		if ($(window).scrollTop()>=regImgTop) {
			$('#register_any').css({position:"fixed",top:0,left:regImgLeft});
		}
		else {
			$('#register_any').css({position:"absolute",top:regCssTop,left:regCssLeft});
		}
	});
	}
	if ($('#talk').length) {
		$('#talk textarea').keydown(countw).focus(function () {
			$('#twerror').text('');
			if ($(this).val()=='说点什么？')
			{$(this).val('');}
			$(this).css({color:'#000'});
		}).blur(function (){
			if ($(this).val().trim()=='')
			{$(this).val('说点什么？').css({color:'#D4D4D4'});}
		});
		$('#talk textarea').val('说点什么？').css({color:'#D4D4D4'});
	}
	if ($('#login_form').length) {
		$('#login_form form').submit(login);
	}
	$('#nav_query,#id_query').keydown(enter);
	$('#nav_query').blur(shorten).focus(lenthen);
	$('#id_query').blur(shorten).focus(lenthen);
})