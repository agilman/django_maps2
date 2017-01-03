from django.shortcuts import render

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
