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

class PicMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PicMeta
        fields = ['picture','lat','lng','ts']
        
class PictureSerializer(serializers.ModelSerializer):
    picMeta = PicMetaSerializer(source='picmeta')
    
    class Meta:
        model = Picture
        fields = ['id','album','caption','uploadTime','picMeta']
        
class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id','adv','advMap','title']


class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = "__all__"

class GearListSerializer(serializers.ModelSerializer):
    #children = self(source='children',many=True)
    text  = serializers.CharField(source='name')

    class Meta:
        model = GearItem
        fields = ['id','text','children']

    #This overrides the defult constructor, adding the children field....
    def get_fields(self):
        fields = super(GearListSerializer, self).get_fields()
        fields['children'] = GearListSerializer(many=True)
        return fields


class GearListSerializer2(serializers.ModelSerializer):   
    text  = serializers.CharField(source='name')

    class Meta:
        model = GearItem
        fields = ['id','parent','text','weight','weightUnit']


class GearPictureTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = GearPictureTag
        fields="__all__"
        
class GearPictureSerializer(serializers.ModelSerializer):
    tags = GearPictureTagSerializer(source = 'gearpicturetag_set',many=True)
    class Meta:
        model = GearPicture
        fields = ['id','adv','uploadTs','default','tags']


