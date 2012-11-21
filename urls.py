from django.conf import settings
from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
from django.views.generic.base import TemplateView
from bookmark.views import *
from event.views import *
from sns.views import *
from bookmark.forms import login_form

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
	#the main page,one for anonymous and the other for logged-in users.
    url(r'^$',main_index),
	url(r'^home/$',home),
	url(r'^contact_page',TemplateView.as_view(template_name='contact_page.html')),
	#browser
	url(r'^bookmark/(?P<bm_id>\d+)/$',bm_entry),
	url(r'^search/$',search_page),
	url(r'^user/(?P<username>\w+)/$',user_entry,name='user'),
	url(r'^user/(?P<username>\w+)/(?P<ff>fans|follows)/$',ffListView.as_view(),name='call_relation'),
	url(r'^adds/(?P<username>\w+)/$',get_adds,name='call_adds'),
	url(r'^favors/(?P<username>\w+)/$',get_favors,name='call_favors'),
	url(r'^slobber/(?P<username>\w+)/$',get_slobbers,name='call_slobber'),
	url(r'^latest/$',get_latest),
	#to log in/out or register
	url(r'^login/$','django.contrib.auth.views.login',{'template_name':'login.html',
	'authentication_form':login_form}),
	url(r'^logout/$',log_out),
	url(r'^register/$',register),
	#bookmark management
	url(r'^bookmark/save/$',bookmark_save),
	url(r'^tag/(?P<tag>[^\s]+)/$',tag_page),
	url(r'^tags/$',tag_show),
	#user interactives
	url(r'^rating/(?P<content_type>\w+\.\w+)/(?P<obj_id>\d+)/(?P<score>[1-5])/$',rater,name='object_rater'),
	url(r'^favoring/(?P<content_type>\w+\.\w+)/(?P<obj_id>\d+)/$',collector,name='object_collector'),
	url(r'^talk/$',talk),
	url(r'^comment/(?P<app_model>\w+\.\w+)/(?P<obj_id>\d+)/$',comment,name='comment_page'),
	#sns
	url(r'^avatar/update/$',av_update),
	url(r'^avatar/editor/$',av_edit),
	#url(r'^portrait/$',portrait_set),
	url(r'^nickorsign/$',ns_update),
	url(r'^follow/(?P<username>\w+)/$',follow,name='follow'),
	url(r'^unfollow/(?P<username>\w+)/$',unfollow,name='unfollow'),
	# Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
if settings.DEBUG:
    urlpatterns += patterns('',
		url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
			'document_root': settings.MEDIA_ROOT,
		}),
)
