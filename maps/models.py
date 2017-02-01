from django.db import models

# Create your models here.

from django.conf import settings


# Create your models here.
class UserBio(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,)
    bio = models.CharField(max_length=2048)
    

class UserProfilePicture(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,)
    uploadTime = models.DateTimeField()
    active = models.BooleanField()

class Adventure(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,
                              on_delete=models.CASCADE,)
    name = models.CharField(max_length=32)
    advType = models.IntegerField()
    advStatus = models.IntegerField()
    
