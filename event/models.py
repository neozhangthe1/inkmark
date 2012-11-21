from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.contrib.auth.models import User

class Event(models.Model):
	'''
	base class of event
	'''
	user=models.ForeignKey(User)
	stamp=models.DateTimeField('time-stamp',auto_now=True)
	radio = models.BooleanField('broadcast-or-not',default=True)
	content_type=models.ForeignKey(ContentType,verbose_name='event-object-model-type')
	object_id=models.PositiveIntegerField('event-object-id')
	event_object=generic.GenericForeignKey()
	
	class Meta:
		abstract=True
		ordering=['-stamp','-id']
		unique_together=(('user','content_type','object_id'),)

class Rate(Event):
	score = models.IntegerField()
	def __unicode__(self):
		return '%s_%s_rated_sth' % (self.user.username,self.stamp)
class Favor(Event):
	comment=models.ForeignKey('Comment',blank=True,null=True)
	def __unicode__(self):
		return '%s_favored_%s' % (self.user.username,self.event_object)

class Comment(Event):
	words=models.TextField()

	def __unicode__(self):
		return self.words

	def _get_responses(self):
		'''return the comments responsing to self, which is queryset.
		'''
		objType=ContentType.objects.get_for_model(self)
		objModel=objType.model_class()
		#ContentType's id of self
		typePick=objType.id
		#self.id
		idPick=self.id
		return objModel.objects.filter(content_type=typePick,object_id=idPick).order_by('id')
	responses=property(_get_responses)

	class Meta:
		unique_together=()

class Slobber(models.Model):
	words=models.TextField()
	user=models.ForeignKey(User,related_name='slobber')
	stamp=models.DateTimeField('time-stamp',auto_now_add=True)
	response=generic.GenericRelation(Comment)
	def __unicode__(self):
		return self.words