function vurl() {
	$(this).closest('.formfield').find('.inputtip').hide();
	var $this=$(this);
	var value=$this.val();
	if (value.trim()!=''){
	var pattern=/(^https?:\/\/.*\.(com|org).*)|(^https?:\/\/\d{1,4}\.\d{1,4}\.\d{1,4}\.\d{1,4}.*)/i
	if (!pattern.test(value)) {
		$this.closest('.formfield').prev().text('输入的网址不正确');
	}
	else {
		urlok=true;
		$this.closest('.formfield').prev().text('');
	}}
	else {$this.closest('.formfield').prev().text('网址不能为空');}
}
function vtitle() {
	$(this).closest('.formfield').find('.inputtip').hide();
	var $this=$(this);
	var value=$this.val();
	if (value.trim()!='') {
	if (strlen(value)>100) {
		$this.closest('.formfield').prev().text('标题太长');
	}
	else {
		titleok=true;
		$this.closest('.formfield').prev().text('');
	}}
	else {$this.closest('.formfield').prev().text('标题不能为空');}
}
function vtags() {
	$(this).closest('.formfield').find('.inputtip').hide();
	var $this=$(this);
	var value=$this.val();
	var value_list=value.trim().split(' ');
	var flag1=false;
	var flag2=true;
	if (value_list.length>10) {
		$this.closest('.formfield').prev().text('标签不能超过10个');
	}
	else {flag1=true;}
	if (flag1) {
	for (var v in value_list) {
		if (strlen(value_list[v])>50) {
			$this.closest('.formfield').prev().text('标签不能超过50个字符');
			flag2=false;
			break;
		}
	}}
	if (flag1&&flag2) {
		tagsok=true;
		$this.closest('.formfield').prev().text('');
	}
	else {tagsok=false;}
}
function vinfo() {
	$(this).closest('.formfield').find('.inputtip').hide();
	var $this=$(this);
	var value=$this.val();
	if (strlen(value)>400) {
		$this.closest('.formfield').prev().text('简介不能超过400个字符');
		infook=false;
	}
	else {
		infook=true;
		$this.closest('.formfield').prev().text('');
	}
}
function vall() {
	if (urlok && titleok && tagsok && infook) {
		$(this).submit();
	}
	else if ($('#bm_edit .error').text()=='') {
		$('#bm_edit #id_url').blur();
		$('#bm_edit #id_title').blur();
		$('#bm_edit #id_tags').blur();
		$('#bm_edit #id_info').blur();
	}
	return false;
}
$(function () {
	window.urlok=null;
	window.titleok=null;
	window.tagsok=true;
	window.infook=true;
	$('#id_url,#id_title,#id_tags,#id_info').focus(function () {
		$(this).closest('.formfield').find('.inputtip').fadeIn('slow')
		.end().prev().text('');
	});
	$('#bm_edit #id_url').blur(vurl);
	$('#bm_edit #id_title').blur(vtitle);
	$('#bm_edit #id_tags').blur(vtags);
	$('#bm_edit #id_info').blur(vinfo);
	$('#bm_edit').submit(vall);
});