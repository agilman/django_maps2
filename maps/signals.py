
#print("OK, imported signal handling")
from registration.signals import user_registered
import os
from django_maps2 import settings


#This callback is listening for user to register. Creates directories for user images.
def postRegistration(sender,user,request, **kwargs):
    media_root = settings.USER_MEDIA_ROOT
    if not os.path.exists(media_root +"/"+ str(user.pk)):
        os.mkdir(media_root + "/" + str(user.pk))
        os.mkdir(media_root + "/" + str(user.pk)+"/profile_pictures")
           
    #print("hello, got user registration signal")

user_registered.connect(postRegistration)

