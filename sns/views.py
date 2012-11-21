from django.http import HttpResponse,Http404
from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.utils import simplejson
from django.db.models import Q
from django.views.generic import ListView
from PIL import Image
from sns.forms import *
from sns.models import *
from django.core.files.uploadedfile import InMemoryUploadedFile
import StringIO
from hashlib import md5
@login_required
def user_entry(request,username):
	isLogin=request.user.is_authenticated()
	if isLogin and username==request.user.username:
		return redirect('/home/')
	user=get_object_or_404(User,username=username)
	if isLogin:
		flag=_sm(user,request.user)
	variables={
	'username':username,
	'person':user,
	'show_tags':True,
	'FLAG':locals().get('flag',0),
	'ban':True
	}
	return render_to_response('sns/user_page.html',variables,
	context_instance=RequestContext(request))
def _sm(sade,masoch):
	A=sade.fan_net.filter(ship_to=masoch) and 1 or 0
	B=sade.star_net.filter(ship_from=masoch) and 1 or 0
	return A*2+B

@login_required
def av_edit(request):
	if request.is_ajax():
		return render_to_response('sns/avatar.html')
	else:
		raise Http404('Sorry!')

def _portrait_set(request,avFile=None,data=None):
	try:
		portrait,created=Portrait.objects.get_or_create(user=request.user)
		if avFile and data:
			if not created and portrait.avatar.name!='':
				origin_name=portrait.avatar.name
				portrait.avatar.delete()
			else:
				origin_name=request.user.username
			img=Image.open(avFile)
			img_str=StringIO.StringIO()
			img=img.transform((data['w'],data['h']),Image.EXTENT,(data['x1'],data['y1'],data['x2'],data['y2']))
			img.save(img_str,'JPEG')
			filename=md5(origin_name).hexdigest() + '.jpg'
			temp_file = InMemoryUploadedFile(img_str, None, data['avFile'].name, 'image/jpeg',img_str, None)
			portrait.avatar.save(filename,temp_file,save=True)
		if request.POST.has_key('nick'):
			portrait.nick=request.POST['nick']
			portrait.save()
		if request.POST.has_key('sign'):
			portrait.sign=request.POST['sign']
			portrait.save()
		return portrait,created
	except:
		return None,False
@login_required
def av_update(request):
	'''avatar update function'''
	if request.is_ajax() and request.method=='POST':
		pic=avForm(request.POST,request.FILES)
		if pic.is_valid():
			data=pic.cleaned_data
			avFile=request.FILES['avFile']
			portrait,numb=_portrait_set(request,avFile,data)
			url=portrait and portrait.avatar.url or None
			msg=url and u'Saved!' or u'Failed...'
		else:
			errors=pic.errors
			url=None
			msg=';'.join([v for k,v in errors.items()])
		variables={
			'url':url,
			'msg':msg
		}
		return HttpResponse(simplejson.dumps(variables))
	raise Http404('Sorry!')
@login_required
def ns_update(request):
	'''nickname and signature update function'''
	if request.is_ajax() and request.method=='POST':
		portrait,numb=_portrait_set(request)
		changed=request.POST.get('nick',None) or request.POST.get('sign',None)
		return HttpResponse(simplejson.dumps({'changed':changed}))
	raise Http404('Sorry!')
'''
@login_required
def portrait_set(request):
	pic=avForm()
	if request.method=='POST':
		if request.FILES:
			pic=avForm(request.POST,request.FILES)
			if pic.is_valid():
				data=pic.cleaned_data
				avFile=request.FILES['avFile']
				portrait,created=_portrait_set(request,avFile,data)
				if portrait:
					return HttpResponseRedirect('/home/')
				else:
					msg='出错了(+﹏+)~'
		else:
			portrait=_portrait_set(request)
			if portrait:
				return HttpResponseRedirect('/home/')
				msg='出错了(+﹏+)~'
	elif request.GET.has_key('init'):
		portrait,created=_portrait_set(request)
		if created:
			msg='注册成功！是填写个人资料的时候了，搞炫一点！'
		else:
			raise Http404('wrong number')
	variables={
		'form':pic,
		'msg':locals().get('msg',None)
	}
	return render_to_response('sns/portrait_set.html',variables,
	context_instance=RequestContext(request))
'''
@login_required
def follow(request,username):
	if request.is_ajax():
		if request.method=='POST':
			ship_from=request.user
			ship_to=get_object_or_404(User,username=username)
			friendship,created=Friendship.objects.get_or_create(ship_from=ship_from,ship_to=ship_to)
			if created:
				#Has the 'request.user' ever followed the 'ship_to' once before? 
				#If not, then create a message informing the 'ship_to'.
				msg,firstOrNot=Nufan.objects.get_or_create(listener=ship_to,fan=ship_from)
				#If its the first time that the 'request.user' followed 'ship_to', then broadcast,
				#which means no repeated twitter will be produced when a user repeatedly follows one.
				if firstOrNot:
					_broadcast(ship_from,'F',ship_to)
			flag=_sm(ship_to,ship_from)
			return HttpResponse(simplejson.dumps({'flag':flag}))
		return HttpResponse(simplejson.dumps({'flag':'failure'}))
	else:
		raise Http404('Sorry! Wrong number.')
@login_required
def unfollow(request,username):
	if request.is_ajax():
		if request.method=='POST':
			ship_from=request.user
			ship_to=get_object_or_404(User,username=username)
			Friendship.objects.get(Q(ship_from=ship_from) & Q(ship_to=ship_to)).delete()
			flag=_sm(ship_to,ship_from)
			return HttpResponse(simplejson.dumps({'flag':flag}))
		return HttpResponse(simplejson.dumps({'flag':'failure'}))
	else:
		raise Http404('Sorry! Wrong number.')
def _broadcast(who,did,what,words=''):
	'''generate a new blog'''
	news=Blog.objects.create(**locals())
	news.save()
	return news
#######################################################################################
##--------------------=_=-my generic view classes as follows:------------------------##
##---------------------------------just for practice---------------------------------##
#######################################################################################
class ffListView(ListView):
	'''list of fans or folloows 
	'''
	context_object_name='users'
	template_name='sns/users_list.html'
	def get_queryset(self):
		if self.kwargs['ff']=='fans':
			return User.objects.filter(fan_net__ship_to__username__iexact=self.kwargs['username'])
		elif self.kwargs['ff']=='follows':
			return User.objects.filter(star_net__ship_from__username__iexact=self.kwargs['username'])
		else:
			raise Http404
	def get_context_data(self,**kwargs):
		context=super(ffListView,self).get_context_data(**kwargs)
		if self.request.user.is_authenticated():
			its_me=self.request.user.username==self.kwargs['username']
		else:
			its_me=False
		if self.kwargs['ff']=='fans':
			context['title']=its_me and u'My fans' or self.kwargs['username']+u'的粉丝'
		elif self.kwargs['ff']=='follows':
			context['title']=its_me and u'我关注的人' or self.kwargs['username']+u'关注的人'
		else:
			raise Http404
		return context
		
		