from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.contrib.auth.models import User
from django.template import RequestContext, loader, Context
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q, Count, Avg
from django.utils import simplejson
from django.core.paginator import Paginator

#mine as below
from bookmark.forms import *
from bookmark.models import *
from event.models import *
from sns.models import *
from sns.views import _broadcast
import re
################################################################################################
##-----------------------------the view functions as follows:)--------------------------------##
##--------------------------[copyright:chillicomputer@gmail.com]------------------------------##
################################################################################################
@login_required
def home(request):
	user=request.user
	blogs=Blog.objects.filter(Q(who__star_net__ship_from=user)|Q(who=user)).distinct()[:50]
	variables={
		'blogs':blogs
	}
	return render_to_response('home_blog.html',variables,
	context_instance=RequestContext(request))

def main_index(request):
	if request.user.is_authenticated():
		return home(request)
	return get_latest(request)
def get_latest(request,msg=None):
	logined=request.user.is_authenticated()
	bookmarks=Bookmark.objects.all()
	if logined:
		bookmarks=_check_favor(request.user,bookmarks)
		bookmarks=_check_rating(request.user,bookmarks)
	variables={
		'bookmarks':bookmarks,
		'show_tags':True,
		'show_user':True,
		'title':u'随便看看',
		'form':login_form(request)
	}
	if msg:
		variables.update({'msg':msg})
	return render_to_response(logined and 'home_latest.html' or 'bm_list.html',variables,
	context_instance=RequestContext(request))
def get_adds(request,username):
	bookmarks=Bookmark.objects.filter(Q(user__username=username))
	title=username+u'添加的书签'
	show_user=True
	if request.user.is_authenticated():
		if request.user.username==username:
			can_edit=True
			show_user=False
			title=u'我添加的书签'
		else:
			can_edit=False
			bookmarks=_check_favor(request.user,bookmarks)#if I favored?
		bookmarks=_check_rating(request.user,bookmarks)
	variables={
		'bookmarks':bookmarks,
		'show_tags':True,
		'show_user':show_user,
		'title':title
	}
	if locals().has_key('can_edit'):
		variables.update({'can_edit':can_edit})
	return render_to_response('bm_list.html',variables,
	context_instance=RequestContext(request))
def get_favors(request,username):
	bookmarks=Bookmark.objects.filter(Q(favored_item__user__username=username))
	title=username+u'收藏的书签'
	if request.user.is_authenticated():
		if not request.user.username==username:
			bookmarks=_check_favor(request.user,bookmarks)
		else:
			title=u'我收藏的书签'
		bookmarks=_check_rating(request.user,bookmarks)
	variables={
		'bookmarks':bookmarks,
		'show_tags':True,
		'show_user':True,
		'title':title
	}
	return render_to_response('bm_list.html',variables,
	context_instance=RequestContext(request))

def _check_favor(user,bookmarks):
	for bookmark in bookmarks:
		bookmark.is_favored=bookmark.favored_item.filter(user=user) and True or False
	return bookmarks
def _check_rating(user,bookmarks):
	for bookmark in bookmarks:
		is_rated=bookmark.rated_item.filter(user=user)
		bookmark.user_rating=is_rated and is_rated[0].score or 0
	return bookmarks
'''
def log_in(request):
	if request.method=='POST':
		lf=login_form(request.POST)
		if lf.is_valid():
			user=authenticate(username=lf.cleaned_data['username'],password=lf.cleaned_data['pwd'])
			login(request,user)
			return HttpResponseRedirect('/home/')
		else:
			msg=lf.errors.values()[0][0]
	else:
		lf=login_form()
		msg=None
	return render_to_response('login.html',{'form':lf},
	context_instance=RequestContext(request))
'''
def log_out(request):
	logout(request)
	return HttpResponseRedirect('/')

def register(request):
	#use the data in request to create a new account
		ajax = request.is_ajax()
		if request.method=='POST':
			form=register_form(request.POST)
			if form.is_valid():
				username=form.cleaned_data['username']
				password=form.cleaned_data['pwd']
				email=form.cleaned_data['email']
				user=User.objects.create_user(
					username=username,
					password=password,
					email=email
				)
				if request.user.is_authenticated():
					# if there's been a user logged in, log out it.But is it to draw snakes with feet?
					logout(request)
				user=authenticate(username=username,password=password)
				login(request,user)#let the just now registerd log in
				return _register_ok_page(request)
		elif request.GET.has_key('username'):
			if ajax:
				username=request.GET['username']
				form=register_form({'username':username})
				error=form.errors.get('username',None)
				if error:
					error=form.errors['username'][0]
				return HttpResponse(simplejson.dumps({'error':error}))
			else:
				raise Http404('Not found')
		elif request.GET.has_key('email'):
			if ajax:
				email=request.GET['email']
				form=register_form({'email':email})
				error=form.errors.get('email',None)
				if error:
					error=form.errors['email'][0]
				return HttpResponse(simplejson.dumps({'error':error}))
			else:
				raise Http404('Not found')
		else:
			form=register_form()
		if ajax:
			return render_to_response('register_form.html',{'form':form},
			context_instance=RequestContext(request))
		return render_to_response('register.html',{'form':form},
		context_instance=RequestContext(request))

def _register_ok_page(request):
	
	return render_to_response('register_ok.html',{},
	context_instance=RequestContext(request))

def _bookmark_save(request,form):
	link,dummy=Link.objects.get_or_create(url=form.cleaned_data['url'])
	bookmark,created=Bookmark.objects.get_or_create(
		user=request.user,
		link=link
	)
	bookmark.title=form.cleaned_data['title']
	bookmark.info=form.cleaned_data['info']
	if not created:
		bookmark.tags.clear()
	tags=form.cleaned_data['tags'].split()
	for tag in tags:
		tag,dummy=Tag.objects.get_or_create(name=tag)
		bookmark.tags.add(tag)
	bookmark.save()
	return bookmark,created

@login_required
def bookmark_save(request):
	'''
	return a blank form for users to create a new bookmark.
	or create bookmark according to the POST data.
	'''
	ajax=request.is_ajax()
	if request.method=='POST':
		dataForm=bm_make_form(request.POST)
		if dataForm.is_valid():
			bookmark,created=_bookmark_save(request,dataForm)
			if created:
				#generate a new blog
				news=_broadcast(request.user,'A',bookmark,bookmark.info)
			if ajax:
				#only a request editting this bookmark can be a ajax request
				variables={
					'bookmarks':[bookmark],
					'show_tags':True,
					'ignore_statistics':True
				}
				return render_to_response('bookmarks_show.html',variables)
			else:
				#if not a ajax request, it must be a request adding bookmark, so redirect to 'bm_save_ok.html'
				variables={
					'bookmark':bookmark,
					'created':created
				}
				return render_to_response('bm_save_ok.html',variables,
				context_instance=RequestContext(request))
		else:
			title=u'请检查表单'
			if ajax:
				return HttpResponse('failure')
	elif request.GET.has_key('url'):
		try:
			url=request.GET['url']
			link=get_object_or_404(Link,url=url)
			bookmark=Bookmark.objects.get(link=link,user=request.user)
			title=bookmark.title
			info=bookmark.info
			tags=' '.join(tag.name for tag in bookmark.tags.all())
			dataForm=bm_make_form({
				'url':url,
				'title':title,
				'tags':tags,
				'info':info
			})
			title=u'修改书签'
		except ObjectDoesNotExist:
			raise Http404('Wrong number!')
	else:
		dataForm=bm_make_form()
		title=u'添加书签'
	variables={
		'form':dataForm,
		'title':title
	}
	if ajax:
		return render_to_response('bookmark_edit.html',variables)
	else:
		return render_to_response('bookmark_add.html',variables,
		context_instance=RequestContext(request))


def tag_page(request,tag):
	title=u'贴有“'+tag+u'”标签的书签'
	tag=get_object_or_404(Tag,name=tag)
	bookmarks=tag.to_bm.order_by('-id')
	if request.user.is_authenticated():
		bookmarks=_check_favor(request.user,bookmarks)
		bookmarks=_check_rating(request.user,bookmarks)
	variables={
		'title':title,
		'bookmarks':bookmarks,
		'show_tags':True,
		'show_user':True
	}
	return render_to_response('bm_list.html',variables,
	context_instance=RequestContext(request))

def _tag_cloud(tags):
	MAX_WEIGHT=5
	#calulate the tags' counts, then weight them
	min=max=tags[0].to_bm.count()
	for tag in tags:
		tag.count=tag.to_bm.count()
		if tag.count<min:
			min=tag.count
		if tag.count>max:
			max=tag.count
	range=float(max-min)
	if range==0:
		range=1
	for tag in tags:
		tag.weight=int(MAX_WEIGHT*(tag.count-min)/range)
	return tags

def tag_show(request):
	'''
	show a tag-cloud
	'''
	tags=_tag_cloud(Tag.objects.order_by('name'))
	variables={
		'tags':tags
	}
	return render_to_response('tag_show.html',variables,
	context_instance=RequestContext(request))

def search_page(request):
	if request.GET.has_key('query'):
		query=request.GET['query']
		form=search_form({'query':query})
		words=_process_query(query)
		regex=r'.*(' + '|'.join(words) + r').*'
		if not request.GET.has_key('user'):
			#filter bookmarks by title or tag
			bookmarks=Bookmark.objects.filter(Q(title__iregex=regex)|Q(tags__name__iregex=regex))\
			.distinct().order_by('-id')
			bm_result_num=bookmarks.count()
			#if favored, rated or followed?
			if request.user.is_authenticated():
				bookmarks=_check_favor(request.user,bookmarks)
				bookmarks=_check_rating(request.user,bookmarks)
			#pagination
			bmPages=Paginator(bookmarks,25)
			try:
				index=int(request.GET.get('page','1'))
			except ValueError:
				index=1
			try:
				bookmarks=bmPages.page(index)
			except (EmptyPage,InvalidPage):
				bookmarks=bmPages.page(bmPages.num_pages)
		if not request.GET.has_key('bookmark'):
			#filter users by username
			users=User.objects.filter(username__iregex=regex).order_by('-id')
			u_result_num=users.count()
			#pagination
			uPages=Paginator(users,25)
			try:
				index=int(request.GET.get('page','1'))
			except ValueError:
				index=1
			try:
				users=uPages.page(index)
			except (EmptyPage,InvalidPage):
				users=uPages.page(uPages.num_pages)
	else:
		form=search_form()
		words=' '
	variables={
		'form':form,
		'words':words,
		'bookmarks_page':locals().get('bookmarks',None),
		'users_page':locals().get('users',None),
		'show_tags':True,
		'show_user':True,
		'need_highlight':True,
		'bnum':locals().get('bm_result_num',0),
		'unum':locals().get('u_result_num',0)
	}
	return render_to_response('search.html',variables,
	context_instance=RequestContext(request))
def _process_query(query):
	query=query.strip().split(' ')
	meta=re.compile(r'(?P<meta>[\.\^\$\*\+\?\{\}\[\]\\\|\(\)])')
	#if a word contain meta-syntax of regex, say "^_^\\", escape it by adding a "\"
	return [meta.sub(r'\\\g<meta>',word) for word in query]
def bm_entry(request,bm_id):
	'''
	define a view function to return a page of one bookmark-entry,q
	with a preview of that bookmarks's url.
	'''
	bookmark=get_object_or_404(Bookmark,id=bm_id)
	comments=bookmark.comment.all().order_by('-id')
	if request.user.is_authenticated():
		is_rated=bookmark.rated_item.filter(user=request.user)#has this user already rated?
		RON=is_rated and is_rated[0].score or 0#rated or not
		FON=bookmark.favored_item.filter(user=request.user).count()#favored or not

	variables={
		'bookmark':bookmark,
		'FON':locals().get('FON',0),
		'RON':locals().get('RON',0),
		'comments':comments
	}
	return render_to_response('bookmark_entry.html',variables,
	context_instance=RequestContext(request))
	
