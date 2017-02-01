from django.shortcuts import render
from django.contrib.auth.models import User

from django.http import HttpResponse

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
        print("profile-viewer-session")
        return render(request,"profile-viewer-session.html")
    print("profile-viewer")
    return render(request,"profile-viewer.html")

def editorViewer(request):
    if request.user.is_authenticated():
        print("profile-editor-session")
        return render(request,"profile-editor-session.html")
    print("profile-editor")
    return render(request,"profile-editor.html")
