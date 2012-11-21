
function vname() {
	var $this=$(this);
	var username=$this.val();
	$this.closest('.formfield').find('.inputtip').hide();
	var $thiserror=$this.closest('.formfield').prev().find('th');
	if (username!='') {
		$.getJSON(
			'/register/?username='+username,
			null,
			function (result) {
				if (result.error==null) {
					nameok=true;
					$thiserror.text('');
				}
				else {
					$thiserror.text(result.error);
				}
			}
		);
	}
	else {
		$thiserror.text('用户名不能为空');
	}
}
function vemail() {
	var $this=$(this);
	var email=$this.val();
	$this.closest('.formfield').find('.inputtip').hide();
	var $thiserror=$this.closest('.formfield').prev().find('th');
	if (email!='') {
		$.getJSON(
			'/register/?email='+email,
			null,
			function (result) {
				if (result.error) {
					$thiserror.text(result.error);
				}
				else {
					emailok=true;
					$thiserror.text('');
				}
			}
		)
	}
	else {
		$thiserror.text('邮箱不能为空');
	}
}
function vpwd() {
	$(this).closest('.formfield').find('.inputtip').hide();
	var $thiserror=$(this).closest('.formfield').prev().find('th');
	if ($(this).val()=='') {
		$thiserror.text('密码不能为空');
	}
	else {
		$thiserror.text('');
	}
}
function vcon() {
	$(this).closest('.formfield').find('.inputtip').hide();
	var $thiserror=$(this).closest('.formfield').prev().find('th');
	var pwd1=$(this).val();
	if (pwd1=='') {
		$thiserror.text('确认密码不能为空');
	}
	else {
		var pwd2=$('#registerform #id_pwd').val();
		if (pwd1==pwd2) {conok=true;$thiserror.text('');}
		else {$thiserror.text('密码不一致');}
	}
}
function vall() {
	if (nameok && emailok && conok) {
		$(this).submit();
	}
	else if ($('#registerform .error th').text()=='') {
		$('#registerform #id_username').blur();
		$('#registerform #id_email').blur();
		$('#registerform #id_pwd').blur();
		$('#registerform #id_con_pwd').blur();
	}

	return false;
}
$(function () {
	window.nameok=null;
	window.emailok=null;
	window.conok=null;
	$('#registerform input').focus(function () {
		$(this).closest('.formfield').find('.inputtip').fadeIn('slow')
		.end().prev().find('th').text('');
	});
	$('#registerform #id_username').blur(vname);
	$('#registerform #id_email').blur(vemail);
	$('#registerform #id_con_pwd').blur(vcon);
	$('#registerform #id_pwd').blur(vpwd);
	$('#registerform').submit(vall);
});