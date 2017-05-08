from maps.models import *

from rest_framework import serializers

class UserBioSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBio
        fields = ['bio']
    
class UserProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserProfilePicture
        fields = ['id','active']

class AdventureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adventure
        fields= ['id','name','advType','advStatus']

class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields= ['id','name']
        
class PictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Picture
        fields = ['id','album','caption','filename','uploadTime']
        
class AlbumSerializer(serializers.ModelSerializer):
    pictures = PictureSerializer(source="picture_set",many=True)

    class Meta:
        model = Album
        fields = ['id','adv','advMap','title','pictures']


