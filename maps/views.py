from django.shortcuts import render, redirect
from django.contrib.auth.models import User

from django.http import HttpResponse
from django.conf import settings

from django.contrib.auth import login
from maps import forms
                        
def getUserIdFromUserName(userName):
    try:
        user = User.objects.get(username=userName)
        return user.pk
    except User.DoesNotExist:
        return 0
    
# Create your views here.
def landing(request):
    if request.user.is_authenticated:
        return render(request,"landing-session.html")
    return render(request,"landing.html")


def profileViewer(request,userName):
    userId = getUserIdFromUserName(userName)

    context = {'userId':userId,'userName':userName}

    if userId:
        if request.user.is_authenticated:

            return render(request,"profile-viewer-session.html",context)

        return render(request,"profile-viewer.html",context)
    else:
        return HttpResponse("User does not exist.")

def editorViewer(request):
    context = {'mapboxToken': settings.MAPBOX_TOKEN,
               'userId':request.user.pk,
               'userName': request.user.username}
    
    if request.user.is_authenticated:

        return render(request,"profile-editor-session.html", context=context)

    return render(request,"profile-editor.html")

def goIRC(request):
    return render(request,"goIRC.html")
