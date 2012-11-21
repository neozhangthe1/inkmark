from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
#django framework
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
#mine
from event.models import *
from sns.models import *
from sns.views import _broadcast
import re
def _lookup_obj(queryset,obj_id=None,slug=None,slugField=None):
	if obj_id:
		obj=queryset.get(pk=obj_id)
	elif slug and slugField:
		kw={slugField:slug}
		obj=queryset.get(**kw)
	else:
		raise Http404('Motherf**ker Not Found!')
	return obj

def json_pack(feed):
	encoder=DjangoJSONEncoder()
	return HttpResponse(encoder.encode(feed))

@login_required
def rater(request,score,content_type,obj_id):
	if request.is_ajax():
		app_name,model_name=content_type.split('.')
		rating_type=ContentType.objects.get(app_label=app_name,model=model_name)
		modelClass=rating_type.model_class()
		obj=_lookup_obj(modelClass.objects.all(),obj_id=obj_id)
		try:
			rating=Rate.objects.get(
				user=request.user,
				content_type=rating_type.id,
				object_id=obj.id
			)
			rating.score=score
			rating.save()
		except ObjectDoesNotExist:
			rating=Rate(
				event_object=obj,
				score=score,
				user=request.user,
			)
			rating.save()
		feed={'flag':True,'score':score}
		return json_pack(feed)
		
	else:
		raise Http404('Opps!Not Found!')

@login_required
def collector(request,content_type,obj_id):
	if request.is_ajax() and request.method=='POST':
		app_name,model_name=content_type.split('.')
		favoring_type=ContentType.objects.get(app_label=app_name,model=model_name)
		modelClass=favoring_type.model_class()
		obj=_lookup_obj(modelClass.objects.all(),obj_id=obj_id)
		try:
			favoring=Favor.objects.get(
				user=request.user,
				content_type=favoring_type.id,
				object_id=obj.id
			)
			return HttpResponse('already favored')
		except ObjectDoesNotExist:
			favoring=Favor.objects.create(
				event_object=obj,
				user=request.user,
			)
			if request.POST.has_key('words'):
				words=request.POST['words']
				comment=Comment.objects.create(
					words=words,
					user=request.user,
					event_object=obj,
				)
				favoring.comment=comment
				favoring.save()
			else:
				words=''
			#generate a new blog
			news=_broadcast(request.user,'C',obj,words)
			if locals().has_key('comment'):
				return render_to_response('event/comments_show.html',{'comments':[comment]})
			return HttpResponse('ok')
	else:
		raise Http404('Opps!Wrong number!')

@login_required
def talk(request):
	if request.is_ajax() and request.method=='POST':
		words=request.POST['words'].strip()
		if words:
			slobber=Slobber.objects.create(user=request.user,words=words)
			news=_broadcast(request.user,'T',slobber,words)
			if request.META.has_key('HTTP_REFERER'):
				if re.match(r'http://[^/]+/home/$',request.META['HTTP_REFERER']):
					return render_to_response('sns/blog_list.html',{'blogs':[news]})
			return HttpResponse('noneHtml')
		else:
			return HttpResponse('failure')
	raise Http404('Opps~~~~')

def comment(request,app_model,obj_id):
	if request.is_ajax():
		app_name,model_name=app_model.split('.')
		comment_type=ContentType.objects.get(app_label=app_name,model=model_name)
		modelClass=comment_type.model_class()
		obj=_lookup_obj(modelClass.objects.all(),obj_id=obj_id)
		if request.method=='POST':
			if request.user.is_authenticated():
				words=request.POST['words']
				comment=Comment.objects.create(
					words=words,
					user=request.user,
					event_object=obj,
				)
				return render_to_response('event/comments_show.html',{'comments':[comment]})
			else:
				return HttpResponse('login_required');
		else:
		#if not a post-method request, it's expecting comments to a certain comment
			comments=Comment.objects.filter(content_type=comment_type.id,object_id=obj.id)
			return render_to_response('event/responses.html',{'responses':comments},
			context_instance=RequestContext(request))
	raise Http404('Opps~!Wrong~')
@login_required
def get_slobbers(request,username):
	if request.is_ajax():
		user=get_object_or_404(User,username=username)
		slobbers=Slobber.objects.filter(user=user)
		return render_to_response('sns/slobber_list.html',{'slobbers':slobbers})
	raise Http404('Wrong number')