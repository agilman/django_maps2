from django.shortcuts import render

# Create your views here.

def landing(request):
    if request.user.is_authenticated():
        return render(request,"landing-session.html")
    return render(request,"landing.html")
