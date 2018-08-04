"""django_maps2 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views

from maps import views
from maps import api

urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'^auth/register/$', views.registration),
    url(r'^auth/login/$', auth_views.login, {'template_name': 'reg/login2.html'}, name='login'),
    url(r'^auth/', include('registration.backends.simple.urls')),

    #landing page
    url(r'^$', views.landing),

    #irc mibbit embedded
    url(r'^goIRC/$', views.goIRC),
    #Profile SPA entry
    url(r'^users/(?P<userName>[\w\-]+)/$',views.profileViewer),

    #Editor SPA entry
    url(r'editor/$',views.editorViewer),

    #API
    url(r'^api/rest/userInfo/(?P<userId>\d+)/$',api.userInfo),
    url(r'^api/rest/adventures/$',api.adventures),
    url(r'^api/rest/adventures/(?P<advId>\d+)/$', api.adventures),
    url(r'^api/rest/advMaps/(?P<advId>\d+)/$',api.advMaps),
    url(r'^api/rest/advsOverview/(?P<userId>\d+)/$',api.advsOverview),
    url(r'^api/rest/profilePhoto/$',api.profilePhoto),
    url(r'^api/rest/map/(?P<mapId>\d+)/$',api.map),
    url(r'^api/rest/mapsOverview/(?P<advId>\d+)/$',api.mapsOverview),
    url(r'^api/rest/mapSegment$', api.mapSegment),
    url(r'^api/rest/advMapSegments/(?P<advId>\d+)$',api.advMapSegments),
    url(r'^api/rest/advAlbums/(?P<advId>\d+)/$',api.advAlbums),
    url(r'^api/rest/pictures/(?P<advId>\d+)/(?P<albumId>\d+)/$',api.pictures),
    url(r'^api/rest/advPictures/(?P<advId>\d+)/$',api.advPictures), #get only, used in viewer.
    url(r'^api/rest/deletePictures/(?P<advId>\d+)/(?P<albumId>\d+)/$',api.deletePictures), #why do I need albumId?
    url(r'^api/rest/blogs/$',api.blogs),
    url(r'^api/rest/blogs/(?P<mapId>\d+)/$',api.blogs),
    url(r'^api/rest/blogs/(?P<mapId>\d+)/(?P<blogId>\d+)/$',api.blogs),
    url(r'^api/rest/geotagPictures$',api.geotagPictures),
    url(r'^api/rest/gear/(?P<advId>\d+)/$',api.gear),
    url(r'^api/rest/gear/(?P<advId>\d+)/(?P<itemId>\d+)/$',api.gear),
    url(r'^api/rest/gearPictures/(?P<advId>\d+)/$',api.gearPictures),
    url(r'^api/rest/gearPictureTags/(?P<picId>\d+)/$',api.gearPictureTags),
]
