from maps.models import *
from maps.serializers import *
from maps.forms import ProfilePhotoUploadForm

from django.http import JsonResponse
from collections import OrderedDict

from django.contrib.auth.models import User

from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt

from django_maps2 import settings

from datetime import datetime

import pytz
import os

@csrf_exempt
def userInfo(request,userId=None):
    if request.method == 'GET':
        adventures = Adventure.objects.filter(owner_id=userId)
        advSerializer = AdventureSerializer(adventures,many=True)
        
        bio = UserBio.objects.filter(user=userId).first()
        bioSerializer = None
    
        if type(bio)!=type(None):
            bioSerializer = UserBioSerializer(bio,many=False).data
            
        userPicture = UserProfilePicture.objects.filter(user=userId)
        userPicData = None
        if type(bio)!=type(None):
            bioSerializer = UserBioSerializer(bio,many=False).data
            
            userPicture = UserProfilePicture.objects.filter(user=userId)
            userPicData = None
            
        if type(userPicture)!=type(None):
            userPicData = UserProfilePictureSerializer(userPicture,many=True).data
            
        total = {"adventures":advSerializer.data,"bio":bioSerializer,"profile_pictures":userPicData}
        return JsonResponse(total, safe=False)

    elif request.method == 'POST': #NO PUT,Only POST
        data = JSONParser().parse(request)
        user = User.objects.get(pk=int(data["userId"]))
        
        #check if exists:
        bioQuery = UserBio.objects.filter(user=user)
        bio = None
        if bioQuery.exists():
            bioQuery.update(bio=data["bio"])
        
            bio = bioQuery.first()
        
        else:
            
            bio = UserBio(user=user,bio=data["bio"])
            bio.save()
        
        serialized = UserBioSerializer(bio)
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt
def adventures(request,advId=None):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        print(data)
        user = User.objects.get(pk=int(data["owner"]))
        
        advName = data["name"]
        advType = data["advType"]
        advStatus = data["advStatus"]
        
        #If advStatus = active, need to unset previous active.
        
        adv = Adventure(name=advName,owner=user,advType=advType,advStatus=advStatus)
        adv.save()

        serialized = AdventureSerializer(adv)
        return JsonResponse(serialized.data,safe=False)

    elif request.method == "DELETE":
        advToDel = Adventure.objects.get(pk=advId)
        advToDel.delete()
        serialized = AdventureSerializer(advToDel)
        
        #TODO Probably should return success code instead of object...
        return JsonResponse([],safe=False)
    
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        owner = User.objects.get(pk=int(data["owner"]))
        
        advName = data["name"]
        advType = data["advType"]
        advStatus = data["advStatus"]
        
        #If advStatus = active, need to unset previous active.
        
        adv = Adventure(id=advId,name=advName,owner=owner,advType=advType,advStatus=advStatus)
        adv.save()
        
        serialized = AdventureSerializer(adv)
    return JsonResponse(serialized.data,safe=False)

def handle_uploaded_file(userId,f):
    #write file as is, convert to decided format, add to db,  delete old ?
    
    #save file as is
    target = settings.USER_MEDIA_ROOT+'/'+str(userId)+'/profile_pictures/'+f.name
    
    with open(target, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
            
    #convert,resize,thumbs

    #add to db
    user = User.objects.get(pk=int(userId))
    my_date = datetime.now(pytz.timezone('US/Pacific'))
    profilePicture = UserProfilePicture(user=user,uploadTime=my_date,active=True)
    profilePicture.save()
    
    #temp solution... need to convert to target file with right extension, and then delete the old file.
    #rename
    newName = settings.USER_MEDIA_ROOT+'/'+str(userId)+'/profile_pictures/'+str(profilePicture.id)+".png"
    os.rename(target,newName)

    
    return profilePicture

@csrf_exempt
def profilePhoto(request):
    if request.method == 'POST':
        
        form = ProfilePhotoUploadForm(request.POST,request.FILES)
        if form.is_valid():
            userId = form.data['userId']
            f = request.FILES['file']
            userPic = handle_uploaded_file(userId,f)
            
            return JsonResponse({"picId":userPic.id},safe=False)
        

@csrf_exempt
def advMaps(request,advId=None):
    if request.method == 'GET':
        queryset = Map.objects.filter(adv=advId)
        results = []
        # TODO Write a serializer...
        for i in queryset.all():
            myMap = {"id":i.id,"name":i.name,"distance":i.total_distance()}
            results.append(myMap)
            
        return JsonResponse(results,safe=False)

    if request.method == 'POST':
        data = JSONParser().parse(request)
        adv = Adventure.objects.get(id=int(data["advId"]))
        map = Map(name=data["name"],adv=adv)
        
        map.save()
        
        #Hmm, maybe I should just get a serializer...
        result = {"id":map.id,"name":map.name,"features":[],"distance":0 }
        return JsonResponse(result,safe=False)
    
