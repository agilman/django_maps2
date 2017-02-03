from django.shortcuts import render
from django.contrib.auth.models import User

from django.http import HttpResponse
from django.conf import settings  

def getUserIdFromUserName(userName):
    user = User.objects.get(username=userName)
    #TODO error handling...
    return user.pk

# Create your views here.

def landing(request):
    if request.user.is_authenticated():
        return render(request,"landing-session.html")
    return render(request,"landing.html")


def profileViewer(request,userName):
    if request.user.is_authenticated():

        return render(request,"profile-viewer-session.html")

    return render(request,"profile-viewer.html")

def editorViewer(request):
    context = {'mapboxToken': settings.MAPBOX_TOKEN}
    
    if request.user.is_authenticated():

        return render(request,"profile-editor-session.html", context=context)

    return render(request,"profile-editor.html")
