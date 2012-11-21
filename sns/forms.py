from django import forms
from django.template.defaultfilters import filesizeformat
from inkmark import settings
class avForm(forms.Form):
	avFile=forms.ImageField()
	x1=forms.IntegerField(initial=0,widget=forms.HiddenInput())
	y1=forms.IntegerField(initial=0,widget=forms.HiddenInput())
	x2=forms.IntegerField(initial=90,widget=forms.HiddenInput())
	y2=forms.IntegerField(initial=90,widget=forms.HiddenInput())
	w=forms.IntegerField(initial=90,widget=forms.HiddenInput())
	h=forms.IntegerField(initial=90,widget=forms.HiddenInput())
	def clean_avFile(self):
		file = self.cleaned_data['avFile']
		if file:
			if len(file.name.split('.')) == 1:
				raise forms.ValidationError('文件格式不支持')
			file_type = file.content_type.split('/')[0]
			if file_type in settings.UPLOAD_FILE_TYPES:
				if file._size > settings.UPLOAD_FILE_MAX_SIZE:
					raise forms.ValidationError('文件应小于%s' % filesizeformat(settings.UPLOAD_FILE_MAX_SIZE))
			else:
				raise forms.ValidationError('文件格式不支持')
		return file
