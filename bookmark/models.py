from django.db import models
from django.contrib.auth.models import User
from django.db.models import Count, Avg
from django.contrib.contenttypes import generic
from event.models import *

class Link(models.Model):
	'''
	the link model mainly means a URL 
	'''
	url=models.URLField(unique=True)

class Tag(models.Model):
	'''
	a model to implement the tag feature
	'''
	name=models.CharField(max_length=100,unique=True)
	def __unicode__(self):
		return self.name
	def get_absolute_url(self):
		return '/tag/%i/' % self.id

class Bookmark(models.Model):
	'''
	the bookmark model represents a object including
	title,user who creates it,and the link (as above),
	which construct a bookmark .
	'''
	title=models.CharField(max_length=100,blank=True)
	link=models.ForeignKey(Link,related_name='used_to')
	user=models.ForeignKey(User,related_name='bm_set')
	tags=models.ManyToManyField(Tag,related_name='to_bm',blank=True)
	info=models.TextField('Introduction',blank=True)
	rated_item=generic.GenericRelation(Rate)
	favored_item=generic.GenericRelation(Favor)
	comment=generic.GenericRelation(Comment)
	
	class Meta:
		ordering=['-id']
	
	def __unicode__(self):
		return self.title
	def get_absolute_url(self):
		return '/bookmark/%i/' % self.id
	def favor_times(self):
		return self.favored_item.all().count()
	def avg_rating(self):
		return self.rated_item.all().aggregate(Avg('score'))['score__avg']
	def cmt_times(self):
		return self.comment.all().count()
	def rated_times(self):
		return self.rated_item.all().count()
