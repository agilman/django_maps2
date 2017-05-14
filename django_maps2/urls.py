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


from maps import views
from maps import api

urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'^auth/', include('registration.backends.simple.urls')),

    #landing page
    url(r'^$', views.landing),

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
    url(r'^api/rest/advAlbums/(?P<advId>\d+)/$',api.advAlbums),
    url(r'^api/rest/pictures/(?P<albumId>\d+)/$',api.pictures),
    url(r'^api/rest/deletePictures/(?P<albumId>\d+)/$',api.deletePictures), #why do I need albumId?
    url(r'^api/rest/geotagPictures$',api.geotagPictures),
]
