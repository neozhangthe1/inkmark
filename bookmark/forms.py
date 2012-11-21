from django import forms
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.forms import AuthenticationForm

import re

class register_form(forms.Form):
	username=forms.CharField(max_length=30,label="用户名")
	email=forms.EmailField(label="邮箱")
	pwd=forms.CharField(min_length=6,label="密码",widget=forms.PasswordInput())
	con_pwd=forms.CharField(min_length=6,label="确认密码",widget=forms.PasswordInput())
	def clean_con_pwd(self):
		'''
		Check the second password input is whether the same as the first.
		'''
		if 'pwd' in self.cleaned_data:
			pwd1=self.cleaned_data['pwd']
			pwd2=self.cleaned_data['con_pwd']
			if pwd1==pwd2:
				return pwd2
		raise forms.ValidationError('密码前后不一致!')
	def clean_username(self):
		'''
		First, check the username input, which should not contains punctuation marks, is whether legal or not.
		Second, check the username is whether taken or not.
		'''
		username=self.cleaned_data['username']
		if not re.match(r'^\w+$',username):
		#Some strings include '!@#$%^&*' will fail to pass this test.
		#Or using username.isalnum() to do judgement
			raise forms.ValidationError('不好意思，只能包含英文字母数字或下划线“_”.')
		try:
			user=User.objects.get(username=username)
		except ObjectDoesNotExist:
			return username
		raise forms.ValidationError('该用户名已经注册!')
	def clean_email(self):
		email=self.cleaned_data['email']
		try:
			user=User.objects.get(email=email)
		except ObjectDoesNotExist:
			return email
		raise forms.ValidationError('该邮箱已经注册!')

class login_form(AuthenticationForm):
	username=forms.CharField(max_length=30,label="用户名")
	password=forms.CharField(label="密码",widget=forms.PasswordInput())

	def __init__(self,request=None,*args,**kwargs):
		self.error_text=None
		super(login_form, self).__init__(request,*args, **kwargs)
	def clean(self):
		username = self.cleaned_data.get('username')
		password = self.cleaned_data.get('password')
		if username and password:
			try:
				user=User.objects.get(username=username)
			except ObjectDoesNotExist:
				self.error_text=u'用户名不存在，请注意大小写'
				raise forms.ValidationError('UsernameError')
			self.user_cache = authenticate(username=username, password=password)
			if self.user_cache is None:
				self.error_text=u'密码错误，请注意大小写'
				raise forms.ValidationError('PwdError')
			elif not self.user_cache.is_active:
				self.error_text=u'对不起，该账号已禁用'
				raise forms.ValidationError('PermissionError')
		else:
			self.error_text=u'用户名和密码不能为空！！！！！'
			raise forms.ValidationError('EmptyField')
		if self.request and not self.request.session.test_cookie_worked():
			self.error_text=u'对不起，您禁用了Cookie，请打开Cookie功能。'
			raise forms.ValidationError('CookiError')
		return self.cleaned_data



class bm_make_form(forms.Form):
	url=forms.URLField(label='URL',widget=forms.TextInput(attrs={'size':64}))
	title=forms.CharField(label='标题',widget=forms.TextInput(attrs={'size':64}))
	tags=forms.CharField(label='标签',required=False,widget=forms.TextInput(attrs={'size':64}))
	info=forms.CharField(label='简介',required=False,widget=forms.Textarea())
	
	def clean_url(self):
		url=self.cleaned_data['url']
		pattern=r'(^https?://.*\.(com|org).*)|(^https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}.*)'
		if not re.match(pattern,url):
			raise forms.ValidationError('输入的网址不正确')
		return url
	def clean_title(self):
		title=self.cleaned_data['title']
		if len(title)>100:
			raise forms.ValidationError('标题太长')
		return title
	def clean_tags(self):
		tags=self.cleaned_data['tags']
		tag_list=tags.strip().split(' ')
		if len(tag_list)>10:
			raise forms.ValidationError('不要超过10个标签')
		for tag in tag_list:
			if len(tag)>50:
				raise foms.ValidationError('每个标签的长度不要超过50个字符')
		return tags
	def clean_info(self):
		info=self.cleaned_data['info']
		if len(info)>400:
			raise forms.ValidationError('简介太长')
		return info

class search_form(forms.Form):
	query=forms.CharField(label='关键词:',required=False,widget=forms.TextInput())
