from django.db import models
from django.contrib.auth.models import User
from event.models import *


class Portrait(models.Model):
	user=models.OneToOneField(User,primary_key=True)
	nick=models.CharField('Nickname',max_length=30,blank=True)
	avatar=models.ImageField(upload_to='pics',blank=True)
	sign=models.TextField('Signature',blank=True)

	
	def __unicode__(self):
		return self.nick

	#by getting attr 'avatar_url', if no avatar file stored, the url can be returned as ''.
	#When rendering template, 'default' filter can be used to convert the empty url to a default url
	#to a default avatar image, sth like "portrait.avatar_url|default:'/static/pic/da.png'".
	def _get_avatar_url(self):
		try:
			return self.avatar.url
		except ValueError:
			return ''
	avatar_url=property(_get_avatar_url)

class Friendship(models.Model):
	ship_from=models.ForeignKey(User,related_name='fan_net')
	ship_to=models.ForeignKey(User,related_name='star_net')
	create_date=models.DateTimeField(auto_now_add=True)
	
	def __unicode__(self):
		return '%s_follows_%s' % (self.ship_from.username,self.ship_to.username)
	class Meta:
		ordering=['create_date']
		unique_together=(('ship_from','ship_to'),)
		
		
class Nufan(models.Model):
	listener=models.ForeignKey(User,related_name='fan_knock')
	fan=models.ForeignKey(User)
	day=models.DateTimeField(auto_now_add=True)
	active=models.BooleanField(default=True)
	
	def __unicode__(self):
		return '%s_has_new_fan_%s'%(self.listener.username,self.fan.username)
	class Meta:
		unique_together=(('listener','fan'),)
'''
class Numsg(models.Model):
	listener=models.ForeignKey(User,related_name='msg_knock')
	msg=models.ForeignKey(Comment)
	where=models.ForeignKey('Blog')
	
	class Meta:
		unique_together=(('listener','msg'),)
'''
class Blog(models.Model):
	'''
	A blog should be obligated to the format "who did what with words that ..."
	eg. XiaoMing<who> added<did> a bookmark<what>, saying "brilliant!"<words>
	'''
	who=models.ForeignKey(User,related_name='blogs')
	BEHAVIOR_TYPE=(
		(u'A',u'added this link'),
		(u'C',u'marked this link'),
		(u'T',u'said'),
		(u'F',u'followed this guy'),
	)
	did=models.CharField(max_length=2,choices=BEHAVIOR_TYPE)
	content_type=models.ForeignKey(ContentType,null=True)
	object_id=models.PositiveIntegerField(null=True)
	what=generic.GenericForeignKey()
	words=models.TextField(blank=True)
	yue=models.BooleanField(default=False)
	pub_date=models.DateTimeField(auto_now_add=True)
	
	class Meta:
		ordering=['-pub_date']
		unique_together=(('who','content_type','object_id'),)