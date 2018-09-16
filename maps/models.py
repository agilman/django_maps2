from django.db import models

# Create your models here.

from django.conf import settings

from mptt.models import MPTTModel, TreeForeignKey

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
    
class Map(models.Model):
    adv = models.ForeignKey(Adventure,on_delete=models.CASCADE,related_name="maps")
    name = models.CharField(max_length=32)
    
    def total_distance(self):
        return self.segments.all().aggregate(models.Sum('distance'))['distance__sum']

class MapSegment(models.Model):
    map = models.ForeignKey(Map,on_delete=models.CASCADE, related_name="segments")
    startTime = models.DateTimeField(null=True)
    endTime = models.DateTimeField(null=True)
    distance = models.IntegerField()
    delay = models.IntegerField()

class WayPoint(models.Model):
    segment = models.ForeignKey(MapSegment,on_delete=models.CASCADE, related_name="coordinates")
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    
    def __str__(self):
        return '[%s,%s]' %(self.lat,self.lng)

class DayNote(models.Model):
    segment = models.ForeignKey(MapSegment,on_delete=models.CASCADE, related_name="dayNotes")
    note = models.CharField(max_length=512)

class Album(models.Model):
    adv = models.ForeignKey(Adventure, on_delete=models.CASCADE, related_name="albums")
    advMap = models.ForeignKey(Map, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=32)
                            
class Picture(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    caption = models.CharField(max_length=512,null=True)
    uploadTime = models.DateTimeField()

class PicMeta(models.Model):
    picture = models.OneToOneField(Picture,on_delete=models.CASCADE)
    #maybe Point type is more appropriate for GIS.
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    ts = models.DateTimeField(null=True)
    
class Blog(models.Model):
    adv = models.ForeignKey(Adventure, on_delete=models.CASCADE)
    map = models.ForeignKey(Map,on_delete=models.CASCADE)
    title = models.CharField(max_length=128)
    entry = models.CharField(max_length=4096)
    saveTime = models.DateTimeField()
    status = models.IntegerField() #1 = published, 2=draft

class RefItem(models.Model):
    name = models.CharField(max_length=32)
    asin = models.CharField(max_length=13,null=True)
    weight = models.FloatField(null=True)
    weightUnit = models.CharField(max_length=2,null=True)  #g, kg,  oz, lb
    
class GearItem(MPTTModel):
    adv = models.ForeignKey(Adventure,on_delete=models.CASCADE)
    ref = models.ForeignKey(RefItem,on_delete=models.CASCADE,null=True)
    parent = TreeForeignKey('self', null=True, related_name='children', db_index=True, on_delete=models.CASCADE)
    
    name = models.CharField(max_length=32)
    weight = models.FloatField(null=True)
    weightUnit = models.CharField(max_length=2,null=True)  #g, kg,  oz, lb
    

    
class GearPicture(models.Model):
    adv = models.ForeignKey(Adventure, on_delete=models.CASCADE)
    uploadTs = models.DateTimeField()
    default = models.BooleanField()
    
class GearPictureTag(models.Model):
    gearPic = models.ForeignKey(GearPicture, on_delete=models.CASCADE)
    gearItem = models.ForeignKey(GearItem, on_delete=models.CASCADE)
    x = models.FloatField()
    y = models.FloatField()
    text = models.CharField(max_length=32)
